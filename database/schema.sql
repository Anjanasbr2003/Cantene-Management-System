-- ============================================================
-- ORBIT CANTEEN MANAGEMENT SYSTEM — DATABASE SCHEMA (DDL)
-- Compatible with PostgreSQL 12+, MySQL 8.0+, and SQLite 3.31+
-- ============================================================

-- Create and select database
CREATE DATABASE IF NOT EXISTS orbit_canteen;
USE orbit_canteen;

-- Drop tables if re-initializing (in reverse dependency order)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_inventory_links;
DROP TABLE IF EXISTS canteen_tables;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
    avatar VARCHAR(255),
    phone VARCHAR(30),
    loyalty_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------
-- 2. SUPPLIERS TABLE
-- ------------------------------------------------------------
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    contact VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    lead_time_days INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 3. INVENTORY ITEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE inventory_items (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    reorder_level DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    supplier_id VARCHAR(50) REFERENCES suppliers(id) ON DELETE SET NULL,
    batch_number VARCHAR(50),
    expiry_date TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_category ON inventory_items(category);

-- ------------------------------------------------------------
-- 4. MENU ITEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE menu_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image_url TEXT,
    dietary_tags TEXT, -- JSON array of tags: ["Vegan", "Gluten-Free"]
    sizes TEXT,        -- JSON array of size options
    add_ons TEXT,      -- JSON array of add-on options
    nutritional_info TEXT, -- JSON object: {"calories": 400, "protein": 20, ...}
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 4.80,
    review_count INT DEFAULT 0,
    is_happy_hour_discount BOOLEAN DEFAULT FALSE,
    discount_percent DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_menu_availability ON menu_items(is_available);

-- ------------------------------------------------------------
-- 5. MENU-INVENTORY LINK TABLE (Many-to-Many Recipe Links)
-- ------------------------------------------------------------
CREATE TABLE menu_inventory_links (
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    inventory_id VARCHAR(50) NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, inventory_id)
);

-- ------------------------------------------------------------
-- 6. CANTEEN TABLES (Dine-In Session Management)
-- ------------------------------------------------------------
CREATE TABLE canteen_tables (
    id VARCHAR(50) PRIMARY KEY,
    table_number VARCHAR(20) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'Vacant' CHECK (status IN ('Vacant', 'Occupied', 'Cleaning', 'Reserved')),
    active_order_id VARCHAR(50),
    qr_code_url VARCHAR(255)
);

-- ------------------------------------------------------------
-- 7. ORDERS TABLE
-- ------------------------------------------------------------
CREATE TABLE orders (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('Dine-In', 'Takeaway', 'Delivery')),
    table_number VARCHAR(20),
    delivery_address TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'Received' CHECK (status IN ('Received', 'Preparing', 'Ready', 'Served/Completed', 'Completed', 'Rejected', 'Cancelled')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    loyalty_points_earned INT DEFAULT 0,
    loyalty_points_redeemed INT DEFAULT 0,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'Card Online',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Paid',
    estimated_prep_minutes INT DEFAULT 15,
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- ------------------------------------------------------------
-- 8. ORDER ITEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE order_items (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(50) REFERENCES menu_items(id) ON DELETE SET NULL,
    name VARCHAR(120) NOT NULL,
    selected_size VARCHAR(50) NOT NULL DEFAULT 'Standard',
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected_add_ons TEXT, -- JSON array of selected add-ons
    special_instructions TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------
-- 9. STOCK MOVEMENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE stock_movements (
    id VARCHAR(50) PRIMARY KEY,
    inventory_id VARCHAR(50) NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    item_name VARCHAR(120) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('Stock-In', 'Consumption', 'Wastage', 'Return')),
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    batch_number VARCHAR(50),
    responsible_staff VARCHAR(100) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_inventory ON stock_movements(inventory_id);

-- ------------------------------------------------------------
-- 10. REVIEWS TABLE
-- ------------------------------------------------------------
CREATE TABLE reviews (
    id VARCHAR(50) PRIMARY KEY,
    menu_item_id VARCHAR(50) NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    menu_item_name VARCHAR(120) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Approved' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_menu_item ON reviews(menu_item_id);

-- ------------------------------------------------------------
-- 11. AUDIT LOGS TABLE
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    action VARCHAR(80) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
