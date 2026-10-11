# Enterprise Booking Platform — Backend (Client Production Ready)

Enterprise-grade, secure Node.js + Express + MySQL backend for the Booking Platform. Architected from day one for seamless transition between local development, staging, and high-scale live production deployments with zero code modifications needed.

---

## 🚀 Production-First Philosophy & Environment Management

All configurations, credentials, URLs, domain CORS whitelists, storage paths, SMTP gateways, and database parameters are strictly decoupled from source code and managed via **`.env`**.

### 📋 Environment Variables Breakdown (`.env`)

| Variable | Development Default | Production Recommended Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `development` | `production` | Enables strict validation, hides stack traces, enables caching |
| `PORT` | `5000` | `5000` (or reverse proxy port) | Server listen port |
| `BACKEND_URL` | `http://localhost:5000` | `https://api.yourdomain.com` | Base backend URL used for file/media links |
| `FRONTEND_URL` | `http://localhost:3000` | `https://yourdomain.com` | Base URL used in email verification & password reset links |
| `ALLOWED_ORIGINS` | `http://localhost:3000,...` | `https://yourdomain.com,https://admin.yourdomain.com` | Whitelist for CORS requests |
| `DB_HOST` | `127.0.0.1` | `db.aws.rds.com` / `10.0.x.x` | MySQL host address |
| `DB_PORT` | `3306` | `3306` | MySQL port |
| `DB_USER` | `root` | `app_prod_user` | MySQL user |
| `DB_PASSWORD` | *(empty)* | `StrongRandomPassword#99` | MySQL password |
| `DB_NAME` | `booking_platform` | `client_booking_prod` | Database name (auto-migrated without hardcoded SQL) |
| `DB_SSL` | `false` | `true` | Required for AWS RDS, DigitalOcean Managed MySQL |
| `JWT_SECRET` | `dev_secret_key` | `openssl rand -hex 32` (>= 32 chars) | Secret key for Signing Access Tokens |
| `JWT_EXPIRES_IN` | `7d` | `1d` / `7d` | Access token lifetime |
| `JWT_REFRESH_SECRET`| `dev_refresh_secret` | `openssl rand -hex 32` (>= 32 chars) | Secret key for Signing Refresh Tokens |
| `JWT_REFRESH_EXPIRES_IN`| `30d` | `30d` | Refresh token lifetime |
| `RATE_LIMIT_WINDOW_MS`| `900000` (15m) | `900000` | DDoS & brute force window |
| `RATE_LIMIT_MAX_REQUESTS`| `200` | `200` | Max requests per IP in window |
| `UPLOAD_DIR` | `./uploads` | `/var/www/booking/uploads` | Path for uploaded supplier documents |
| `MAX_FILE_SIZE_MB` | `10` | `10` | Maximum file upload size limit |
| `SMTP_HOST` | `smtp.mailtrap.io` | `smtp.sendgrid.net` / `email-smtp.us-east-1.amazonaws.com` | Live SMTP server |
| `SMTP_PORT` | `587` | `587` (TLS) or `465` (SSL) | SMTP port |
| `SMTP_SECURE` | `false` | `false` for 587, `true` for 465 | TLS vs SSL flag |
| `SMTP_USER` | *(user)* | `apikey` / `ses-smtp-user` | SMTP username |
| `SMTP_PASS` | *(pass)* | `smtp-secret-key` | SMTP password |
| `SMTP_FROM_NAME` | `Booking Platform` | `Your Brand Name` | Display name in outgoing emails |
| `SMTP_FROM_EMAIL`| `no-reply@...` | `support@yourdomain.com` | Sender email address |
| `DEFAULT_CURRENCY` | `INR` | `INR` / `USD` / `AED` / `EUR` | Default system transaction currency |
| `DEFAULT_COUNTRY` | `India` | `India` / `UAE` / `United States` | Default jurisdiction |
| `ADMIN_DEFAULT_EMAIL` | `admin@bookingplatform.com` | `admin@clientdomain.com` | Initial admin email for seed script |
| `ADMIN_DEFAULT_PASSWORD` | `Admin@Secure2026!` | `StrongClientPassword2026!` | Initial admin password for seed script |
| `SEED_DEMO_DATA` | `true` | `false` | Set to `false` in production to omit demo mock data |

---

## 🏗️ Architecture & Folder Structure

