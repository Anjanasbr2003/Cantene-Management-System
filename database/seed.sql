-- ============================================================
-- ORBIT CANTEEN MANAGEMENT SYSTEM — SEED DATA (DML)
-- Comprehensive test data set for system evaluation & testing
-- ============================================================

USE orbit_canteen;


-- ------------------------------------------------------------
-- 1. SEED USERS
-- ------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, avatar, phone, loyalty_points, created_at) VALUES
('usr_admin', 'Dr. Orion Vance', 'admin@orbitcanteen.io', '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+1 800-555-0199', 1250, '2026-08-01 10:00:00'),
('usr_staff', 'Elena Rostova', 'staff@orbitcanteen.io', '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', 'staff', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+1 800-555-0142', 450, '2026-08-01 10:30:00'),
('usr_customer', 'Alex Mercer', 'customer@orbitcanteen.io', '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', 'customer', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', '+1 800-555-0188', 340, '2026-08-02 09:15:00'),
('usr_customer_2', 'Sophia Lin', 'sophia.lin@orbitcanteen.io', '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '+1 800-555-0177', 180, '2026-08-03 11:20:00'),
('usr_customer_3', 'Marcus Vance', 'marcus.vance@orbitcanteen.io', '$2a$10$DqxgVAupYb/eHn6iU19MtOmz0r/3TXroh/uVQKuCY2LwnnxbFcrOW', 'customer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+1 800-555-0166', 520, '2026-08-04 14:45:00');

-- ------------------------------------------------------------
-- 2. SEED SUPPLIERS
-- ------------------------------------------------------------
INSERT INTO suppliers (id, name, contact, phone, lead_time_days, created_at) VALUES
('sup_1', 'Apex Bio-Organics', 'orders@apexorganics.io', '+1 555-9012', 2, '2026-07-15 08:00:00'),
('sup_2', 'Starlight Dairy & Produce', 'supply@starlightdairy.com', '+1 555-4421', 1, '2026-07-15 08:30:00'),
('sup_3', 'CyberGrains & Bakery', 'logistics@cybergrains.io', '+1 555-8833', 3, '2026-07-15 09:00:00');

-- ------------------------------------------------------------
-- 3. SEED INVENTORY ITEMS
-- ------------------------------------------------------------
INSERT INTO inventory_items (id, sku, name, category, unit, current_stock, reorder_level, purchase_price, supplier_id, batch_number, expiry_date, last_updated) VALUES
('inv_1', 'INV-COFF-01', 'Quantum Espresso Beans', 'Beverages Raw', 'kg', 45.00, 15.00, 18.50, 'sup_1', 'BT-2026-08A', '2026-10-15 00:00:00', '2026-08-09 12:00:00'),
('inv_2', 'INV-MILK-02', 'Organic Oat Milk', 'Dairy & Plant', 'liters', 8.00, 12.00, 3.20, 'sup_2', 'BT-2026-08B', '2026-08-20 00:00:00', '2026-08-09 12:00:00'),
('inv_3', 'INV-MEAT-03', 'Wagyu Beef Patties', 'Meat & Proteins', 'units', 65.00, 20.00, 7.50, 'sup_1', 'BT-2026-08C', '2026-08-28 00:00:00', '2026-08-09 12:00:00'),
('inv_4', 'INV-AVOC-04', 'Hass Avocados', 'Fresh Produce', 'kg', 14.00, 10.00, 4.80, 'sup_2', 'BT-2026-08D', '2026-08-19 00:00:00', '2026-08-09 12:00:00'),
('inv_5', 'INV-TRUF-05', 'Black Truffle Oil', 'Gourmet Condiments', 'bottles', 12.00, 5.00, 32.00, 'sup_3', 'BT-2026-07Z', '2026-12-15 00:00:00', '2026-08-09 12:00:00'),
('inv_6', 'INV-CHEES-06', 'Aged Cheddar Slices', 'Dairy & Plant', 'pack', 0.00, 10.00, 5.50, 'sup_2', 'BT-2026-07X', '2026-09-05 00:00:00', '2026-08-09 12:00:00');

-- ------------------------------------------------------------
-- 4. SEED MENU ITEMS
-- ------------------------------------------------------------
INSERT INTO menu_items (id, name, description, price, category, image_url, dietary_tags, sizes, add_ons, nutritional_info, is_available, rating, review_count, is_happy_hour_discount, discount_percent, created_at) VALUES
('menu_1', 'Quantum Espresso', 'High-altitude roasted dark roast infused with nitrogen micro-bubbles for velocity smoothness.', 4.50, 'Beverages', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600', 
 '["Vegan", "Gluten-Free", "Keto"]',
 '[{"name": "Single Shot (S)", "priceOffset": 0}, {"name": "Double Shot (M)", "priceOffset": 1.2}, {"name": "Hyper Velocity (L)", "priceOffset": 2.2}]',
 '[{"name": "Oat Milk Foam", "price": 0.8}, {"name": "Vanilla Plasma Syrups", "price": 0.5}]',
 '{"calories": 15, "protein": 0.5, "carbs": 2, "fats": 0}',
 TRUE, 4.90, 38, FALSE, 0.00, '2026-08-01 10:00:00'),

('menu_2', 'Nebula Matcha Latte', 'Ceremonial grade Japanese Uji matcha whisked with warm oat milk and agave nectar.', 6.00, 'Beverages', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
 '["Veg", "Vegan", "Gluten-Free"]',
 '[{"name": "Standard (M)", "priceOffset": 0}, {"name": "Grand Nebula (L)", "priceOffset": 1.5}]',
 '[{"name": "Collagen Boost", "price": 1.5}, {"name": "Boba Pearls", "price": 1.0}]',
 '{"calories": 140, "protein": 4, "carbs": 18, "fats": 3.5}',
 TRUE, 4.80, 24, TRUE, 15.00, '2026-08-01 10:30:00'),

('menu_3', 'Cyber Wagyu Burger', 'A5 Wagyu patty with black truffle aioli, aged cheddar, caramelised onions on brioche.', 16.50, 'Meals', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
 '["Non-Veg"]',
 '[{"name": "Single Stack (M)", "priceOffset": 0}, {"name": "Double Gravity Stack (L)", "priceOffset": 5.5}]',
 '[{"name": "Crispy Bacon", "price": 2.0}, {"name": "Fried Farm Egg", "price": 1.5}]',
 '{"calories": 720, "protein": 42, "carbs": 48, "fats": 38}',
 TRUE, 4.95, 64, FALSE, 0.00, '2026-08-01 11:00:00'),

('menu_4', 'Zero-G Avocado Toast', 'Sourdough toast topped with smashed Hass avocados, pink radish, micro-greens and poached egg.', 11.50, 'Breakfast', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
 '["Veg", "Keto"]',
 '[{"name": "1 Slice", "priceOffset": -2.5}, {"name": "2 Slices", "priceOffset": 0}]',
 '[{"name": "Smoked Salmon", "price": 4.0}, {"name": "Feta Cheese", "price": 1.5}]',
 '{"calories": 380, "protein": 14, "carbs": 32, "fats": 22}',
 TRUE, 4.70, 19, FALSE, 0.00, '2026-08-01 11:30:00'),

('menu_5', 'Supernova Truffle Pasta', 'Handcrafted tagliatelle tossed in creamy black truffle oil, wild mushrooms, and parmesan.', 18.00, 'Meals', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600',
 '["Veg"]',
 '[{"name": "Regular", "priceOffset": 0}, {"name": "Family Size", "priceOffset": 8.0}]',
 '[{"name": "Grilled Chicken Breast", "price": 3.5}]',
 '{"calories": 640, "protein": 18, "carbs": 75, "fats": 28}',
 TRUE, 4.90, 42, FALSE, 0.00, '2026-08-01 12:00:00'),

('menu_6', 'Dark Matter Chocolate Brownie', 'Warm fudge brownie made with 85% Valrhona cacao, served with vanilla bean gelato.', 7.50, 'Snacks', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
 '["Veg"]',
 '[{"name": "Single Slice", "priceOffset": 0}]',
 '[{"name": "Extra Gelato Scoop", "price": 2.0}]',
 '{"calories": 410, "protein": 6, "carbs": 54, "fats": 21}',
 TRUE, 4.85, 31, FALSE, 0.00, '2026-08-01 12:30:00');

-- ------------------------------------------------------------
-- 5. SEED MENU-INVENTORY LINKS
-- ------------------------------------------------------------
INSERT INTO menu_inventory_links (menu_item_id, inventory_id) VALUES
('menu_1', 'inv_1'),
('menu_2', 'inv_2'),
('menu_3', 'inv_3'),
('menu_3', 'inv_5'),
('menu_4', 'inv_4'),
('menu_5', 'inv_5');

-- ------------------------------------------------------------
-- 6. SEED CANTEEN TABLES
-- ------------------------------------------------------------
INSERT INTO canteen_tables (id, table_number, capacity, status, active_order_id, qr_code_url) VALUES
('tbl_1', 'T-01', 2, 'Vacant', NULL, 'T-01'),
('tbl_2', 'T-02', 4, 'Occupied', 'ORD-9822', 'T-02'),
('tbl_3', 'T-03', 2, 'Vacant', NULL, 'T-03'),
('tbl_4', 'T-04', 4, 'Occupied', 'ORD-9821', 'T-04'),
('tbl_5', 'T-05', 6, 'Cleaning', NULL, 'T-05'),
('tbl_6', 'T-06', 2, 'Vacant', NULL, 'T-06');

-- ------------------------------------------------------------
-- 7. SEED ORDERS
-- ------------------------------------------------------------
INSERT INTO orders (id, customer_id, customer_name, order_type, table_number, delivery_address, status, subtotal, discount, tax, total_amount, loyalty_points_earned, loyalty_points_redeemed, payment_method, payment_status, estimated_prep_minutes, created_at) VALUES
('ORD-9821', 'usr_customer', 'Alex Mercer', 'Dine-In', 'T-04', NULL, 'Preparing', 23.70, 2.00, 1.90, 23.60, 23, 20, 'Card Online', 'Paid', 12, '2026-08-09 11:45:00'),
('ORD-9820', 'usr_customer_2', 'Sophia Lin', 'Takeaway', NULL, NULL, 'Ready', 12.20, 0.00, 0.98, 13.18, 12, 0, 'Wallet', 'Paid', 8, '2026-08-09 11:35:00'),
('ORD-9819', 'usr_customer_3', 'Marcus Vance', 'Delivery', NULL, 'Sector 7, Tech Lab Tower 3, Suite 402', 'Completed', 18.00, 0.00, 1.44, 19.44, 18, 0, 'Card Online', 'Paid', 15, '2026-08-09 10:55:00');

-- ------------------------------------------------------------
-- 8. SEED ORDER ITEMS
-- ------------------------------------------------------------
INSERT INTO order_items (id, order_id, menu_item_id, name, selected_size, price, quantity, selected_add_ons, special_instructions) VALUES
('ori_1', 'ORD-9821', 'menu_3', 'Cyber Wagyu Burger', 'Single Stack (M)', 16.50, 1, '[{"name": "Fried Farm Egg", "price": 1.5}]', 'Medium rare patty please'),
('ori_2', 'ORD-9821', 'menu_1', 'Quantum Espresso', 'Double Shot (M)', 5.70, 1, '[]', ''),
('ori_3', 'ORD-9820', 'menu_2', 'Nebula Matcha Latte', 'Standard (M)', 5.10, 2, '[{"name": "Boba Pearls", "price": 1.0}]', 'Less ice'),
('ori_4', 'ORD-9819', 'menu_5', 'Supernova Truffle Pasta', 'Regular', 18.00, 1, '[]', 'Extra parmesan cheese');

-- ------------------------------------------------------------
-- 9. SEED STOCK MOVEMENTS
-- ------------------------------------------------------------
INSERT INTO stock_movements (id, inventory_id, item_name, type, quantity, unit, batch_number, responsible_staff, reason, created_at) VALUES
('mov_1', 'inv_1', 'Quantum Espresso Beans', 'Stock-In', 20.00, 'kg', 'BT-2026-08A', 'Elena Rostova', 'Purchase Order PO-1042 fulfilled', '2026-08-07 09:00:00'),
('mov_2', 'inv_2', 'Organic Oat Milk', 'Wastage', 2.00, 'liters', 'BT-2026-07Y', 'Elena Rostova', 'Spilled during espresso prep', '2026-08-08 14:30:00');

-- ------------------------------------------------------------
-- 10. SEED REVIEWS
-- ------------------------------------------------------------
INSERT INTO reviews (id, menu_item_id, menu_item_name, customer_name, rating, comment, status, created_at) VALUES
('rev_1', 'menu_3', 'Cyber Wagyu Burger', 'Alex Mercer', 5, 'Mindblowing juicy Wagyu patty with black truffle! Worth every credit!', 'Approved', '2026-08-06 18:20:00'),
('rev_2', 'menu_1', 'Quantum Espresso', 'Elena V.', 5, 'Super velvety nitro texture. Best caffeine boost in Sector 4!', 'Approved', '2026-08-04 10:15:00');

-- ------------------------------------------------------------
-- 11. SEED AUDIT LOGS
-- ------------------------------------------------------------
INSERT INTO audit_logs (id, action, performed_by, details, created_at) VALUES
('audit_1', 'INVENTORY_STOCK_UPDATE', 'Elena Rostova (Staff)', 'Logged Stock-In of 20kg Quantum Espresso Beans', '2026-08-07 09:00:00'),
('audit_2', 'MENU_HAPPY_HOUR_TOGGLE', 'Dr. Orion Vance (Admin)', 'Activated 15% Happy Hour discount on Nebula Matcha Latte', '2026-08-08 11:10:00');
