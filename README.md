<div align="center">

<br/>

```
  ██████╗  █████╗ ███╗   ██╗████████╗███████╗███████╗███╗   ██╗
 ██╔════╝ ██╔══██╗████╗  ██║╚══██╔══╝██╔════╝██╔════╝████╗  ██║
 ██║      ███████║██╔██╗ ██║   ██║   █████╗  █████╗  ██╔██╗ ██║
 ██║      ██╔══██║██║╚██╗██║   ██║   ██╔══╝  ██╔══╝  ██║╚██╗██║
 ╚██████╗ ██║  ██║██║ ╚████║   ██║   ███████╗███████╗██║ ╚████║
  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝
```

# 🍱 Canteen Management System

**A full-stack, production-grade smart canteen platform with real-time kitchen dispatch, QR tableside ordering, live inventory, and executive analytics.**

<br/>

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

</div>

---

## ✨ What is this?

The **Canteen Management System** is an end-to-end digital canteen solution designed for institutions, restaurants, and corporate cafeterias. It replaces traditional paper ordering and manual kitchen workflows with a **live, touchless digital experience** — from QR-code tableside ordering to a real-time Kitchen Display System (KDS), role-based portals, loyalty rewards, PDF invoicing, and executive financial analytics.

---

## 🎯 Feature Requirements Fulfilled

| Category | Feature | Status |
|---|---|---|
| 🍽️ **Ordering** | QR-code tableside menu ordering | ✅ |
| 🍽️ **Ordering** | Takeaway / Dine-In / Delivery order modes | ✅ |
| 🍽️ **Ordering** | Dish customization (size, add-ons, kitchen notes) | ✅ |
| 🍽️ **Ordering** | Cart with promo code & loyalty point redemption | ✅ |
| 🔴 **Real-Time** | Socket.IO live order push to KDS | ✅ |
| 🔴 **Real-Time** | Real-time order status updates (customer view) | ✅ |
| 🔴 **Real-Time** | Live table status telemetry | ✅ |
| 👨‍🍳 **Kitchen KDS** | Kanban board: Received → Preparing → Ready → Completed | ✅ |
| 👨‍🍳 **Kitchen KDS** | One-click status transitions per order | ✅ |
| 📦 **Inventory** | Raw ingredient stock tracking | ✅ |
| 📦 **Inventory** | Low-stock alerts & configurable reorder thresholds | ✅ |
| 📦 **Inventory** | Stock add / deduct with live audit trail | ✅ |
| 📊 **Analytics** | Daily revenue, order count, active diner metrics | ✅ |
| 📊 **Analytics** | Hourly revenue rush chart (Recharts) | ✅ |
| 📊 **Analytics** | Category sales volume chart | ✅ |
| 📊 **Analytics** | PDF report export & Excel data export | ✅ |
| 🧾 **Billing** | Per-order PDF invoice download (jsPDF) | ✅ |
| 🏆 **Loyalty** | Loyalty points earn & redeem system | ✅ |
| 🔐 **Auth** | JWT-based login with bcrypt password hashing | ✅ |
| 🔐 **Auth** | Role-based route protection (Admin / Staff / Customer) | ✅ |
| 🌐 **i18n** | English + Sinhala bilingual support | ✅ |
| 🌙 **Theme** | Dark mode (default) + Light mode toggle | ✅ |
| 📱 **UX** | Responsive layout (mobile + desktop) | ✅ |
| 🔔 **Notifications** | In-app toast notifications + order chimes | ✅ |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT  (Vite + React 18)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Customer │  │  Staff   │  │  Admin   │  │   Auth    │  │
│  │   Menu   │  │   KDS    │  │Dashboard │  │  Pages    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘  │
│       └─────────────┴─────────────┴───────────────┘        │
│               Redux Toolkit Store (RTK)                     │
│      authSlice │ cartSlice │ orderSlice │ menuSlice         │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP REST + Socket.IO
┌──────────────────────────▼──────────────────────────────────┐
│              SERVER  (Express.js + Socket.IO)               │
│   /api/auth  /api/orders  /api/menu  /api/inventory        │
│   /api/tables  /api/analytics  /api/reviews                │
│              JWT Middleware + bcrypt                        │
└──────────────────────────┬──────────────────────────────────┘
                           │  mysql2 connection pool
┌──────────────────────────▼──────────────────────────────────┐
│              MySQL 8.0  (orbit_canteen DB)                  │
│  users │ orders │ order_items │ menu_items │ inventory      │
│  canteen_tables │ suppliers │ reviews │ audit_logs          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Role Portals

