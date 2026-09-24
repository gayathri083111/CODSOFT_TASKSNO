# DineDesk – Restaurant Ordering Platform

> **"Delicious food. Delivered with ease."**  
> *A full-stack restaurant ordering and kitchen dispatch platform built for CodSoft Full-Stack Web Development Internship Task 2.*  
> **Developer:** Gorli Gayathri

---

## 🍽️ Overview

**DineDesk** is a modern, production-grade food ordering platform designed for high-volume restaurants. Built with a clean separation of concerns between React + TypeScript on the frontend, Express REST APIs on the backend, and Prisma ORM with persistent relational data storage.

DineDesk provides an end-to-end culinary journey for customers—from exploring aromatic biryanis and sizzlers with strict Veg & Non-Veg segregation, real-time quantity steppers, and promo coupon discounts, to live 5-stage order tracking and verified post-delivery reviews. For restaurateurs and kitchen staff, an integrated Admin Suite delivers instant order dispatching, menu item availability toggling, revenue metrics, and customer insights.

---

## 🚀 Key Features

### 👤 Customer Experience
- **Interactive Culinary Catalog**: Browse over 95 authentic Indian & Asian culinary dishes across 10 categories (Biryani Specials, Starters, Curries, Tandoori Breads, Chinese Wok, Desserts, Beverages).
- **Strict Veg & Non-Veg Segregation**: Dedicated visual badges (Green Square/Dot for Pure Veg, Red Triangle for Non-Veg) and instant 1-click filter switches.
- **Dynamic Instant Search & Multi-Filters**: Live real-time search by keyword, price ceiling sliders, minimum star ratings, and sorting (Bestsellers, Price Low/High, Rating).
- **Food Detail View**: High-resolution dish photography, spice & marinade description, preparation time, availability badge, and customer reviews.
- **Persistent Favorites**: Bookmark preferred dishes with a single tap for quick reordering.
- **Shopping Cart & Coupons**:
  - Real-time quantity adjustment `[- 1 +]`.
  - Free delivery threshold banner (Orders above ₹500 unlock free delivery).
  - Discount coupons (`DINEDESK10`, `WELCOME50`, `FEAST20`, `BIRYANI100`) with instant validation and itemized bill breakdown.
- **Seamless Multi-Address Checkout**: Save Home/Office addresses or enter one-time delivery points with contact phone numbers.
- **Multiple Payment Modes**: Cash on Delivery (COD) and Instant Online Payment simulation.
- **Real-Time Order Confirmation & Tracker**:
  - Live progress progression: `[Placed] → [Kitchen Confirmed] → [Cooking Fresh] → [Out for Delivery] → [Delivered]`.
  - Dynamic estimated delivery ETA counter.
  - Dish thumbnails and itemized receipt breakdown.
- **Order History & One-Click Reorder**: Reorder previous meals directly into the cart with a single click.
- **Dish Rating & Reviews**: Post-delivery rating submission with interactive 1-5 star ratings and culinary comments.

### 🛡️ Admin Management Suite (Role-Based Access)
- **Live Business Dashboard**: Real-time sales metrics, today's revenue, active cooking pipeline, and top-ordered dishes.
- **Order Dispatch Control**: Instant status updates across the 5 lifecycle stages with live customer reflection.
- **Menu Management**: Add new dishes, edit pricing and descriptions, or toggle kitchen stock availability (`In Stock` / `Sold Out`).
- **Category Management**: Add and manage custom cuisine segments with curated cover imagery.
- **Coupon Management**: Create percentage or flat discounts, define minimum order thresholds, and monitor coupon redemption counts.
- **Customer Insights**: View registered customer profiles, phone numbers, total order volumes, and lifetime spending.
- **Feedback Moderation**: Monitor customer dish ratings and feedback in real time.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Context API |
| **Backend** | Node.js, Express, TypeScript, RESTful API architecture |
| **ORM & Database** | Prisma ORM, Relational Database (PostgreSQL / SQLite compatibility) |
| **Security & Auth** | JSON Web Tokens (JWT), bcryptjs password hashing, Role-Based Access Control (RBAC) |
| **Styling & Assets** | Modern glassmorphic cards, Warm amber & stone palette, Unsplash photography |

---

## 👥 Demo Credentials

