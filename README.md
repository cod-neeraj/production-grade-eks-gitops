# ShopSphere — Full-Stack Microservices E-Commerce Application

ShopSphere is an enterprise-grade, locally runnable e-commerce application designed to demonstrate a clean microservices architecture using Spring Boot 3, Java 21, Spring Cloud Gateway, PostgreSQL, and React 19 with Vite, TypeScript, and Tailwind CSS.

---

## 1. Architecture Overview

ShopSphere is decomposed into five decoupled backend services and an interactive modern SPA:

```
                                  ┌────────────────────────┐
                                  │   Frontend (React 19)  │
                                  │   Vite + Tailwind CSS  │
                                  │       Port: 5173       │
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                  ┌────────────────────────┐
                                  │      API Gateway       │
                                  │  Spring Cloud Gateway  │
                                  │       Port: 8080       │
                                  └───┬────┬──────────┬────┘
                                      │    │          │
             ┌────────────────────────┘    │          └────────────────────────┐
             ▼                             ▼                                   ▼
    ┌─────────────────┐           ┌─────────────────┐                 ┌─────────────────┐
    │  Auth Service   │           │ Product Service │                 │ Inventory Serv. │
    │    Port: 8081   │           │    Port: 8082   │                 │    Port: 8084   │
    └────────┬────────┘           └────────┬────────┘                 └────────┬────────┘
             │                             │                                   │
             ▼                             ▼                                   ▼
   [shopsphere_auth]            [shopsphere_products]                [shopsphere_inventory]
             ▲                             ▲                                   ▲
             │                             │                                   │
             │                    ┌────────┴────────┐                          │
             │                    │  Order Service  │                          │
             └────────────────────┤    Port: 8083   ├──────────────────────────┘
                                  └────────┬────────┘
                                           │
                                           ▼
                                  [shopsphere_orders]
```

### Services & Responsibilities

| Service | Port | Database | Responsibilities |
| :--- | :---: | :--- | :--- |
| **API Gateway** | `8080` | None | Unified entry point, path routing, global CORS, reverse proxy. |
| **Auth Service** | `8081` | `shopsphere_auth` | User registration, login, BCrypt password hashing, JJWT token generation and validation, `ROLE_CUSTOMER` / `ROLE_ADMIN`. |
| **Product Service**| `8082` | `shopsphere_products` | Product catalog CRUD, pagination, category filtering, search, sorting, admin visibility toggles. |
| **Order Service** | `8083` | `shopsphere_orders` | Cart-to-order workflow, server-side price validation, stock reservation orchestration, order status tracking. |
| **Inventory Service** | `8084` | `shopsphere_inventory` | Atomic stock reservation with pessimistic write locking, optimistic `@Version` checks, stock adjustment. |
| **Frontend** | `5173` | None | React 19 SPA, Context API (Auth & Cart state), responsive modern UI with Tailwind CSS. |

---

## 2. Prerequisites

- **Java**: JDK 21+ (`java -version`)
- **Maven**: 3.9+ (`mvn -version`)
- **Node.js**: 20+ and npm 10+ (`node -v`, `npm -v`)
- **PostgreSQL**: Version 14+ running locally (default port: `5432` or `5433`)

---

## 3. Environment Variables

All services have safe default configurations for local development in their `application.properties` files. You can customize them via environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DB_HOST` | `localhost` | PostgreSQL host address |
| `DB_PORT` | `5433` (or `5432`) | PostgreSQL listening port |
| `DB_USERNAME` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `postgres` | PostgreSQL password |
| `JWT_SECRET` | `MyVerySecretKeyForShopSphereApplicationThatIsAtLeast256BitsLong123456` | Shared secret key for JWT signing & verification |
| `JWT_EXPIRATION_MS`| `86400000` (24h) | JWT validity duration in milliseconds |
| `AUTH_SERVICE_URL` | `http://localhost:8081` | URL for Auth Service |
| `PRODUCT_SERVICE_URL` | `http://localhost:8082` | URL for Product Service |
| `ORDER_SERVICE_URL` | `http://localhost:8083` | URL for Order Service |
| `INVENTORY_SERVICE_URL` | `http://localhost:8084` | URL for Inventory Service |
| `VITE_API_URL` | `http://localhost:8080/api` | API Base URL for React frontend |

