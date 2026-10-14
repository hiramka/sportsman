# 🏆 Sportsman.ke — Complete System User Guide & Credentials Manual

Welcome to the **Sportsman.ke** Sports E-Commerce Full-Stack System. This document serves as the official user manual and operational guide for accessing, managing, and testing all roles in the system.

---

## 🔑 Default Login Credentials & Access Roles

The system automatically seeds baseline accounts upon initial boot. You can log in using any of the following pre-configured credentials:

| System Role | Email Address | Password | Access Route / Portal | Key Permissions & Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin@sportsman.ke` | `admin123` | `/admin` | Full system control, revenue analytics, inventory management, user management, order approvals, force-pay simulation, and support message resolution. |
| **Warehouse Staff** | `warehouse@sportsman.ke` | `warehouse123` | `/admin` | Inventory tracking, reorder alerts, pick & pack order queue (`Preparing`, `Ready for Shipping`). |
| **Delivery Agent** | `delivery@sportsman.ke` | `delivery123` | `/admin` | Courier dispatch queue, tracking number assignment, handover delivery signing (`Shipped`, `Delivered`). |
| **Customer User** | `customer@sportsman.ke` | `customer123` | `/receipts` & Storefront | Catalog browsing, shopping cart, checkout, coupon application, order receipt tracking, downloadable PDF receipts, and product reviews. |

---

## 🏷️ Active Promotional Coupons

Customers can apply the following discount codes during checkout:

| Coupon Code | Discount Percentage | Description |
| :--- | :--- | :--- |
| `SPORT50` | **50% OFF** | Flash Sale 50% discount |
| `KIPCHOGE` | **20% OFF** | Marathon Special 20% discount |
| `NAIROBI10` | **10% OFF** | Local Nairobi Delivery 10% discount |

---

## 🚀 Key Portal Features & Workflow

### 1. Storefront & Customer Portal (`/` & `/receipts`)
- **Product Catalog**: Filter sports gear by categories (*Football, Basketball, Table Tennis, Jerseys, Boots*).
- **Ratings & Reviews**: View average ratings and submit 1–5 star reviews with comments on any product.
- **Cart & Checkout**: Interactive shopping cart with subtotal calculation, coupon validation, delivery sub-county selection, and M-Pesa phone prompt.
- **Order Tracking & Receipts**: Real-time visual status bar (Order Placed ➔ Packed ➔ Dispatched ➔ Delivered) and downloadable PDF receipts.
- **Support Modal**: Click **Contact Us** in the navigation bar to submit support inquiries directly to the database and Web3Forms.

### 2. Admin & Staff Operations Portal (`/admin`)
- **Revenue Analytics**: Visual summary cards showing Total Revenue (KSh), Order breakdown by status, total product count, and low stock reorder alerts.
- **Order Fulfillment Pipeline**:
  - **Admin**: Approve or Cancel orders.
  - **Warehouse**: Pick and pack items (updates status to `Preparing` / `Ready for Shipping`).
  - **Delivery Agent**: Assign courier name & tracking number, mark as `Shipped` / `Delivered`.
- **Contact Support Management**: View, reply to, and mark customer support messages as resolved.
- **User & Coupon Management**: Create, edit, or deactivate user accounts and generate custom promotional coupons.

---

## ⚙️ Technical Architecture Overview

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Responsive SPA Routing.
- **Backend**: NestJS REST API, TypeORM (SQLite for dev, PostgreSQL/Supabase for production), Throttler Rate Limiting, JWT Authentication with HTTP-Only Cookie fallback.
- **Services**: M-Pesa STK Push Payment Gateway, Supabase Storage for product images, Nodemailer SMTP for emails, and SMS Service for customer alerts.



---

## 🏬 In-Store Walk-in POS & Sales Planning Guide

The corporate admin panel now features a dedicated Point of Sale (POS) system for recording clients who walk directly into your physical Nairobi store:

### 1. Recording a Walk-in Customer Sale
1. Navigate to `/admin` and log in with your Admin credentials.
2. Click the green **`+ Record Walk-in (POS)`** button located in the header or on the **Sales & POS Planning** tab.
3. Search for the product or click items from the quick catalog grid.
4. Select the customer's desired shoe or jersey size (e.g., `Size 5`, `UK 9`, `M`).
5. Choose payment method:
   - **Cash**: Enter the cash amount tendered; the POS automatically calculates the customer's change.
   - **In-Store M-Pesa Till / Paybill**: Enter the M-Pesa transaction reference code (e.g. `RJK4920XLM`).
   - **Credit / Debit Card**: Select Card payment.
6. Optional: Enter customer name and phone number for receipt tracking, and apply a custom discount if negotiating at the counter.
7. Click **`Complete Sale & Print Receipt`**.
   - Warehouse stock is **immediately decremented** in real-time so online web users cannot buy items sold at the counter.
   - An official **80mm thermal receipt** is generated and triggered to your receipt printer with 16% KRA VAT breakdown.

### 2. Daily Till Reconciliation & Sales Planning
1. Click the **Sales & POS Planning** tab in the admin header.
2. View the **Gross Sales**, **In-Store Walk-in Sales**, and **Today's Counter Till** summary cards to perform end-of-day cash and till reconciliation.
3. Check the **Inventory Replenishment & Sales Velocity Planning** table:
   - Identifies high-demand items vs remaining warehouse stock.
   - Highlights items that are `OUT OF STOCK` or `REORDER NOW`.
   - Provides recommended restock quantities (e.g. `+25 units`) for your next supplier shipment.
4. Use the **Sales Transactions & POS Receipt History** table to search, filter by channel (*Walk-in* vs *Online*), and reprint POS receipts anytime.
5. Click **`Export Sales CSV`** to download sales records formatted for accounting and KRA VAT returns.

---

## 📱 Progressive Web App (PWA) Mobile Installation

### Android Users (Chrome)
- Visiting `sportsman.ke` automatically presents the native "Add Sportsman.ke to Home screen" install bar. Tap **Install** to add the app icon to the home screen.

### iOS Users (Safari on iPhone / iPad)
1. Open **Safari** on your iPhone or iPad and navigate to `sportsman.ke`.
2. Tap the **Share** button (square with arrow pointing up `⎋` in the bottom bar).
3. Scroll down and tap **"Add to Home Screen"** (`⊞`).
4. Tap **Add** in the upper right corner.
5. Sportsman.ke launches directly from the home screen in full-screen standalone mode with no browser URL bar or tabs.