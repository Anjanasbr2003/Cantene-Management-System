# Orbit Canteen Database Scripts

This directory contains standard ANSI SQL scripts for the Orbit Canteen Management System.

## File Overview
- `schema.sql`: Contains the complete DDL schema definition (tables, constraints, foreign keys, and indexes).
- `seed.sql`: Contains realistic test seed data for testing system flows (users, menu items, inventory, orders, reviews, tables, stock movements, audit logs).
- `setup.sql`: 1-click execution script that runs `schema.sql` and `seed.sql` in sequence.

## Execution & Import Instructions

### 1. PostgreSQL
```bash
# Create database
createdb orbit_canteen

# Import schema and seed data
psql -d orbit_canteen -f database/schema.sql
psql -d orbit_canteen -f database/seed.sql
```

### 2. MySQL / MariaDB (v8.0+)
```bash
# Login to MySQL and run setup
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS orbit_canteen;"
mysql -u root -p orbit_canteen < database/schema.sql
mysql -u root -p orbit_canteen < database/seed.sql
```

### 3. SQLite3
```bash
sqlite3 orbit_canteen.db < database/schema.sql
sqlite3 orbit_canteen.db < database/seed.sql
```

## Demo Credentials Included in Test Data
- **Admin**: `admin@orbitcanteen.io` (Password: `admin123`)
- **Staff**: `staff@orbitcanteen.io` (Password: `staff123`)
- **Customer**: `customer@orbitcanteen.io` (Password: `customer123`)
