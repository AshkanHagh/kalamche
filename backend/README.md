# Kalamche Project README

## Project Overview
Kalamche is a RESTful API serving as a super search engine for products, similar to the Torob website. It provides a scalable, stateless backend system for managing product and offer data, enabling full-text search, redirect tracking, and seller management. The project is implemented in two programming languages—TypeScript (using NestJS) and Rust—with identical backend functionality, showcasing versatility and robust architecture.

## Objectives
- **Product and Offer Management**: Enable a system where a shop can create a product if it doesn't exist, and once created, other shops can only submit offers for that product without creating duplicates.
- **Full-Text Search**: Provide advanced full-text search capabilities for products with various filtering options. 
- **Redirect Tracking**: Implement a redirect system from Kalamche to seller websites for tracking purposes. 
- **Click-Based Usage Tracking**: Track product interactions per shop using a custom "fr-token" system. 
- **Role-Based Access Control (RBAC)**: Implement a permission system to manage user roles and access. 
- **Multi-OAuth Support**: Allow authentication via multiple OAuth providers and accounts. 
- **Multi-Payment Gateways**: Support various payment gateways for flexible transactions. 

## Why I Built This Project
I built Kalamche to create a powerful, scalable search engine API for products, capable of integrating with external platforms and providing a seamless experience for users and sellers. My goal was to design a stateless backend that supports horizontal scaling, advanced search functionality, and secure authentication, while exploring modern tools like NestJS, Rust, and PostgreSQL. This project serves as a foundation for a robust e-commerce ecosystem, demonstrating my ability to handle complex backend requirements and integrations.

## Key Features
- **Authentication**: Supports email/password login and email OTP verification.
- **Token System**: Implements refresh and access tokens for secure sessions.
- **Multi-OAuth**: Enables multiple accounts and providers for OAuth authentication.
- **RBAC Permission System**: Manages user roles and permissions for secure access control.
- **Click-Based Usage (fr-token)**: Tracks product interactions per shop using a custom token system.
- **Multi-Payment Gateways**: Integrates multiple payment providers for transactions.
- **Redirect Tracking**: Tracks redirects to seller websites for fr-token calculations.
- **Rate Limiting**: Applies rate limiting per module using NestJS for API protection.
- **Hierarchical Categories**: Organizes products into nested category structures.
- **One Product, Multiple Offers**: Allows a shop to create a product if it doesn't exist; other shops can only submit offers for existing products, preventing duplicates.
- **Full-Text Search**: Supports advanced product search with customizable filters.
- **Image Upload and Resize**: Handles image uploads to S3 with resizing capabilities.
- **Seller Dashboard**: Provides sellers with tools to manage their products and shops.

## Tech Stack
### NestJS Backend
- **Framework**: NestJS with Express
- **Database**: PostgreSQL 17
- **ORM**: Drizzle ORM
- **Authentication**: Argon2 for password hashing, JWT for tokens
- **API Documentation**: Swagger with Zod and auto-generated DTOs
- **Storage**: AWS S3 for image uploads
- **Testing**: Jest for unit and integration tests
- **Containerization**: Docker and Docker Compose
- **Language**: TypeScript
- **Additional Tools**: ESLint for linting

### Rust Backend
- **Framework**: Actix Web
- **Database**: PostgreSQL 17
- **ORM**: Diesel ORM
- **Cache**: Redis
- **Storage**: AWS S3 for image uploads
- **Language**: Rust

## Folder Structure (NestJS Backend)
The NestJS backend follows a modular folder structure for clarity and maintainability. Below is the directory layout with descriptions:

```
kalamche/
├── /src
│   ├── /assets                    # Stores static assets and datasets (e.g., product data, fr-token plans)
│   ├── /config                    # Configuration files for environment variables (e.g., auth, database, payment, S3)
│   ├── /constants                 # Global constants for permissions and actions
│   ├── /drizzle                   # Database-related files, including migrations, schemas, and seed data
│   ├── /features                  # Feature modules for specific functionalities
│   │   ├── /auth                  # Authentication logic (login, OAuth, permissions)
│   │   ├── /email                 # Email-related functionality (e.g., OTP verification)
│   │   ├── /fr-token              # fr-token system for tracking click-based usage
│   │   ├── /product               # Product management and search functionality
│   │   ├── /rate-limit            # Rate limiting logic for API protection
│   │   ├── /shop                  # Shop and seller dashboard management
│   │   ├── /user                  # User management and account operations
│   ├── /filters                   # HTTP exception filters and custom exceptions
│   ├── /repository                # Database repository interfaces and implementations
│   ├── /types                     # Global TypeScript types
│   ├── /utils                     # Utility functions (e.g., time calculations, Swagger decorators)
├── /test                          # Test-related files for unit and integration testing
├── /dist                          # Compiled output
├── docker-compose.yaml            # Docker Compose configuration
├── drizzle.config.ts              # Drizzle ORM configuration
├── eslint.config.mjs              # ESLint configuration
├── nest-cli.json                  # NestJS CLI configuration
├── package.json                   # Project dependencies and scripts
├── pnpm-lock.yaml                 # Dependency lock file
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.build.json            # TypeScript build configuration
└── README.md                      # Project documentation (this file)
```

## SQL Diagram
View the dbdocs diagram [here](https://dbdocs.io/w3cj/bytedash?schema=public&view=relationships).

![diagram](https://s6.uupload.ir/files/bytedash_vgot.png)

## TODO
