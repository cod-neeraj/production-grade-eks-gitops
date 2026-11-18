# ShopSphere — Complete API Documentation

Base URL via API Gateway: `http://localhost:8080/api`

---

## 1. Authentication Service (`/api/auth`)

Port: `8081` (Direct) | `/api/auth/**` (Gateway)

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Auth**: Public
- **Request Body**:
```json
{
  "username": "janedoe",
  "email": "jane@example.com",
  "password": "Password@123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```
- **Response** (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "username": "janedoe",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "createdAt": "2026-10-25T14:30:00"
  }
}
```

### 1.2 User Login
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Auth**: Public
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password@123"
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "username": "janedoe",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "createdAt": "2026-10-25T14:30:00"
  }
}
```

### 1.3 Get Current User Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Auth**: `Bearer <token>` (CUSTOMER or ADMIN)
- **Response** (`200 OK`): User object

---

## 2. Product Service (`/api/products`)

Port: `8082` (Direct) | `/api/products/**` (Gateway)

### 2.1 List Products
- **Method**: `GET`
- **Path**: `/api/products?category=Electronics&search=keyboard&page=0&size=12&sortBy=price&sortDir=asc`
- **Auth**: Public
- **Response** (`200 OK`): Paginated product response:
```json
{
  "content": [
    {
      "id": 2,
      "name": "Mechanical Gaming Keyboard",
      "description": "TKL mechanical keyboard with Cherry MX Red switches.",
      "price": 149.99,
      "category": "Electronics",
      "sku": "ELEC-KB-001",
      "imageUrl": "https://images.unsplash.com/...",
      "available": true,
      "createdAt": "2026-10-25T14:00:00",
      "updatedAt": "2026-10-25T14:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 12,
  "number": 0,
  "first": true,
  "last": true,
  "empty": false
}
```

### 2.2 Get Product by ID
- **Method**: `GET`
- **Path**: `/api/products/{id}`
- **Auth**: Public

### 2.3 List Categories
- **Method**: `GET`
- **Path**: `/api/products/categories`
- **Auth**: Public
- **Response** (`200 OK`): `["Electronics", "Footwear", "Furniture", "Kitchen", "Sports"]`

### 2.4 Create Product (Admin Only)
- **Method**: `POST`
- **Path**: `/api/products`
- **Auth**: `Bearer <admin-token>` (Role: ADMIN)
- **Request Body**:
```json
{
  "name": "Ergonomic Mechanical Mouse",
  "description": "High precision wireless mouse",
  "price": 79.99,
  "category": "Electronics",
  "sku": "ELEC-MS-001",
  "imageUrl": "https://...",
  "available": true
}
```
- **Response** (`201 Created`): Product object

### 2.5 Update Product (Admin Only)
- **Method**: `PUT`
- **Path**: `/api/products/{id}`
- **Auth**: `Bearer <admin-token>` (Role: ADMIN)

### 2.6 Delete Product (Admin Only)
- **Method**: `DELETE`
- **Path**: `/api/products/{id}`
- **Auth**: `Bearer <admin-token>` (Role: ADMIN)
- **Response** (`204 No Content`)

---

## 3. Inventory Service (`/api/inventory`)

Port: `8084` (Direct) | `/api/inventory/**` (Gateway)

### 3.1 Check Stock Availability
- **Method**: `GET`
- **Path**: `/api/inventory/check/{productId}?quantity=2`
- **Auth**: Public
- **Response** (`200 OK`):
```json
{
  "productId": 1,
  "quantityRequested": 2,
  "available": true
}
```

### 3.2 Get Product Inventory
- **Method**: `GET`
- **Path**: `/api/inventory/product/{productId}`
- **Auth**: Public
- **Response** (`200 OK`):
```json
{
  "id": 1,
  "productId": 1,
  "quantity": 50,
  "reservedQuantity": 2,
  "availableQuantity": 48,
  "lowStockThreshold": 10,
  "lowStock": false,
  "updatedAt": "2026-10-25T14:00:00"
}
```

### 3.3 List All Inventory Records (Admin Only)
- **Method**: `GET`
- **Path**: `/api/inventory?page=0&size=20`
- **Auth**: `Bearer <admin-token>` (Role: ADMIN)

### 3.4 Adjust Stock (Admin Only)
- **Method**: `PUT`
- **Path**: `/api/inventory/adjust`
- **Auth**: `Bearer <admin-token>` (Role: ADMIN)
- **Request Body**:
```json
{
  "productId": 1,
  "quantity": 100,
  "notes": "Restocked inventory batch #54"
}
```

### 3.5 Reserve Stock (Internal / Authenticated)
- **Method**: `POST`
- **Path**: `/api/inventory/reserve`
- **Auth**: `Bearer <token>`
- **Request Body**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

### 3.6 Release Stock (Internal / Authenticated)
- **Method**: `POST`
- **Path**: `/api/inventory/release`
- **Auth**: `Bearer <token>`
- **Request Body**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

---

## 4. Order Service (`/api/orders`)

Port: `8083` (Direct) | `/api/orders/**` (Gateway)

### 4.1 Create Order
- **Method**: `POST`
- **Path**: `/api/orders`
- **Auth**: `Bearer <token>` (Customer)
- **Request Body**:
```json
{
  "shippingAddress": "123 Tech Way, Suite 400, San Francisco, CA",
  "notes": "Gate code #5678",
  "items": [
    {
      "productId": 1,
      "quantity": 1
    },
    {
      "productId": 2,
      "quantity": 2
    }
  ]
}
```
- **Response** (`201 Created` / `200 OK`):
```json
{
  "id": 101,
  "userId": 2,
  "status": "CONFIRMED",
  "totalAmount": 599.97,
  "shippingAddress": "123 Tech Way, Suite 400, San Francisco, CA",
  "notes": "Gate code #5678",
  "createdAt": "2026-10-25T15:00:00",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Wireless Noise-Cancelling Headphones",
      "quantity": 1,
      "unitPrice": 299.99,
      "subtotal": 299.99
    },
    {
      "id": 2,
      "productId": 2,
      "productName": "Mechanical Gaming Keyboard",
      "quantity": 2,
      "unitPrice": 149.99,
      "subtotal": 299.98
    }
  ]
}
```

### 4.2 List Customer's Orders
- **Method**: `GET`
- **Path**: `/api/orders?page=0&size=10`
- **Auth**: `Bearer <token>`

### 4.3 Get Order by ID
- **Method**: `GET`
- **Path**: `/api/orders/{id}`
- **Auth**: `Bearer <token>` (Own order or ADMIN)

### 4.4 List All Orders (Admin Only)
- **Method**: `GET`
- **Path**: `/api/orders/admin/all?page=0&size=15`
- **Auth**: `Bearer <admin-token>` (Role: ADMIN)

### 4.5 Update Order Status (Admin Only)
- **Method**: `PUT`
- **Path**: `/api/orders/{id}/status`
- **Auth**: `Bearer <admin-token>` (Role: ADMIN)
- **Request Body**:
```json
{
  "status": "COMPLETED"
}
```
*(Options: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`)*