The system has **three distinct role-based portals**:

### 👤 Customer Portal — `/menu` `/orders` `/tables`
- Browse the full menu gallery with search, category, and dietary filters
- Customize dishes: portion size, add-ons, special kitchen notes
- Cart with promo codes (`ORBIT10` = 10% off) and loyalty point redemption
- Real-time order tracking with step-by-step progress indicator
- PDF invoice download and one-tap reorder
- QR tableside simulation view

### 👨‍🍳 Kitchen Staff Portal — `/staff`
- Live KDS with real-time Socket.IO order push
- 4-column Kanban: Received → Preparing → Ready → Completed
- One-click status transitions with sound feedback
- Inventory: add stock, deduct usage, view low-stock alerts
- New ingredient registration form

### 🛡️ Admin Portal — `/admin`
- KPI cards: daily revenue, order count, active diners, avg prep speed
- Recharts: hourly revenue rush + category sales volume
- Full menu catalogue: add items, edit pricing, toggle availability, set discounts
- PDF financial report export + Excel raw data export

---

## 🔑 Default Seed User Credentials

After running `seed.sql`, the following accounts are pre-loaded:

> **All seed accounts use the password:** `orbitcanteen2026`

| Role | Name | Email | Password |
|------|------|-------|----------|
| 🛡️ **Admin** | Dr. Orion Vance | `admin@orbitcanteen.io` | `orbitcanteen2026` |
| 👨‍🍳 **Staff** | Elena Rostova | `staff@orbitcanteen.io` | `orbitcanteen2026` |
| 👤 **Customer** | Alex Mercer | `customer@orbitcanteen.io` | `orbitcanteen2026` |
| 👤 **Customer** | Sophia Lin | `sophia.lin@orbitcanteen.io` | `orbitcanteen2026` |
| 👤 **Customer** | Marcus Vance | `marcus.vance@orbitcanteen.io` | `orbitcanteen2026` |

> ⚠️ **Security Notice:** Delete or reset these seed accounts before exposing the system publicly.
> Reset: `UPDATE users SET password_hash = '<bcrypt_hash>' WHERE email = '<email>';`

---

## 📦 Tech Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3 | UI framework |
| Vite | 5.2 | Build tool & dev server |
| Redux Toolkit | 2.2 | State management |
| React Router | 6.23 | Client-side routing |
| Ant Design | 5.18 | UI component library |
| Framer Motion | 11.2 | Animations & transitions |
| Recharts | 2.12 | Analytics charts |
| Socket.IO Client | 4.7 | Real-time communication |
| i18next | 23.11 | EN + Sinhala i18n |
| jsPDF | 2.5 | PDF invoice generation |
| XLSX | 0.18 | Excel export |
| Lucide React | 0.383 | Icon system |
| qrcode.react | 3.1 | QR code rendering |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 4.19 | REST API framework |
| Socket.IO | 4.7 | Real-time WebSocket server |
| mysql2 | 3.23 | MySQL database driver |
| jsonwebtoken | 9.0 | JWT authentication |
| bcryptjs | 2.4 | Password hashing |
| helmet | 7.1 | Security headers |
| express-rate-limit | 7.3 | API rate limiting |
| dotenv | 16.4 | Environment variables |

---

## 🖥️ Local Development Setup

### Prerequisites

