-- ============================================================
-- ORBIT CANTEEN MANAGEMENT SYSTEM — 1-CLICK DATABASE SETUP
-- Executes schema setup and populates test data in sequence.
-- ============================================================

-- Step 1: Create & Select Database
CREATE DATABASE IF NOT EXISTS orbit_canteen;
USE orbit_canteen;

-- Step 2: Run Schema Initialization
\i schema.sql;

-- Step 3: Run Seed Data Population
\i seed.sql;

