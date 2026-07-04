# Kalamche

A RESTful product search engine, roughly the same idea as Torob — sellers list products, buyers search and compare, clicks get tracked back to the seller. Built twice with the same feature set: once in NestJS/TypeScript, once in Rust, mostly as an excuse to compare the two architectures side by side.

## How it actually works

A shop can create a product only if it doesn't already exist (matched by product code); if it exists, other shops just attach an offer — a price — to it instead of creating a duplicate. Products can have offers from many sellers, and the cheapest one wins the "offer box" shown on the product page, similar to how an ad auction picks a winner.

Token spending works like Google Ads: sellers buy click tokens up front, and a product's offer only shows up on the search/product page while its seller still has tokens left. When a user clicks through and gets redirected to the seller's site, that click consumes a token. Once a seller runs out, their offer stops showing until they top up. All of this is tracked through the fr-token system, with a redirect layer in between Kalamche and the seller's site to actually register the click.

Search is full-text over the product catalog, with filtering by category (nested/hierarchical), price, value, and range, plus whatever other product attributes matter for narrowing results.

Auth is email/password plus email OTP, and also multi-OAuth — a user can link several OAuth providers to one account. Either path issues the same refresh/access token pair, so session management is uniform regardless of how someone logged in.

Beyond that: RBAC for roles/permissions, per-module rate limiting, S3-backed image upload with resizing, and a seller dashboard for managing shops and products.

## Tech Stack

**NestJS backend** — NestJS + Express, PostgreSQL 17 via Drizzle ORM, Argon2 + JWT for auth, Swagger docs generated from Zod schemas, S3 for images, Jest for tests, Docker for local services.

**Rust backend** — Actix Web, PostgreSQL 17 via Diesel, Redis for caching, S3 for images.

## Folder Structure (NestJS Backend)

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

## Database

Schema diagram: [dbdocs](https://dbdocs.io/w3cj/bytedash?schema=public&view=relationships)

![diagram](https://s6.uupload.ir/files/bytedash_vgot.png)

## Known limitations

Some modules are missing standard CRUD endpoints (update/delete on a few resources) — that's a time constraint, not a design choice, and it's on the list to fill in.