```text
backend/
├── config/
│   └── index.js                 # Centralized configuration with production validation
├── modules/
│   ├── auth/                    # Customer, Supplier, Admin Auth & Token Lifecycle
│   ├── users/                   # Profile view/edit, password change
│   ├── suppliers/               # Supplier portal, onboarding status & document upload
│   ├── admin/                   # Database-driven RBAC, supplier approvals, audit logs
│   ├── activities/              # Activity catalog & slots (Sprint 2 ready)
│   ├── bookings/                # Booking records & participants (Sprint 2 ready)
│   ├── payments/                # Payment auditing & gateway integration
│   ├── notifications/           # In-app notifications & read tracking
│   └── reports/                 # Revenue and financial reports
├── middleware/
│   ├── auth.middleware.js       # JWT authentication & requirePermission (RBAC)
│   ├── validation.middleware.js # Express-validator request sanitization
│   ├── upload.middleware.js     # Multer document upload with dynamic limits & type check
│   ├── audit.middleware.js      # Activity audit log recorder
│   └── error.middleware.js      # Production-safe error handler (no stack leaks)
├── services/
│   ├── token.service.js         # JWT signing with unique RFC 7519 jti & rotation
│   ├── otp.service.js           # 6-digit OTP generation, expiry & SMS hook
│   └── email.service.js         # Transactional email service & notification DB logging
├── database/
│   ├── connection.js            # MySQL2 connection pool with SSL & transactions
│   ├── schema.sql               # Dynamic, DB-agnostic SQL schema (23 tables)
│   ├── migrate.js               # Dynamic migration runner (uses DB_NAME from .env)
│   └── seed.js                  # Env-configurable seeder (admin + optional demo data)
├── routes/
│   └── index.js                 # Central API route aggregator (/api/v1)
├── uploads/                     # Uploaded files (documents, media)
├── server.js                    # Express app with Helmet, CORS whitelist & Rate limiting
├── test-api.js                  # Automated test suite
├── package.json
└── .env
```

---

## 🗄️ Database Architecture (23 Tables)

All tables use `utf8mb4` encoding and InnoDB engine with foreign keys:

1. **RBAC**: `roles`, `permissions`, `role_permissions`
2. **Users**: `users` (includes future-ready fields `account_type`, `customer_segment`)
3. **Suppliers**: `suppliers`, `supplier_documents`, `supplier_verifications`, `esign_documents`
4. **Activities**: `activities` (with `booking_channel`), `activity_media`, `activity_slots`, `activity_pricing`, `activity_inventory`
5. **Bookings**: `bookings`, `booking_items`, `booking_participants`
6. **Payments**: `payments`, `vouchers`
7. **Audit & Utilities**: `notifications`, `activity_logs`, `otps`, `password_resets`, `refresh_tokens`

---

## 🔒 Security Hardening

- **Helmet Security Headers**: Enabled cross-origin and security headers.
- **Dynamic CORS Whitelist**: Only requests from `ALLOWED_ORIGINS` in `.env` are permitted in production.
- **Rate Limiting**: Integrated `express-rate-limit` against DDoS and credential brute force attacks.
- **SQL Injection Prevention**: 100% prepared parameterized queries via `mysql2/promise`.
- **RFC 7519 JWT ID (`jti`)**: Unique token identifiers prevent collisions during simultaneous logins.
- **Password Security**: Adaptive bcrypt hashing with configurable `BCRYPT_SALT_ROUNDS`.
- **Zero Information Leakage**: Stack traces and raw database errors are strictly suppressed when `NODE_ENV=production`.

---

## 🛠️ Deployment Checklist (Going Live)

1. **Clone repository on server & install dependencies:**
   ```bash
   cd backend
   npm install --production
   ```
2. **Setup `.env` configuration:**
   - Copy `.env.example` to `.env`
   - Set `NODE_ENV=production`
   - Configure live database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`)
   - Generate strong JWT keys:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Set `ALLOWED_ORIGINS` to your live domain(s).
   - Configure production SMTP credentials (SendGrid, Amazon SES, etc.).
   - Set `SEED_DEMO_DATA=false`.
3. **Run database setup:**
   ```bash
   npm run db:setup
   ```
4. **Run Automated Test Suite:**
   ```bash
   node test-api.js
   ```
5. **Start Process Manager (PM2 / Systemd):**
   ```bash
   pm2 start server.js --name "booking-api" -i max
   pm2 save
   ```
