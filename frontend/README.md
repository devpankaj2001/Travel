# Enterprise Booking Platform — Frontend (`bookfront`)

Production-ready Next.js 14 App Router frontend implementation for Sprint 1 authentication, RBAC management, and multi-tenant supplier onboarding.

---

## 🌐 Live URLs & Access

- **Frontend App**: `http://localhost:3001`
- **Backend API**: `http://localhost:5000/api/v1`

*(Note: Configured on port `3001` to prevent collisions with other local services on port `3000`).*

---

## 🏗️ Architecture & Folder Structure (`G:\wamp\www\Demo\bookfront`)

```text
bookfront/
├── app/
│   ├── layout.js              # Universal layout with AuthProvider & ToastProvider
│   ├── globals.css            # Modern Vanilla CSS design system & tokens
│   ├── page.js                # Central Portal Hub & 1-click test credentials
│   ├── customer/
│   │   ├── signup/page.js     # Customer registration (account_type & customer_segment)
│   │   ├── login/page.js      # Customer authentication
│   │   ├── dashboard/page.js  # Customer account summary & booking overview
│   │   └── profile/page.js    # Edit personal info & change password
│   ├── supplier/
│   │   ├── signup/page.js     # Supplier business registration
│   │   ├── verify-otp/page.js # 6-digit phone OTP verification + resend
│   │   ├── login/page.js      # Supplier authentication with KYC review check
│   │   ├── dashboard/page.js  # Compliance dashboard & document upload
│   │   └── profile/page.js    # Commercial & settlement bank account edit
│   ├── admin/
│   │   ├── login/page.js      # Staff authentication (Site Admin, Accountant, Finance)
│   │   └── dashboard/page.js  # RBAC matrix, supplier approvals & audit logs
│   ├── verify-email/page.js   # Dynamic email verification handler
│   └── reset-password/page.js # Forgot password & reset password forms
├── components/
│   ├── Navbar.js              # Sticky header with role badge & navigation
│   ├── Footer.js              # Footer branding & quick links
│   └── Toast.js               # Reactive toast notifications
├── hooks/
│   └── useAuth.js             # React Context hook for user state & JWT tokens
├── services/
│   ├── api.js                 # Universal fetch client with automatic Bearer token
│   └── auth.service.js        # Authentication & RBAC API methods
├── .env.local                 # Frontend environment variables
└── package.json
```

---

## 🔑 Available Test Portals & 1-Click Credentials

| Portal | Role | Credentials | Features |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer` | `customer@demo.com` / `Password@123` | Profile, bookings overview, password recovery |
| **Supplier** | `supplier` | `supplier@demo.com` / `Password@123` | Document uploads, KYC verification status, banking info |
| **Site Admin** | `site_admin` | `admin@bookingplatform.com` / `Admin@Secure2026!` | Approve/Reject suppliers, assign roles, view audit logs |
| **Accountant** | `site_accountant` | `accountant@bookingplatform.com` / `Password@123` | Revenue reports, bookings view, payment summaries |
| **Finance** | `finance` | `finance@bookingplatform.com` / `Password@123` | Payment audits, financial reporting, refunds |

---

## 🛠️ CLI Commands

```bash
# Start development server on port 3001
npm run dev

# Compile optimized production build
npm run build

# Start production server
npm run start
```
