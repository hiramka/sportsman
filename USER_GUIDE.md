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