---

## 4. Database Setup & Seed Data

1. Run the database initialization script against your PostgreSQL instance:
```powershell
psql -U postgres -p 5433 -h localhost -f database/init.sql
```

This automatically:
- Creates four distinct databases: `shopsphere_auth`, `shopsphere_products`, `shopsphere_inventory`, `shopsphere_orders`
- Populates tables with constraints, checks, foreign keys, and indexes
- Seeds initial accounts:
  - **Admin**: `admin@shopsphere.local` / `Admin@123`
  - **Customer**: `john@example.com` / `Customer@123`
- Seeds 20 real e-commerce products and corresponding inventory records

---

## 5. Startup Order

Start the microservices in the following recommended order:

### 1. PostgreSQL
Ensure PostgreSQL is running and port `5433` (or `5432`) is reachable.

### 2. Auth Service (Port 8081)
```powershell
cd auth-service
mvn spring-boot:run
```

### 3. Product Service (Port 8082)
```powershell
cd product-service
mvn spring-boot:run
```

### 4. Inventory Service (Port 8084)
```powershell
cd inventory-service
mvn spring-boot:run
```

### 5. Order Service (Port 8083)
```powershell
cd order-service
mvn spring-boot:run
```

### 6. API Gateway (Port 8080)
```powershell
cd api-gateway
mvn spring-boot:run
```

### 7. Frontend (Port 5173)
```powershell
cd frontend
npm run dev
```

---

## 6. Frontend Instructions

1. **Install dependencies**:
```powershell
cd frontend
npm install
```

2. **Start Development Server**:
```powershell
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

3. **Production Build**:
```powershell
npm run build
```

---

## 7. Key User Flows & Verification

### A. Customer Flow
1. Navigate to `http://localhost:5173/products` — browse 20 seeded products.
2. Filter by category (e.g. *Electronics*, *Furniture*), search by keyword, or sort by price.
3. Click on a product to view real-time inventory stock from the Inventory Service.
4. Click **Add to Cart** to add items to your local shopping cart.
5. Navigate to `/cart` and click **Proceed to Checkout**.
6. Log in using `john@example.com` / `Customer@123` (or click **Demo Customer**).
7. Enter a shipping address and click **Confirm & Place Order**.
8. Order Service validates product prices, executes atomic stock reservation via Inventory Service, and confirms the order.
9. Review order status under **My Orders** (`/orders`).

### B. Admin Flow
1. Log in with `admin@shopsphere.local` / `Admin@123` (or click **Demo Admin**).
2. Click **Admin** in the navigation bar to enter the Admin Portal (`/admin`).
3. **Product Management** (`/admin/products`): Add new products, edit pricing/descriptions, toggle catalog visibility, or delete items.
4. **Inventory & Stock** (`/admin/inventory`): Inspect live warehouse stock and reserved quantities, adjust stock levels with audit notes, or track new SKUs.
5. **Order Management** (`/admin/orders`): Review all incoming platform orders and transition statuses from `CONFIRMED` to `COMPLETED` or `CANCELLED` (auto-releases reserved stock).

---

## 8. Actuator Health Endpoints

Each service exposes standard Spring Boot Actuator health checks:
- Gateway: `http://localhost:8080/actuator/health`
- Auth: `http://localhost:8081/actuator/health`
- Product: `http://localhost:8082/actuator/health`
- Order: `http://localhost:8083/actuator/health`
- Inventory: `http://localhost:8084/actuator/health`

---

## 9. Troubleshooting

- **Database Connection Refused**:
  Verify PostgreSQL is listening on port `5433` (or set `DB_PORT=5432` if using standard port).
- **CORS Issues in Browser**:
  Ensure requests go through API Gateway on `http://localhost:8080` rather than calling downstream services directly. The gateway applies `spring.cloud.gateway.globalcors` for `http://localhost:5173`.
- **JWT Expired**:
  Log out and log back in. The default token validity is 24 hours (`86400000 ms`).