You can test the platform immediately using the pre-seeded demo accounts:

### 👑 Administrator Account
- **Email:** `admin@dinedesk.com`
- **Password:** `admin123`
- **Access:** Complete access to `/admin` control hub, status updater, menu editing, and coupons.

### 🧑 Regular Customer Account
- **Email:** `customer@dinedesk.com`
- **Password:** `customer123`
- **Access:** Preloaded with saved addresses, previous orders, and favorite dishes.

*(You can also register a brand new account anytime via the "Sign Up" modal).*

---

## 📋 Database Schema (Prisma)

- **`User`**: Core accounts, passwords, contact phone, role (`CUSTOMER` | `ADMIN`).
- **`Category`**: Cuisine types (Biryani, Starters, Main Course, etc.).
- **`Food`**: Item name, description, price, foodType (`VEG` | `NON_VEG`), rating, reviewCount, preparation time, availability, and featured status.
- **`Cart` & `CartItem`**: Persistent customer cart items with real-time quantity tracking.
- **`Address`**: Saved delivery addresses (Home, Office, Other) linked to customer profiles.
- **`Coupon`**: Promotional codes, discount percentage/fixed value, minimum order value, max discount cap, and redemption counts.
- **`Order` & `OrderItem`**: Full order history, delivery destination, payment status, status progression (`PENDING` -> `DELIVERED`), and item snapshots.
- **`Review`**: Customer ratings (1-5 stars) and feedback comments linked to specific dishes.
- **`Favorite`**: User bookmarked food items.

---

## ⚙️ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd dinedesk
npm install
```

### 2. Environment Configuration
Create a `.env` file based on `.env.example`:
```env
PORT=3000
JWT_SECRET=dinedesk_super_secure_production_secret_2026
```

### 3. Database Migration & Seeding
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed 95+ realistic dishes, categories, coupons, and demo accounts
npm run prisma:seed
```

### 4. Start Full-Stack Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with Express handling both API endpoints (`/api/*`) and Vite serving hot frontend assets.

---

## 🔌 API Endpoints Summary

### Authentication
- `POST /api/auth/register` – Register customer
- `POST /api/auth/login` – Authenticate customer or admin
- `GET /api/auth/me` – Retrieve current authenticated user profile
- `POST /api/auth/logout` – Clear session

### Food Menu & Categories
- `GET /api/foods` – Search, filter by category, food type (`VEG`/`NON_VEG`), price, and rating
- `GET /api/foods/:id` – Detailed food info and reviews
- `GET /api/categories` – List all cuisine categories

### Cart & Checkout
- `GET /api/cart` – View user's persistent cart
- `POST /api/cart/add` – Add food item with quantity
- `PUT /api/cart/update` – Update item quantity
- `DELETE /api/cart/item/:id` – Remove item from cart
- `DELETE /api/cart/clear` – Empty cart
- `POST /api/coupons/apply` – Validate and apply promo code

### Orders & Tracking
- `GET /api/orders` – List user's past orders
- `GET /api/orders/:id` – Real-time tracking and invoice detail
- `POST /api/orders` – Place order with delivery address & payment method
- `POST /api/orders/:id/reorder` – Re-add past order dishes to cart

### Reviews & Ratings
- `POST /api/reviews` – Submit dish rating (1-5 stars) & review comment

### Admin Operations (`ROLE: ADMIN`)
- `GET /api/admin/dashboard` – Real-time analytics, revenue, and order status counts
- `GET /api/admin/orders` – View all customer orders with filters
- `PUT /api/admin/orders/:id/status` – Update order lifecycle stage
- `POST /api/admin/foods` – Add new dish to menu
- `PUT /api/admin/foods/:id` – Edit dish details
- `DELETE /api/admin/foods/:id` – Delete dish from menu
- `PATCH /api/admin/foods/:id/toggle` – Toggle dish in-stock availability
- `POST /api/admin/categories` – Create custom category
- `POST /api/admin/coupons` – Issue discount coupon
- `PATCH /api/admin/coupons/:id/toggle` – Toggle coupon status

---

## 📜 License
Developed by **Gorli Gayathri** for **CodSoft Full-Stack Web Development Internship (Task 2)**.
Licensed under the Apache-2.0 License.
