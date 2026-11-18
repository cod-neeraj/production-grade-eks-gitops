-- ShopSphere Database Initialization Script
-- Run this as a PostgreSQL superuser or the database owner

-- Create databases
CREATE DATABASE shopsphere_auth;
CREATE DATABASE shopsphere_products;
CREATE DATABASE shopsphere_orders;
CREATE DATABASE shopsphere_inventory;

-- ============================================================
-- Auth Database Setup
-- ============================================================
\c shopsphere_auth;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Admin user: password is 'Admin@123' (BCrypt hashed)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@shopsphere.local', '$2a$12$LQv3c1yqBwEHxv3S7LGkW.5nPyKZzJtqxJ0FBuXfQXJpUQX9sJLme', 'Admin', 'User', 'ADMIN');

-- Sample customer: password is 'Customer@123' (BCrypt hashed)  
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('john_doe', 'john@example.com', '$2a$12$LQv3c1yqBwEHxv3S7LGkW.5nPyKZzJtqxJ0FBuXfQXJpUQX9sJLme', 'John', 'Doe', 'CUSTOMER');

-- ============================================================
-- Products Database Setup
-- ============================================================
\c shopsphere_products;

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    image_url VARCHAR(500),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_available ON products(available);

-- Seed product data
INSERT INTO products (name, description, price, category, sku, image_url, available) VALUES
('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and hi-res audio support.', 299.99, 'Electronics', 'ELEC-HP-001', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', true),
('Mechanical Gaming Keyboard', 'TKL mechanical keyboard with Cherry MX Red switches, RGB backlight, and aluminum frame.', 149.99, 'Electronics', 'ELEC-KB-001', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', true),
('4K Ultra HD Monitor 27"', '27-inch IPS panel with 4K resolution, 144Hz refresh rate, HDR400, and USB-C connectivity.', 599.99, 'Electronics', 'ELEC-MN-001', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', true),
('Ergonomic Office Chair', 'Fully adjustable ergonomic chair with lumbar support, breathable mesh back, and 5-year warranty.', 449.99, 'Furniture', 'FURN-CH-001', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', true),
('Standing Desk 60"', 'Electric height-adjustable standing desk with dual motors, memory presets, and cable management.', 799.99, 'Furniture', 'FURN-DK-001', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500', true),
('Wireless Charging Pad', 'Qi-certified 15W wireless charger compatible with all Qi-enabled devices, with LED indicator.', 39.99, 'Electronics', 'ELEC-WC-001', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500', true),
('Premium Running Shoes', 'Lightweight mesh running shoes with responsive foam cushioning and breathable upper.', 129.99, 'Footwear', 'FOOT-RS-001', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', true),
('Stainless Steel Water Bottle', '32oz insulated water bottle that keeps drinks cold 24hrs/hot 12hrs, with leakproof lid.', 34.99, 'Kitchen', 'KTCH-WB-001', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', true),
('Yoga Mat Premium', 'Non-slip 6mm thick yoga mat with alignment lines, eco-friendly TPE material, carrying strap.', 59.99, 'Sports', 'SPRT-YM-001', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500', true),
('Smart Watch Series X', 'Smartwatch with health monitoring, GPS, 7-day battery, and compatibility with iOS/Android.', 349.99, 'Electronics', 'ELEC-SW-001', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', true),
('Bluetooth Speaker Portable', 'Waterproof (IPX7) portable speaker with 360° sound, 20-hour playtime, and speakerphone.', 89.99, 'Electronics', 'ELEC-SP-001', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', true),
('Coffee Maker Programmable', '12-cup programmable coffee maker with thermal carafe, auto-brew, and strength control.', 79.99, 'Kitchen', 'KTCH-CM-001', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500', true),
('Laptop Backpack 15.6"', 'Anti-theft laptop backpack with USB charging port, water-resistant, organized compartments.', 69.99, 'Bags', 'BAG-LB-001', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', true),
('USB-C Hub 10-in-1', '10-in-1 USB-C hub with 4K HDMI, 3x USB 3.0, SD card reader, 100W PD charging.', 59.99, 'Electronics', 'ELEC-HB-001', 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500', true),
('Desk Lamp LED Adjustable', 'Architect-style LED desk lamp with 5 color temperatures, dimmer, USB charging port.', 49.99, 'Electronics', 'ELEC-DL-001', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', true),
('Resistance Bands Set', 'Set of 5 resistance bands (10-50 lbs) with handles, door anchor, and carry bag.', 24.99, 'Sports', 'SPRT-RB-001', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', true),
('Air Purifier HEPA', 'True HEPA air purifier covering 500 sq ft, removes 99.97% of particles, quiet operation.', 199.99, 'Home', 'HOME-AP-001', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500', true),
('Cast Iron Skillet 12"', 'Pre-seasoned 12-inch cast iron skillet, oven-safe to 500°F, for stovetop and campfire use.', 44.99, 'Kitchen', 'KTCH-SK-001', 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500', true),
('Noise-Cancelling Earbuds', 'True wireless earbuds with ANC, 8-hour battery (32 with case), IPX4 water resistance.', 199.99, 'Electronics', 'ELEC-EB-001', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', true),
('Programmable Robot Kit', 'STEM educational robot kit for ages 12+, includes sensors, motors, and coding software.', 119.99, 'Toys', 'TOYS-RK-001', 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=500', true);

-- ============================================================
-- Inventory Database Setup
-- ============================================================
\c shopsphere_inventory;

CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);

-- Seed inventory data (matching product IDs 1-20)
INSERT INTO inventory (product_id, quantity, reserved_quantity) VALUES
(1, 50, 0),   -- Wireless Headphones
(2, 75, 0),   -- Mechanical Keyboard
(3, 30, 0),   -- 4K Monitor
(4, 20, 0),   -- Ergonomic Chair
(5, 15, 0),   -- Standing Desk
(6, 100, 0),  -- Wireless Charging Pad
(7, 60, 0),   -- Running Shoes
(8, 150, 0),  -- Water Bottle
(9, 80, 0),   -- Yoga Mat
(10, 45, 0),  -- Smart Watch
(11, 90, 0),  -- Bluetooth Speaker
(12, 40, 0),  -- Coffee Maker
(13, 70, 0),  -- Laptop Backpack
(14, 55, 0),  -- USB-C Hub
(15, 65, 0),  -- Desk Lamp
(16, 200, 0), -- Resistance Bands
(17, 25, 0),  -- Air Purifier
(18, 35, 0),  -- Cast Iron Skillet
(19, 60, 0),  -- Earbuds
(20, 30, 0);  -- Robot Kit

-- ============================================================
-- Orders Database Setup
-- ============================================================
\c shopsphere_orders;

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