- **Node.js** ≥ 18.x — [nodejs.org](https://nodejs.org)
- **npm** ≥ 9.x (comes with Node.js)
- **MySQL** 8.0 — [mysql.com/downloads](https://www.mysql.com/downloads/)
- **Git** — [git-scm.com](https://git-scm.com)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Anjanasbr2003/Cantene-Management-System.git
cd "Cantene-Management-System"
```

---

### Step 2 — Database Setup

```bash
# Via MySQL CLI (replace 'root' with your user)
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Or inside the MySQL shell:

```sql
SOURCE /full/path/to/database/schema.sql;
SOURCE /full/path/to/database/seed.sql;
```

This creates the `orbit_canteen` database with all tables and seed data.

---

### Step 3 — Configure Server Environment

Edit `server/.env`:

```env
PORT=5000
JWT_SECRET=your_strong_random_secret_here_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=orbit_canteen
```

> 🔒 Never commit `.env` to version control.

---

### Step 4 — Start the Backend Server

```bash
cd server
npm install
npm run dev
```

Server starts at **http://localhost:5000**

Expected console output:
```
🚀 Canteen Management API running on port 5000
✅ MySQL connected to orbit_canteen
🔌 Socket.IO ready
```

---

### Step 5 — Start the Frontend

Open a **new terminal**:

```bash
cd client
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

---

### Step 6 — Sign In

Visit **http://localhost:5173** and sign in with any [seed credentials](#-default-seed-user-credentials).

---

## 🌐 Production Deployment Guide

### Requirements
Ubuntu 22.04 LTS · Node.js 18+ · MySQL 8.0 · Nginx · PM2

---

### 1. Build the Frontend

```bash
cd client && npm install && npm run build
# Output → client/dist/
```

### 2. Start API with PM2

```bash
npm install -g pm2
cd server && npm install
pm2 start server.js --name "canteen-api"
pm2 save && pm2 startup
```

### 3. Nginx Configuration

`/etc/nginx/sites-available/canteen`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/canteen/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/canteen /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. HTTPS with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📁 Project Structure

```
Cantene-Management-System/
├── client/                          # React 18 + Vite SPA
│   ├── public/
│   │   └── canteen_dark_hero.jpg
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/                # CartDrawer
│   │   │   ├── common/              # NavHeader, AppleFooter
│   │   │   └── menu/                # CustomizationModal
│   │   ├── i18n/                    # EN + Sinhala translations
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── CustomerMenu.jsx
│   │   │   ├── StaffDashboard.jsx   # KDS + Inventory
│   │   │   ├── AdminDashboard.jsx   # Analytics + Menu mgmt
│   │   │   ├── OrderTracking.jsx    # Live order status
│   │   │   └── TableQRView.jsx      # Table management
│   │   ├── store/                   # Redux slices
│   │   ├── theme/                   # Ant Design themes
│   │   └── utils/                   # Audio, helpers
│   └── vite.config.js
│
├── server/                          # Express.js API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/auth.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── menuRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── tableRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── reviewRoutes.js
│   │   └── utils/mockStore.js
│   ├── server.js
│   └── .env                         # ← never commit!
│
└── database/
    ├── schema.sql                   # DDL — table definitions
    ├── seed.sql                     # DML — sample data
    └── setup.sql                    # Quick combined runner
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Sign in with email + password | ❌ |
| `POST` | `/api/auth/register` | Register new customer | ❌ |
| `GET` | `/api/auth/profile` | Get current user profile | ✅ JWT |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/orders` | List orders (role-filtered) | Optional |
| `GET` | `/api/orders/:id` | Get order detail | ✅ JWT |
| `POST` | `/api/orders` | Place a new order | ✅ JWT |
| `PATCH` | `/api/orders/:id/status` | Update order status | ✅ Staff/Admin |

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/menu` | List all menu items |
| `POST` | `/api/menu` | Create menu item |
| `PATCH` | `/api/menu/:id` | Update menu item |
| `DELETE` | `/api/menu/:id` | Delete menu item |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET / POST / PATCH` | `/api/inventory` | Inventory CRUD |
| `PATCH` | `/api/inventory/:id/stock` | Adjust stock level |
| `GET / PATCH` | `/api/tables` | Table management |
| `GET` | `/api/analytics/summary` | Revenue & KPI metrics |

---

## ⚡ Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_kds` | Client → Server | Join kitchen display room |
| `join_customer` | Client → Server | Subscribe to personal order updates |
| `new_order` | Server → KDS | New order placed by a customer |
| `order_updated` | Server → All | Order status changed |
| `table_status_changed` | Server → All | Table availability updated |

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API server port | `5000` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `random_secure_string` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `NODE_ENV` | Environment | `production` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `yourpassword` |
| `DB_NAME` | Database name | `orbit_canteen` |

---

## 🐛 Troubleshooting

**Server won't start**
- Ensure `server/.env` exists with all required variables
- Check MySQL: `sudo systemctl status mysql`
- Confirm database exists: `SHOW DATABASES;`

**Login fails — "Invalid email or password"**
- Confirm `seed.sql` ran successfully (`SELECT * FROM users;`)
- The seed hash corresponds to password `orbitcanteen2026`
- Verify `JWT_SECRET` is set and consistent

**Orders page is empty**
- Sign in first — orders require a valid JWT token
- Check server console for MySQL errors

**Socket.IO no live updates**
- Confirm server is running on port 5000
- In production, verify Nginx proxies `/socket.io/` correctly
- Check browser DevTools Network tab for WebSocket connection

---

## 🤝 Contributing

1. Fork this repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'feat: describe your change'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for modern canteen operations**
**Built By Anjana Sithum With the help of AI and Deddication**

*React 18 · Express.js · MySQL 8 · Socket.IO · Redux Toolkit*

</div>
