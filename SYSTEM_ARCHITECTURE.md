# 🏗️ Sportsman.ke — Complete System Architecture & Operational Logic

Welcome to the comprehensive architectural and system logic specification for **Sportsman.ke**, Kenya's premier omnichannel sports apparel, footwear, and equipment retail platform.

This document provides a complete deep-dive into the technical stack, database design, transaction state machines, dual-channel inventory synchronization, and operational workflows powering the system.

---

## 📑 Table of Contents
1. [Executive Overview & Business Logic](#1-executive-overview--business-logic)
2. [High-Level Architecture Diagram](#2-high-level-architecture-diagram)
3. [Technology Stack](#3-technology-stack)
4. [Dual-Channel Commerce Logic (Online vs Walk-in POS)](#4-dual-channel-commerce-logic-online-vs-walk-in-pos)
5. [Inventory Synchronization & Pessimistic Locking](#5-inventory-synchronization--pessimistic-locking)
6. [M-Pesa Daraja STK Push & Payment Webhooks](#6-m-pesa-daraja-stk-push--payment-webhooks)
7. [Role-Based Access Control (RBAC) & Order Lifecycle](#7-role-based-access-control-rbac--order-lifecycle)
8. [Inventory Demand Forecasting & Sales Planning](#8-inventory-demand-forecasting--sales-planning)
9. [Marketing Feeds & Progressive Web App (PWA)](#9-marketing-feeds--progressive-web-app-pwa)
10. [Corporate Quotation & Proforma Engine](#10-corporate-quotation--proforma-engine)
11. [Database Schema & Entity Relationships](#11-database-schema--entity-relationships)
12. [Environment Configuration & Deployment](#12-environment-configuration--deployment)

---

## 1. Executive Overview & Business Logic

**Sportsman.ke** operates as an **Omnichannel Sports Retailer** based in Nairobi, Kenya:
1. **Digital Storefront (`CustomerPortal.jsx`)**: Serves retail and bulk customers across all 47 counties of Kenya with home and parcel delivery.
2. **Physical Nairobi Shop (`WalkInPosModal.jsx`)**: A brick-and-mortar retail counter welcoming walk-in customers who purchase gear directly off the shelf.

### Core Business Imperative
Prior to omnichannel synchronization, physical store sales risked creating "phantom inventory" online—a walk-in customer could buy the last pair of football boots at the counter while an online shopper in Mombasa simultaneously placed an order for the same pair.

To resolve this, the system enforces **Real-Time Single-Source-of-Truth Inventory Tracking**:
- Every walk-in sale immediately decrements warehouse stock.
- Row-level database write locks (`SELECT FOR UPDATE`) prevent race conditions during high-traffic flash sales.
- POS thermal receipts with 16% KRA VAT breakdown are generated instantly at the counter.

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Clients
        Web[Online Shoppers Desktop/Mobile]
        WalkIn[Physical Walk-in Nairobi Clients]
        AdminUser[Admin / Store Clerk / Staff]
    end

    subgraph Frontend [React 19 + Vite + Tailwind CSS]
        Storefront[Storefront & Wishlist]
        Cart[Checkout & County Delivery Engine]
        POSModal[In-Store Walk-in POS Modal]
        AdminDash[Admin & Sales Planning Dashboard]
        ThermalPrint[POS Thermal 80mm Printer Engine]
    end

    subgraph Backend [NestJS 10 REST API]
        AuthGuard[JWT Auth & RBAC Guards]
        OrderModule[Order & Transaction Service]
        ProductModule[Product & Inventory Service]
        MpesaModule[Safaricom Daraja STK Service]
        FeedModule[Meta XML & Google XML Feeds]
    end

    subgraph Data [Persistence Layer]
        DB[(PostgreSQL / SQLite via TypeORM)]
        Storage[(Supabase Object Storage)]
    end

    Web -->|Browse / Buy| Storefront
    Storefront --> Cart
    Cart -->|POST /orders| OrderModule
    WalkIn -->|Visit Shop| AdminUser
    AdminUser -->|Record Sale| POSModal
    POSModal -->|POST /orders salesChannel=walk_in| OrderModule
    POSModal -->|Generate Receipt| ThermalPrint
    AdminDash -->|View Analytics & Forecasts| ProductModule
    OrderModule -->|Pessimistic Row Lock| DB
    ProductModule --> DB
    MpesaModule -->|STK Push / Callback| Web
    MpesaModule --> DB
```

---

## 3. Technology Stack

### Frontend Application (`frontend/`)
- **Framework**: React 19 with Vite 8.
- **Styling**: Tailwind CSS v4 with custom dark mode glassmorphism (`#080B11`, `#0D1321`).
- **Icons**: Lucide React.
- **State Management**: React Context (`AppContext.jsx`, `AuthContext.jsx`) with automatic `localStorage` synchronization for cart, wishlist, and offline resilience.
- **Printing Utilities**: Native browser print APIs tailored for:
  - 80mm ESC/POS thermal receipt rolls (`posReceiptPrinter.js`).
  - Standard A4 corporate quotations and invoices (`QuotationPrintView.jsx`).
  - Courier parcel shipping waybills (`waybillPrinter.js`).

### Backend Server (`backend/`)
- **Framework**: NestJS 10 (TypeScript).
- **ORM**: TypeORM with multi-database support (PostgreSQL via Supabase for production; SQLite for zero-config offline staging).
- **Concurrency Control**: Pessimistic write locks (`lock: { mode: 'pessimistic_write' }`) inside transactional entity managers.
- **Rate Limiting**: `@nestjs/throttler` protecting against brute-force attacks on login and payment initiation endpoints.
- **Security**: Argon2/Bcrypt password hashing, JWT authentication tokens with HTTP-only cookie support.

---

## 4. Dual-Channel Commerce Logic (Online vs Walk-in POS)

The system clearly differentiates orders by channel using the `salesChannel` attribute:

| Channel Property | Walk-in Counter Sale (`walk_in`) | Online Web Order (`online`) |
| :--- | :--- | :--- |
| **Origin Point** | Physical Nairobi Shop counter | Online website storefront |
| **Initial Status** | `Delivered` (Immediate hand-to-hand delivery) | `Pending Payment` (M-Pesa) or `Paid` |
| **Shipping Fee** | KES 0 (Collected in person) | Calculated based on County distance |
| **Payment Options** | Cash, In-Store M-Pesa Till, Card | M-Pesa STK Push, Card, WhatsApp Checkout |
| **Customer Info** | Optional phone/name for receipt tracking | Full shipping address, county, sub-county |
| **Receipt Output** | Instant 80mm thermal receipt (`printPosReceipt`) | Digital order receipt & printable waybill |
| **Inventory Effect** | Instant deduction at the counter | Instant deduction locked during checkout |

---

## 5. Inventory Synchronization & Pessimistic Locking

To guarantee that stock is never oversold:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Online Client / POS Clerk
    participant App as React Frontend
    participant Server as NestJS OrderService
    participant DB as Database (PostgreSQL)

    Customer->>App: Submits Order / Walk-in Sale
    App->>Server: POST /api/orders (cart items, salesChannel)
    Note over Server,DB: START TRANSACTION
    loop For each item in cart
        Server->>DB: SELECT * FROM product WHERE id = ? FOR UPDATE
        Note over DB: Row locked against concurrent edits
        DB-->>Server: Product record (stockQuantity)
        alt stockQuantity < requestedQuantity
            Server-->>App: 400 Bad Request ("Inadequate stock for {name}")
            Note over Server,DB: ROLLBACK TRANSACTION
        else In Stock
            Server->>DB: UPDATE product SET stockQuantity = stockQuantity - ?
        end
    end
    Server->>DB: INSERT INTO order (..., salesChannel, status)
    Server->>DB: INSERT INTO order_item (...)
    Note over Server,DB: COMMIT TRANSACTION
    Server-->>App: 201 Created (Order Ref & Timeline)
    App->>Customer: Receipt printed / Order confirmed
```

---

## 6. M-Pesa Daraja STK Push & Payment Webhooks

The platform integrates directly with **Safaricom Daraja 2.0 API**:
1. **Initiation**: When the customer enters their Safaricom phone number (`+254 7XX...`), the backend requests an OAuth token and triggers a `Lipa Na M-Pesa Online` (STK Push) prompt on the customer's mobile device.
2. **Customer PIN Entry**: The user authorizes the transaction on their phone.
3. **Webhook Callback**: Safaricom servers post the result to `/api/mpesa/callback`:
   - If `ResultCode === 0`: Order transitions to `Paid`, stores the Daraja receipt number (e.g., `SHG8294KJ2`), and dispatches confirmation notifications.
   - If `ResultCode !== 0`: Order transitions to `Failed / Cancelled` with reason logged.
4. **Offline Simulator**: For testing without live Safaricom credentials, the Admin and checkout portals include an instant M-Pesa simulation mechanism.

---

## 7. Role-Based Access Control (RBAC) & Order Lifecycle

The system utilizes an order fulfillment state machine with four authorized roles:

```mermaid
stateDiagram-v2
    [*] --> Ordered: Online checkout / POS Sale
    Ordered --> Paid: Payment confirmed (M-Pesa / Cash / Card)
    Paid --> Preparing: Warehouse picks & packages items
    Preparing --> ReadyForShipping: Packing complete, shipping label attached
    ReadyForShipping --> Shipped: Handed over to courier with tracking number
    Shipped --> Delivered: Customer signs & receives order
    Delivered --> [*]

    Ordered --> Cancelled: Payment timeout / Cancelled by Admin
    Cancelled --> [*]
```

### Role Capabilities Matrix

| System Capability | Customer | Delivery Agent | Warehouse Staff | Corporate Admin |
| :--- | :---: | :---: | :---: | :---: |
| Browse Catalog & Search | ✅ | ✅ | ✅ | ✅ |
| Wishlist & Cart Persistence | ✅ | ✅ | ✅ | ✅ |
| Submit Online Order | ✅ | ❌ | ❌ | ✅ |
| Record Walk-in POS Sale | ❌ | ❌ | ❌ | ✅ |
| Print POS Thermal Receipts | ❌ | ❌ | ❌ | ✅ |
| Pick & Pack Queue (`Preparing`) | ❌ | ❌ | ✅ | ✅ |
| Assign Courier & Tracking (`Shipped`) | ❌ | ✅ | ❌ | ✅ |
| Add / Edit / Restock Products | ❌ | ❌ | ❌ | ✅ |
| Manage Coupons & Campaigns | ❌ | ❌ | ❌ | ✅ |
| Manage User Roles & Accounts | ❌ | ❌ | ❌ | ✅ |
| View Financial Revenue Analytics | ❌ | ❌ | ❌ | ✅ |

---

## 8. Inventory Demand Forecasting & Sales Planning

To empower the store owner to plan purchasing and avoid stockouts, the **Sales & POS Planning** module calculates real-time demand metrics:

$$\text{Demand Velocity Score} = \frac{\text{Units Sold (Last 30 Days)}}{\text{Current Warehouse Stock}}$$

$$\text{Suggested Restock} = \max\left(10, \; \max(\text{ReorderThreshold} \times 3, \; \text{UnitsSold} \times 2) - \text{CurrentStock}\right)$$

### Stock Urgency Badges
- 🔴 **OUT OF STOCK** (`currentStock === 0`): Immediate supplier reorder required.
- 🟡 **REORDER NOW** (`currentStock <= reorderThreshold`): Warehouse stock below safety buffer.
- 🔵 **HIGH VELOCITY** (`unitsSold >= 10` & `currentStock <= 2 * reorderThreshold`): High turnover product.
- 🟢 **ADEQUATE**: Stock is healthy relative to recent sales velocity.

---

## 9. Marketing Feeds & Progressive Web App (PWA)

### Automated Marketing Feeds
The backend dynamically generates structured XML and JSON catalog feeds for social advertising and search indexing:
- **Meta (Facebook & Instagram) Catalog Feed**: `/api/products/meta-feed.xml`
  - Compliant with Facebook Product Catalog specifications (`<g:id>`, `<g:title>`, `<g:price> KES`, `<g:condition>new`, `<g:availability>in stock`).
- **Google Merchant Center Feed**: `/api/products/google-feed.xml`
  - Complies with Google Shopping RSS 2.0 specifications.
- **REST Catalog Feed**: `/api/products/social-feed`

### Progressive Web App (PWA) Capabilities
- **Web App Manifest**: Configured in `manifest.webmanifest` with responsive icons (192px and 512px).
- **Service Worker**: Caches assets and product catalogs for instant subsequent loads.
- **Android Install Prompt**: Automatically prompts mobile Chrome users to install the native-like app.
- **iOS Safari Support**: Dedicated 3-step interactive tutorial guiding iPhone users to tap "Share" ➔ "Add to Home Screen".

---

## 10. Corporate Quotation & Proforma Engine

Designed for Kenyan corporate sports days, secondary schools, football clubs, and tournament organizers:
1. **Interactive Builder**: Admin can select products, quantities, custom pricing, and apply institutional discounts.
2. **Tax Compliance**: Automatically calculates Net Total, 16% KRA VAT, and Gross Total.
3. **Printable Document**: Outputs formatted proforma invoices and official quotations ready for corporate procurement approval.
4. **One-Click Order Conversion**: Admin can convert an approved quotation directly into a live order in the fulfillment pipeline.

---

## 11. Database Schema & Entity Relationships

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "referenced in"
    COUPON ||--o{ ORDER : "applied to"
    USER ||--o{ REVIEW : writes
    PRODUCT ||--o{ REVIEW : receives

    USER {
        string id PK
        string name
        string email UK
        string phone
        string role
        string password
    }

    PRODUCT {
        string id PK
        string name
        string category
        string brand
        number price
        number stockQuantity
        number reorderThreshold
        string sizes "JSON Array"
        string imageUrl
        string warehouseLocation
    }

    ORDER {
        string id PK
        string userId FK
        string customerName
        string email
        string phone
        string deliveryAddress
        string county
        string subCounty
        number shippingFee
        number subtotal
        number discountAmount
        number totalAmount
        string status
        string paymentMethod
        string salesChannel "walk_in or online"
        string mpesaReference
        string courierName
        string trackingNumber
        string timeline "JSON Array"
    }

    ORDER_ITEM {
        string id PK
        string orderId FK
        string productId FK
        number quantity
        number price
        string selectedSize
    }

    COUPON {
        string id PK
        string code UK
        number discountPercentage
        string description
    }
```

---

## 12. Environment Configuration & Deployment

### Environment Variables

#### Backend (`backend/.env`)
```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
JWT_SECRET=super-secure-production-jwt-key
CORS_ORIGIN=https://sportsman.ke,http://localhost:5173

# Safaricom Daraja API
MPESA_CONSUMER_KEY=your_daraja_consumer_key
MPESA_CONSUMER_SECRET=your_daraja_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://api.sportsman.ke/api/mpesa/callback

# Storage & Notifications
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=Sportsman.ke001@gmail.com
SMTP_PASS=[APP_PASSWORD]
```

#### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=https://api.sportsman.ke/api
```

---

*Authored by the Sportsman Engineering Team. All rights reserved.*
