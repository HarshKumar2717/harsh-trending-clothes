# Harsh Trending Cloth — Premium Fashion E-commerce

A complete, production-ready full-stack e-commerce website with a Black / White / Gold premium theme.

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (custom gold/ink color system)
- **Icons:** Lucide React + React Icons
- **Routing:** React Router DOM v6
- **Backend / Database / Auth:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)

## Features

### Customer
- Register / Login / Forgot Password / Reset Password
- Customer dashboard with stats
- Edit profile + upload profile photo
- Change password
- Wishlist (save / remove / move to cart)
- Shopping cart with GST + delivery + coupon discounts
- Checkout with address selection + 4 payment methods (UPI, Credit Card, Debit Card, COD)
- My Orders with live order tracking (6-step progress)
- Invoice download (.txt)
- Saved addresses (add / edit / delete / set default)
- Product reviews & ratings
- Live search, category / price / rating filters

### Super Admin
- Secure admin dashboard with revenue / order / customer KPIs
- Monthly sales chart (6 & 12 month views)
- Product CRUD (add / edit / delete, flags, badges, stock)
- Stock management with low-stock alerts
- Order management (view, update status, export CSV)
- Customer management (profiles + spend stats)
- Coupon management (flat / percent discounts)
- Banner management (home page hero banners)
- Reports & analytics (revenue, category performance, order status) with CSV export

### Pages
Home, Shop, Product Details, Categories, Cart, Checkout, Wishlist, Login, Register,
Forgot Password, Reset Password, Customer Dashboard, Profile, My Orders, Order Detail,
Addresses, Admin Dashboard, Products, Orders, Customers, Coupons, Banners, Reports,
About Us, Contact Us, Privacy Policy, Return Policy, Terms & Conditions, 404.

### Catalog
30 demo products across 5 categories: T-Shirts, Shirts, Pants, Sneakers, Men's Trending Perfumes.

## Admin Login

```
Email:    admin@harshcloth.com
Password: Admin@123
```

The super admin account is auto-provisioned by the `bootstrap-admin` edge function.

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are pre-configured in `.env`.

## Project Structure

```
src/
├── components/        # Header, Footer, ProductCard, UI primitives, route guards
├── context/           # AuthContext, CartContext, WishlistContext, ToastContext
├── lib/               # supabase client, types, api, config, utils
├── pages/
│   ├── auth/          # Login, Register, ForgotPassword, ResetPassword
│   ├── account/       # Dashboard, Profile, Orders, OrderDetail, Addresses
│   ├── admin/         # Dashboard, Products, Orders, Customers, Coupons, Banners, Reports
│   ├── HomePage, ShopPage, ProductDetailPage, CartPage, CheckoutPage, WishlistPage
│   └── AboutPage, ContactPage, PrivacyPage, ReturnPolicyPage, TermsPage, NotFoundPage
└── App.tsx            # Routing + providers
supabase/functions/bootstrap-admin/  # Admin provisioning edge function
```

## Business Info

**Harsh Trending Cloth**
Vijay Nagar, Ghaziabad, Uttar Pradesh — 201009
Phone: +91 9911614710
Email: harshrajoriya2717@gmail.com
