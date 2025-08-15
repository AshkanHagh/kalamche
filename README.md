# Super Search Engine

A product search engine with full-text search and marketplace functionality where sellers showcase products that redirect to external websites.

## Introduction

The Super Search Engine is a full-stack web application designed for efficient product discovery and marketplace operations, inspired by platforms like تورب. It enables sellers to list products, with each user click redirecting to the seller’s external website. The platform implements a token-based monetization model (fr-token), charging sellers per click. Built with a dual-backend architecture (Rust/Actix Web and TypeScript/NestJS), it ensures robust performance, secure authentication, integrated payment processing, and scalable product management.

## Key Features

- **Full-Text Search**: Leverages PostgreSQL’s full-text search for efficient querying across product attributes.
- **Token-Based Monetization**: Implements fr-token system, deducting tokens from seller accounts per user click to external product links.
- **Product Redirection**: Seamlessly redirects users to external seller websites via secure, tracked links.
- **Seller Product Management**: Provides APIs for sellers to create, update, or manage product listings and offers.
- **Payment Integration**: Supports Stripe and ZarinPal for secure, multi-currency transaction processing.
- **Authentication System**: Implements email/password authentication with JWT (access/refresh tokens) and OAuth 2.0 for third-party logins.
- **Email OTP Security**: Enforces one-time password (OTP) verification for account security and user onboarding.
- **Role-Based Access Control (RBAC)**: Manages permissions for different user roles (e.g., admin, seller, buyer) with fine-grained access control.
- **Security Measures**: Incorporates rate limiting, secure headers, and Argon2 password hashing for robust protection.
- **Transaction Integrity**: Ensures data consistency with ACID-compliant transactions for token and payment operations.

## Tech Stack

### Backend
- **Languages/Frameworks**: Rust with Actix Web for high-performance APIs; TypeScript with NestJS for rapid development and maintainability.
- **Database**: PostgreSQL for relational data storage and full-text search capabilities.
- **Storage**: AWS S3 for scalable, durable storage of product images and assets.
- **Authentication**: JWT-based access/refresh tokens; OAuth 2.0 integration for Google, GitHub, and other providers.
- **Payment Processing**: Stripe for global payments; ZarinPal for regional payment support.
- **Security**: Argon2 for password hashing; rate limiting implemented in both backends.
- **Email Delivery**: Nodemailer (TypeScript) and equivalent Rust libraries for sending OTPs and transactional notifications.
- **Image Processing**: Sharp for server-side image resizing and format optimization.
- **Infrastructure**: Docker for containerized deployments; Nginx as a reverse proxy for load balancing.
- **Testing**: Rust’s built-in testing framework and Jest (TypeScript) for unit and integration tests.
- **Other Tools**: AWS SDK for S3 interactions; cron-based scheduling for automated tasks.

### Frontend
- **Framework**: Next.js with React for server-side rendering and optimized client-side performance.
- **State Management**: Redux Toolkit for predictable, centralized state handling.
- **Form Handling**: React Hook Form for efficient form processing.
- **HTTP Client**: Axios for API requests with interceptors for token management.
- **Styling**: Tailwind CSS for utility-first, responsive UI development.
- **Icons**: Lucide React for lightweight, customizable icon sets.
- **Components**: Swiper for interactive carousels and product sliders.
- **Notifications**: Sonner for non-intrusive, user-friendly toast notifications.

### Infrastructure
- **Containerization**: Docker for consistent, reproducible deployment environments.
- **Reverse Proxy**: Nginx for efficient request routing and load balancing.
- **Architecture**: Stateless backend design to support horizontal scaling and high availability.
- **Data Seeding**: Supports CSV-based product imports with validation to ensure data integrity.

## Why I Built This

The Super Search Engine was developed to create a scalable, performant product search platform with a click-based monetization model. The project served as an opportunity to implement and compare dual backend architectures (Rust/Actix Web vs. TypeScript/NestJS), integrate multiple payment gateways (Stripe and ZarinPal), and design a secure, token-based system. It showcases expertise in handling complex authentication flows, ensuring transaction integrity, and optimizing product management for scalability.

## Why These Technologies?

- **Rust/Actix Web + TypeScript/NestJS**: Dual backends enable performance benchmarking (Rust for low-latency, high-throughput APIs; NestJS for developer productivity and ecosystem support).
- **PostgreSQL**: Provides ACID-compliant transactions critical for financial operations and robust full-text search.
- **Next.js**: Enables server-side rendering for SEO and fast page loads, with seamless React integration.
- **Redux Toolkit**: Simplifies state management for complex, dynamic frontend interactions.
- **JWT + OAuth**: Combines secure, stateless authentication with flexible third-party login support.
- **Stripe + ZarinPal**: Ensures global and regional payment coverage with robust APIs.
- **Docker + Nginx**: Facilitates consistent deployments and efficient traffic management.
- **Tailwind CSS**: Accelerates UI development with a utility-first approach and responsive design.
- **Sharp**: Optimizes image processing for faster load times and reduced bandwidth usage.
- **Argon2**: Offers industry-leading password hashing for enhanced security.

## TODOs (Future Improvements)
