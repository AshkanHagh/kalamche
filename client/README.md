# Kalamche

Kalamche is a **Next.js 15** project inspired by popular Iranian platforms like **Torob** and **Emalls**. It allows users to create their own shop, list products for sale, and enables others to place offers with higher or lower prices. Buyers can purchase products at the lowest available price from their preferred seller.

⚠️ **Note:** The frontend of this project is still **under development** and not yet complete.

---

## Features

* **Authentication**

  * OTP-based authentication system
  * Social login with **GitHub** and **Discord**
  * Advanced refresh & access token mechanism for security
  * External backend integration without third-party auth libraries

* **Seller Dashboard**

  * Manage products and offers
  * Product image upload with **cropping support**

* **Product & Search**

  * Advanced **SSR-based category & search system**
  * Infinite scroll with filters
  * SEO-friendly product listings

* **FR Token System**

  * Special site token system where users can unlock additional features by purchasing **FR tokens**

* **RBAC Permissions**

  * Role-Based Access Control for managing user permissions

* **Form Validation**

  * Combination of **Zod** + **React Hook Form** for best performance and clean validation

* **Performance Optimizations**

  * Extensive usage of **useMemo** and **useCallback** for rendering optimization
  * Optimized SSR and client hydration

---

## Tech Stack

* **Framework:** [Next.js 15](https://nextjs.org/)
* **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
* **UI Components:** [Shadcn UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
* **Styling:** [TailwindCSS](https://tailwindcss.com/)
* **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
* **HTTP Client:** [Axios](https://axios-http.com/)
* **Charts & Data Viz:** [Recharts](https://recharts.org/)
* **Carousel:** [Swiper](https://swiperjs.com/)
* **Utilities:** date-fns, sonner (toasts), jose (JWT handling)

---

## 📂 Folder Structure

The project follows a **modular page-based folder structure**:

```
app/
 ├─ dashboard/
 │   ├─ _components/
 │   ├─ _hooks/
 │   └─ _types/
 │
 ├─ create-shop/
 │   ├─ _components/
 │   ├─ _hooks/
 │   └─ _types/
 │
 └─ ... (other pages with similar structure)

src/
 ├─ components/   # Global components
 ├─ hooks/        # Global hooks
 ├─ utils/        # Utility functions
 └─ ...
```

This structure ensures clarity and separation of page-specific logic from global utilities.

---

## Installation & Setup

Make sure you have **pnpm** installed globally:

```bash
npm install -g pnpm
```

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd kalamche
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

---

## TODO (Work in Progress)

* [ ] Replace fake data in certain areas with backend API data
* [ ] Improve landing page styling
* [ ] Complete the product creation section for shops
* [ ] Fix styling for displaying FR token in the seller dashboard

---

## 📜 License

MIT License
