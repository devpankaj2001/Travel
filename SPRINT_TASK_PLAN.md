# Activity Booking Platform — Sprint-Wise Task Implementation Plan
**Document Version:** 1.0.0  
**Target:** Production-ready Phase 1 (December 2026)  
**Execution Strategy:** Jira/Linear-style Granular Task Checklist organized by Sprints (Vertical Slices: DB → Backend API → Frontend UI → Integration/Testing).

---

## Sprint Overview & Progress Dashboard

| Sprint | Timeline | Focus Area | Total Tasks | Completed | Status |
|---|---|---|---|---|---|
| **Sprint 1** | Weeks 1 & 2 | Core Foundation, RBAC & Supplier Onboarding | 12 Tasks | 3 / 12 | 🟡 In Progress |
| **Sprint 2** | Weeks 3 & 4 | Supplier KYC Approval, E-Sign & Activity Master | 12 Tasks | 0 / 12 | ⚪ Backlog |
| **Sprint 3** | Weeks 5 & 6 | Packages, Pricing Engine, Slots & Inventory | 12 Tasks | 0 / 12 | ⚪ Backlog |
| **Sprint 4** | Weeks 7 & 8 | Customer Search, Detail Page & Checkout Flow | 12 Tasks | 0 / 12 | ⚪ Backlog |
| **Sprint 5** | Weeks 9 & 10 | Razorpay, Instant Voucher/QR & Post-Booking | 12 Tasks | 0 / 12 | ⚪ Backlog |
| **Sprint 6** | Weeks 11 & 12 | Settlements, Reviews, SEO, Analytics & Go-Live | 12 Tasks | 0 / 12 | ⚪ Backlog |
| **TOTAL** | **12 Weeks** | **Full Phase 1 Marketplace** | **72 Tasks** | **3 / 72** | **Target: Dec 2026** |

---

# 🏃 SPRINT 1: Core Foundation, RBAC & Supplier Onboarding
**Sprint Goal:** Deliver complete database baseline, RBAC security, SMS/Email OTP service abstraction, supplier registration wizard, and KYC document uploads.

---

### [TASK-S1-01] Database Baseline & RBAC Schema Migrations
- **Type:** `[Database Migration]`
- **Module:** Foundation / Architecture
- **Description:** Create MySQL migration scripts for initial database setup:
  - `roles` (`id`, `name`, `slug`: `customer`, `supplier`, `admin`, `accountant`, `created_at`)
  - `permissions` (`id`, `name`, `slug`, `module`)
  - `role_permissions` (`role_id`, `permission_id`)
  - `users` (`id`, `email`, `phone`, `password_hash`, `role_id`, `status`: `active`, `inactive`, `suspended`, `created_at`, `updated_at`)
- **Files to Create/Modify:**
  - `backend/database/migrations/001_create_rbac_tables.sql`
  - `backend/database/seeds/001_roles_and_permissions.sql`
- **Acceptance Criteria:**
  - [x] Migration runs cleanly with forward and rollback commands. (Executed in MySQL DB `booking_platform`)
  - [x] Seeds populate 4 default roles and base permission sets. (Site Admin, Accountant / Finance, Supplier, Customer)

---

### [TASK-S1-02] Centralized Logger, Error Handling & Config Baseline
- **Type:** `[Backend Architecture]`
- **Module:** Foundation / Architecture
- **Description:** Implement structured JSON logging (Winston or Pino), standardized API response envelopes (`{ success, data, error, timestamp }`), and environment variable validator.
- **Files to Create/Modify:**
  - `backend/config/environment.js`
  - `backend/config/logger.js`
  - `backend/middleware/errorHandler.js`
  - `backend/utils/apiResponse.js`
- **Acceptance Criteria:**
  - [ ] All unhandled exceptions return HTTP 500 in standard JSON format without leaking stack traces.
  - [ ] Request logs output HTTP method, path, response time, and status code.

---

### [TASK-S1-03] JWT Authentication & RBAC Middleware
- **Type:** `[Security / Middleware]`
- **Module:** Foundation / Authentication
- **Description:** Build authentication middleware to verify Bearer JWT tokens and enforce role-based and permission-based route guards.
- **Files to Create/Modify:**
  - `backend/middleware/auth.middleware.js`
  - `backend/services/token.service.js`
- **Acceptance Criteria:**
  - [x] Protected endpoints reject missing or expired tokens with HTTP 401.
  - [x] Forbidden role access returns HTTP 403 (enforces exact 4 roles: site_admin, accountant, supplier, customer).
  - [x] Self-or-Admin IDOR guard helper implemented and verified.

---

### [TASK-S1-04] OTP Service Abstraction (SMS + Email) & Rate Limiting
- **Type:** `[Backend Service]`
- **Module:** Module 1 & Module 8 (OTP Engine)
- **Description:** Create provider-agnostic notification service for generating and dispatching identical 6-digit OTPs via SMS (Twilio/Msg91) and Transactional Email (SendGrid/SMTP/AWS SES). Implement strict rate limiting (max 3 requests per 10 minutes per phone/email).
- **Files to Create/Modify:**
  - `backend/services/otp.service.js`
  - `backend/services/email.service.js`
  - `backend/middleware/rateLimiter.js`
- **Acceptance Criteria:**
  - [x] OTP expires after 10 minutes.
  - [x] Dispatches the exact same 6-digit OTP to both Mobile and Email channels.
  - [x] User can verify with the OTP using either their phone or email.
  - [x] Exceeding 3 attempts within 10 minutes blocks requests with HTTP 429 Too Many Requests (enforced at both DB & Express middleware layers).
  - [x] Single unified 6-digit verification activates customer or verifies supplier.

---

### [TASK-S1-05] Supplier Profile & KYC Document Tables
- **Type:** `[Database Migration]`
- **Module:** Module 1 (Supplier Registration)
- **Description:** Create database migrations for supplier company data and uploaded legal documents:
  - `supplier_profiles` (`id`, `user_id`, `company_name`, `legal_name`, `business_reg_no`, `tax_id`, `contact_name`, `contact_email`, `contact_phone`, `address_line1`, `city`, `state`, `country`, `postal_code`, `bank_name`, `account_number`, `ifsc_swift`, `status`: `draft`, `submitted`, `under_verification`, `approved`, `rejected`, `suspended`)
  - `supplier_documents` (`id`, `supplier_id`, `doc_type`: `trade_license`, `id_proof`, `tax_cert`, `file_url`, `status`: `pending`, `verified`, `rejected`, `rejection_reason`, `expiry_date`)
- **Files to Create/Modify:**
  - `backend/database/migrations/002_create_supplier_tables.sql`
- **Acceptance Criteria:**
  - [ ] Foreign keys cascade properly on `user_id`.
  - [ ] Table constraints enforce unique `tax_id` and `user_id`.

---

### [TASK-S1-06] Supplier Auth Endpoints (Send & Verify OTP)
- **Type:** `[Backend API]`
- **Module:** Module 1
- **Description:** Implement supplier signup and login endpoints using mobile and email OTP:
  - `POST /api/v1/auth/supplier/send-otp`
  - `POST /api/v1/auth/supplier/verify-otp` (Validates OTP, creates user with role `supplier` if new, returns JWT)
- **Files to Create/Modify:**
  - `backend/routes/authRoutes.js`
  - `backend/controllers/authController.js`
- **Acceptance Criteria:**
  - [ ] Same OTP sent to both email and phone.
  - [ ] Successful OTP returns JWT with `supplier` role payload.

---

### [TASK-S1-07] Supplier Profile & Document Upload Endpoints
- **Type:** `[Backend API]`
- **Module:** Module 1
- **Description:** Implement authenticated supplier profile management and secure multipart document uploads:
  - `GET /api/v1/suppliers/me`
  - `PUT /api/v1/suppliers/me` (Update legal, contact, and banking information)
  - `POST /api/v1/suppliers/documents` (Multer / S3 / local uploads with mime-type validation: PDF, JPG, PNG, max 5MB)
- **Files to Create/Modify:**
  - `backend/routes/supplierRoutes.js`
  - `backend/controllers/supplierController.js`
  - `backend/middleware/uploadMiddleware.js`
- **Acceptance Criteria:**
  - [ ] Disallows executable files or files > 5MB.
  - [ ] Document record created with status `pending`.

---

### [TASK-S1-08] Frontend Design System & Theme Foundation
- **Type:** `[Frontend UI]`
- **Module:** Foundation
- **Description:** Establish unified color palette tokens, typography (`Manrope`), form control components (`Input`, `Select`, `Button`, `Badge`), and layout shells matching the luxury design system.
- **Files to Create/Modify:**
  - `frontend/app/globals.css`
  - `frontend/components/ui/Button.js`
  - `frontend/components/ui/Input.js`
  - `frontend/components/ui/Badge.js`
- **Acceptance Criteria:**
  - [ ] Components are responsive across mobile, tablet, and desktop viewports.

---

### [TASK-S1-09] Supplier Registration Wizard UI (Step 1: Auth & OTP)
- **Type:** `[Frontend UI]`
- **Module:** Module 1
- **Description:** Build Step 1 of the Supplier Registration page:
  - Dual phone + email inputs.
  - 6-digit OTP verification inputs with 60-second resend countdown timer.
- **Files to Create/Modify:**
  - `frontend/app/supplier/register/page.js`
  - `frontend/components/supplier/Step1AuthOtp.js`
- **Acceptance Criteria:**
  - [ ] Entering valid OTP advances to Step 2 without page reload.

---

### [TASK-S1-10] Supplier Registration Wizard UI (Step 2: Company & Bank Details)
- **Type:** `[Frontend UI]`
- **Module:** Module 1
- **Description:** Build Step 2:
  - Company Legal Name, Registration Number, GST/Tax Number.
  - Primary Contact Person Name, Phone, Email.
  - Bank details: Bank Name, Account Number, IFSC/SWIFT code.
- **Files to Create/Modify:**
  - `frontend/components/supplier/Step2CompanyDetails.js`
- **Acceptance Criteria:**
  - [ ] Form validation prevents proceeding if required fields or tax formats are invalid.

---

### [TASK-S1-11] Supplier Registration Wizard UI (Step 3: KYC Upload & Submit)
- **Type:** `[Frontend UI]`
- **Module:** Module 1
- **Description:** Build Step 3:
  - Drag-and-drop document upload zones for Trade License, Identity Proof, and Tax Certificate.
  - File preview, file size indicator, and submit application button.
- **Files to Create/Modify:**
  - `frontend/components/supplier/Step3KycUpload.js`
- **Acceptance Criteria:**
  - [ ] Successful submission transitions supplier state to `Submitted` and redirects to the Pending Verification view.

---

### [TASK-S1-12] Sprint 1 Automated Integration Tests & Code Review
- **Type:** `[Testing / QA]`
- **Module:** Quality Assurance
- **Description:** Write integration tests covering the complete Sprint 1 vertical slice: OTP generation, validation, profile creation, and document upload.
- **Files to Create/Modify:**
  - `backend/tests/integration/supplierAuth.test.js`
  - `backend/tests/integration/supplierProfile.test.js`
- **Acceptance Criteria:**
  - [ ] 100% test pass rate on auth and registration flows.

---

# 🏃 SPRINT 2: Supplier Approval, E-Sign & Activity Catalog Master
**Sprint Goal:** Enable Admin to review KYC documents, generate and execute digital E-Sign contracts, approve suppliers, and allow approved suppliers to create and submit rich activity master listings.

---

### [TASK-S2-01] E-Sign Agreements & Audit Logs Schema
- **Type:** `[Database Migration]`
- **Module:** Module 1 & Module 5
- **Description:** Create MySQL tables for digital agreement tracking and security audit logs:
  - `esign_documents` (`id`, `supplier_id`, `agreement_version`, `document_url`, `signer_name`, `signed_at`, `ip_address`, `status`: `pending`, `signed`)
  - `audit_logs` (`id`, `actor_id`, `entity_type`, `entity_id`, `action`, `old_value`, `new_value`, `reason`, `ip_address`, `created_at`)
- **Files to Create/Modify:**
  - `backend/database/migrations/003_create_esign_and_audit_tables.sql`
- **Acceptance Criteria:**
  - [ ] Audit logs track state changes for supplier approval and document reviews.

---

### [TASK-S2-02] Activity Catalog Master Tables (Activities, Media, Categories, Destinations)
- **Type:** `[Database Migration]`
- **Module:** Module 2 (Activity Creation)
- **Description:** Create database schema for activity catalog:
  - `destinations` (`id`, `name`, `slug`, `country`, `image_url`, `is_active`)
  - `categories` (`id`, `name`, `slug`, `icon_name`, `is_active`)
  - `activities` (`id`, `supplier_id`, `destination_id`, `category_id`, `title`, `slug`, `short_desc`, `full_desc`, `highlights`, `duration_mins`, `meeting_point`, `latitude`, `longitude`, `itinerary`, `inclusions`, `exclusions`, `requirements`, `restrictions`, `age_limit_min`, `age_limit_max`, `what_to_carry`, `status`: `draft`, `submitted`, `under_review`, `approved`, `published`, `unpublished`, `rejected`, `rejection_reason`)
  - `activity_media` (`id`, `activity_id`, `media_type`: `image`, `video`, `url`, `is_primary`, `sort_order`)
- **Files to Create/Modify:**
  - `backend/database/migrations/004_create_activity_tables.sql`
- **Acceptance Criteria:**
  - [ ] Foreign keys link `activities` to `supplier_profiles`, `destinations`, and `categories`.

---

### [TASK-S2-03] Admin Supplier Verification & Status APIs
- **Type:** `[Backend API]`
- **Module:** Module 1 & Module 5
- **Description:** Implement Admin endpoints to inspect suppliers and approve/reject individual KYC documents:
  - `GET /api/v1/admin/suppliers` (Filters: `status`, `search`, pagination)
  - `GET /api/v1/admin/suppliers/:id` (Full profile + documents)
  - `PUT /api/v1/admin/suppliers/:id/documents/:docId/verify` (Status: `verified` or `rejected` with reason)
  - `PUT /api/v1/admin/suppliers/:id/status` (Transition: `approved`, `rejected`, `suspended`)
- **Files to Create/Modify:**
  - `backend/routes/adminRoutes.js`
  - `backend/controllers/adminSupplierController.js`
- **Acceptance Criteria:**
  - [ ] Rejections mandate a non-empty `rejection_reason`.
  - [ ] Action is recorded in `audit_logs`.

---

### [TASK-S2-04] E-Sign Agreement Generation & Signing API
- **Type:** `[Backend API]`
- **Module:** Module 1
- **Description:** Implement contract signing flow:
  - `GET /api/v1/suppliers/me/esign` (Fetch standard marketplace agreement HTML/PDF)
  - `POST /api/v1/suppliers/me/esign/sign` (Capture digital consent, IP address, timestamp, signer full name)
- **Files to Create/Modify:**
  - `backend/controllers/esignController.js`
  - `backend/services/pdfService.js`
- **Acceptance Criteria:**
  - [ ] Agreement marked as `signed` with legal timestamp and IP.
  - [ ] Supplier status cannot become `approved` until agreement is signed.

---

### [TASK-S2-05] Activity Catalog Authoring Endpoints
- **Type:** `[Backend API]`
- **Module:** Module 2
- **Description:** Implement CRUD endpoints for activity listings:
  - `POST /api/v1/activities` (Create `draft`)
  - `PUT /api/v1/activities/:id` (Update activity details; checks supplier ownership)
  - `POST /api/v1/activities/:id/media` (Upload gallery images & video URL, reorder, set primary)
  - `DELETE /api/v1/activities/:id/media/:mediaId`
  - `POST /api/v1/activities/:id/submit` (Validate all required fields present, transition to `submitted`)
- **Files to Create/Modify:**
  - `backend/routes/activityRoutes.js`
  - `backend/controllers/activityController.js`
- **Acceptance Criteria:**
  - [ ] Only approved suppliers can create activities.
  - [ ] Unapproved suppliers receive HTTP 403.

---

### [TASK-S2-06] Admin Activity Review & Publishing Endpoints
- **Type:** `[Backend API]`
- **Module:** Module 5
- **Description:** Implement admin activity approval pipeline:
  - `GET /api/v1/admin/activities` (Filter by `submitted`, `under_review`, `approved`, `published`)
  - `PUT /api/v1/admin/activities/:id/review` (Actions: `approve`, `reject`, `request_changes` with notes)
  - `PUT /api/v1/admin/activities/:id/publish` (Publish / unpublish toggle)
- **Files to Create/Modify:**
  - `backend/controllers/adminActivityController.js`
- **Acceptance Criteria:**
  - [ ] Only activities with status `approved` can transition to `published`.

---

### [TASK-S2-07] Admin Supplier Verification Dashboard UI
- **Type:** `[Frontend UI]`
- **Module:** Module 5
- **Description:** Build Admin Supplier Management screen:
  - Supplier table with search and status badges.
  - Detail drawer/modal: Company info, bank info, KYC doc previewer with 1-click Approve / Reject button and reason input.
- **Files to Create/Modify:**
  - `frontend/app/admin/suppliers/page.js`
  - `frontend/components/admin/SupplierVerificationDrawer.js`
- **Acceptance Criteria:**
  - [ ] Admin can approve or reject documents and see live status changes.

---

### [TASK-S2-08] Supplier E-Sign Signing Modal UI
- **Type:** `[Frontend UI]`
- **Module:** Module 1
- **Description:** Build supplier e-sign interface:
  - Scrollable terms and agreement text.
  - Signer Name input, "I agree" checkbox, and submit signature button.
- **Files to Create/Modify:**
  - `frontend/components/supplier/EsignModal.js`
- **Acceptance Criteria:**
  - [ ] Cannot submit without checking consent.

---

### [TASK-S2-09] Supplier Activity Creation Wizard (Step 1 & 2: Content & Location)
- **Type:** `[Frontend UI]`
- **Module:** Module 2
- **Description:** Build activity creator wizard:
  - Step 1: Title, Category dropdown, Destination dropdown, Short & Full Description.
  - Step 2: Duration, Meeting Point description, Google Maps coordinates (Lat/Lng) picker.
- **Files to Create/Modify:**
  - `frontend/app/supplier/activities/create/page.js`
  - `frontend/components/supplier/ActivityStepOverview.js`
- **Acceptance Criteria:**
  - [ ] Auto-generates unique URL slug from title.

---

### [TASK-S2-10] Supplier Activity Creation Wizard (Step 3 & 4: Itinerary, Rules & Media)
- **Type:** `[Frontend UI]`
- **Module:** Module 2
- **Description:** Build remaining wizard steps:
  - Step 3: Interactive Itinerary step builder (Time, Title, Description), Highlights tagger, Inclusions/Exclusions tags.
  - Step 4: Multi-image drag & drop upload, thumbnail sort ordering, primary image selector.
  - Review & Submit for Approval button.
- **Files to Create/Modify:**
  - `frontend/components/supplier/ActivityStepItinerary.js`
  - `frontend/components/supplier/ActivityStepMedia.js`
- **Acceptance Criteria:**
  - [ ] Uploaded images can be reordered and primary image selected.

---

### [TASK-S2-11] Admin Activity Approval Queue UI
- **Type:** `[Frontend UI]`
- **Module:** Module 5
- **Description:** Build Admin Activity Review page:
  - Pending approval queue with quick preview card.
  - Side-by-side activity preview modal showing highlights, gallery, meeting point, and policies.
  - Approve, Reject (with reason dialog), and Publish buttons.
- **Files to Create/Modify:**
  - `frontend/app/admin/activities/page.js`
  - `frontend/components/admin/ActivityReviewModal.js`
- **Acceptance Criteria:**
  - [ ] Admin approval updates status and reflects immediately in the supplier dashboard.

---

### [TASK-S2-12] Sprint 2 Integration Tests & Verification
- **Type:** `[Testing / QA]`
- **Module:** Quality Assurance
- **Description:** Write automated integration tests for:
  - Supplier document verification & e-sign status transitions.
  - Activity creation, media association, and admin approval pipeline.
- **Files to Create/Modify:**
  - `backend/tests/integration/activityLifecycle.test.js`
- **Acceptance Criteria:**
  - [ ] All status machine transitions execute accurately.

---

# 🏃 SPRINT 3: Packages, Pricing Engine, Slots & Inventory
**Sprint Goal:** Implement the multi-package hierarchy, adult/child pricing schemas, date calendars, time slots, concurrency-safe inventory row-locking, and supplier operations manifests.

---

### [TASK-S3-01] Packages, Pricing & Cancellation Policy Schema
- **Type:** `[Database Migration]`
- **Module:** Module 3 & Module 4
- **Description:** Create MySQL tables for packages and pricing:
  - `cancellation_policies` (`id`, `name`, `free_cancellation_hours`, `refund_percent`, `policy_text`)
  - `activity_packages` (`id`, `activity_id`, `name`, `slug`, `description`, `duration_mins`, `cancellation_policy_id`, `inclusions`, `exclusions`, `min_pax`, `max_pax`, `is_active`)
  - `package_pricing` (`id`, `package_id`, `adult_base_price`, `adult_sell_price`, `child_base_price`, `child_sell_price`, `currency`, `valid_from`, `valid_to`)
- **Files to Create/Modify:**
  - `backend/database/migrations/005_create_packages_and_pricing_tables.sql`
  - `backend/database/seeds/002_default_cancellation_policies.sql`
- **Acceptance Criteria:**
  - [ ] Separates supplier base rate and customer sell price cleanly.

---

### [TASK-S3-02] Time Slots, Availability & Inventory Schema
- **Type:** `[Database Migration]`
- **Module:** Module 4 (Slots & Inventory)
- **Description:** Create MySQL tables for slots and transactional inventory:
  - `availability_dates` (`id`, `package_id`, `date`, `is_blackout`, `is_closed`)
  - `time_slots` (`id`, `package_id`, `start_time`, `end_time`, `capacity`, `cutoff_hours`, `is_active`)
  - `inventory` (`id`, `slot_id`, `date`, `total_capacity`, `booked_capacity`, `held_capacity`)
- **Files to Create/Modify:**
  - `backend/database/migrations/006_create_slots_and_inventory_tables.sql`
- **Acceptance Criteria:**
  - [ ] Unique index on `inventory(slot_id, date)` to prevent duplicate inventory records.

---

### [TASK-S3-03] Package Management Endpoints
- **Type:** `[Backend API]`
- **Module:** Module 3
- **Description:** Implement package CRUD endpoints:
  - `POST /api/v1/activities/:activityId/packages`
  - `GET /api/v1/activities/:activityId/packages`
  - `PUT /api/v1/packages/:id`
  - `DELETE /api/v1/packages/:id` (Soft delete toggle `is_active = 0`)
- **Files to Create/Modify:**
  - `backend/routes/packageRoutes.js`
  - `backend/controllers/packageController.js`
- **Acceptance Criteria:**
  - [ ] Activity can contain multiple active packages (Standard, VIP, etc.).

---

### [TASK-S3-04] Package Pricing Configuration API
- **Type:** `[Backend API]`
- **Module:** Module 4
- **Description:** Implement endpoints to set package rates:
  - `POST /api/v1/packages/:id/pricing` (Set default and date-range adult/child pricing)
  - `GET /api/v1/packages/:id/pricing`
- **Files to Create/Modify:**
  - `backend/controllers/pricingController.js`
- **Acceptance Criteria:**
  - [ ] Validates `adult_sell_price >= adult_base_price` to prevent negative margins.

---

### [TASK-S3-05] Time Slots & Date Availability Calendar API
- **Type:** `[Backend API]`
- **Module:** Module 4
- **Description:** Endpoints to manage schedule:
  - `POST /api/v1/packages/:id/slots` (Create recurring slots: e.g. 09:00, 14:00 with capacity)
  - `GET /api/v1/packages/:id/slots`
  - `POST /api/v1/packages/:id/availability/blackout` (Mark blackout dates)
  - `POST /api/v1/packages/:id/availability/stop-sale` (Toggle stop-sale on specific dates)
- **Files to Create/Modify:**
  - `backend/routes/availabilityRoutes.js`
  - `backend/controllers/availabilityController.js`
- **Acceptance Criteria:**
  - [ ] Blackout dates correctly omit slots from public availability responses.

---

### [TASK-S3-06] Concurrency-Safe Inventory Reservation Engine
- **Type:** `[Backend Service / Concurrency]`
- **Module:** Module 4
- **Description:** Build inventory reservation engine:
  - Uses MySQL row-level lock (`SELECT ... FOR UPDATE`) inside database transactions.
  - Holds inventory for 15 minutes during checkout.
  - Scheduled background cron to release expired holds.
- **Files to Create/Modify:**
  - `backend/services/inventoryService.js`
  - `backend/jobs/releaseExpiredHolds.js`
- **Acceptance Criteria:**
  - [ ] Concurrency test proves no overselling when 20 requests compete for 5 remaining seats.

---

### [TASK-S3-07] Supplier Operations Manifest & Stats API
- **Type:** `[Backend API]`
- **Module:** Module 15
- **Description:** Endpoints for supplier operational management:
  - `GET /api/v1/supplier/dashboard/overview` (Total activities, total slots, booked pax count)
  - `GET /api/v1/supplier/manifest?date=YYYY-MM-DD` (Operational passenger list grouped by slot)
- **Files to Create/Modify:**
  - `backend/controllers/supplierOperationsController.js`
- **Acceptance Criteria:**
  - [ ] Manifest returns guest counts, package names, and lead passenger details for selected date.

---

### [TASK-S3-08] Supplier Package Builder UI
- **Type:** `[Frontend UI]`
- **Module:** Module 3
- **Description:** Build Package configuration interface:
  - Add Package modal (Package Name, Description, Duration, Min/Max pax).
  - Inclusions & Exclusions custom tag lists per package.
  - Cancellation policy selector.
- **Files to Create/Modify:**
  - `frontend/app/supplier/activities/[id]/packages/page.js`
  - `frontend/components/supplier/PackageModal.js`
- **Acceptance Criteria:**
  - [ ] Packages display in list with active status toggle.

---

### [TASK-S3-09] Supplier Pricing Matrix UI
- **Type:** `[Frontend UI]`
- **Module:** Module 4
- **Description:** Build Pricing setup screen:
  - Adult Supplier Base Price & Customer Selling Price.
  - Child Base Price & Child Selling Price.
  - Profit margin / markup indicator auto-calculated.
- **Files to Create/Modify:**
  - `frontend/components/supplier/PackagePricingForm.js`
- **Acceptance Criteria:**
  - [ ] Input validates positive numeric currency values.

---

### [TASK-S3-10] Supplier Interactive Calendar & Slot Manager UI
- **Type:** `[Frontend UI]`
- **Module:** Module 4
- **Description:** Build Interactive Availability Calendar:
  - Full month calendar view showing daily capacity and booked numbers.
  - Quick actions: Mark Blackout Date, Toggle Stop-Sale.
  - Slot configuration panel (Add/Remove departure times, set slot pax limits).
- **Files to Create/Modify:**
  - `frontend/app/supplier/activities/[id]/calendar/page.js`
  - `frontend/components/supplier/AvailabilityCalendar.js`
- **Acceptance Criteria:**
  - [ ] Clicking a date shows all slots for that day and allows editing capacity.

---

### [TASK-S3-11] Supplier Manifest & Booked Slots Dashboard UI
- **Type:** `[Frontend UI]`
- **Module:** Module 15
- **Description:** Build Daily Departure Manifest screen:
  - Date picker to view departures.
  - Slots list with progress bar showing capacity filled.
  - Passenger table with Lead Passenger name, phone, and party size.
- **Files to Create/Modify:**
  - `frontend/app/supplier/manifest/page.js`
  - `frontend/components/supplier/ManifestTable.js`
- **Acceptance Criteria:**
  - [ ] Displays live passenger lists per departure slot.

---

### [TASK-S3-12] Sprint 3 Concurrency & Inventory Automated Tests
- **Type:** `[Testing / QA]`
- **Module:** Quality Assurance
- **Description:** Automated test suite simulating high-concurrency booking attempts and hold expiry.
- **Files to Create/Modify:**
  - `backend/tests/integration/inventoryLocking.test.js`
- **Acceptance Criteria:**
  - [ ] Zero overselling detected under simulated multi-threaded reservations.

---

# 🏃 SPRINT 4: Customer Search, Detail Page & Checkout Flow
**Sprint Goal:** Deliver faceted customer search with dynamic filters, SSR activity detail page with real-time package & slot selection, customer OTP authentication, and coupon promo engine.

---

### [TASK-S4-01] Customer Profile & Coupon Tables
- **Type:** `[Database Migration]`
- **Module:** Module 8 & Module 19
- **Description:** Create MySQL tables for customers and promo codes:
  - `customer_profiles` (`id`, `user_id`, `first_name`, `last_name`, `country_code`, `emergency_phone`, `terms_accepted_at`)
  - `coupons` (`id`, `code`, `discount_type`: `percentage`, `fixed`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `per_customer_limit`, `valid_from`, `valid_to`, `is_active`)
  - `coupon_redemptions` (`id`, `coupon_id`, `customer_id`, `booking_id`, `discount_applied`, `redeemed_at`)
- **Files to Create/Modify:**
  - `backend/database/migrations/007_create_customer_and_coupon_tables.sql`
- **Acceptance Criteria:**
  - [ ] Case-insensitive unique index on `coupons(code)`.

---

### [TASK-S4-02] Faceted Customer Search API
- **Type:** `[Backend API]`
- **Module:** Module 6 (Search & Filters)
- **Description:** High-performance search endpoint supporting:
  - Full-text search on title, destination, category.
  - Filters: `destination`, `category`, `minPrice`, `maxPrice`, `duration`, `rating`, `freeCancellation`, `instantConfirmation`.
  - Sort: `recommended`, `price_asc`, `price_desc`, `rating`.
  - Stable query parameters and pagination (`page`, `limit`).
- **Files to Create/Modify:**
  - `backend/routes/searchRoutes.js`
  - `backend/controllers/searchController.js`
- **Acceptance Criteria:**
  - [ ] Query response time < 250ms with 1,000+ indexed activities.

---

### [TASK-S4-03] Public Activity Detail & Live Availability API
- **Type:** `[Backend API]`
- **Module:** Module 7 (Detail Page)
- **Description:** Endpoints to power public detail view:
  - `GET /api/v1/public/activities/:slug` (Full activity data, active packages, media gallery, FAQs, reviews aggregate)
  - `GET /api/v1/public/packages/:id/availability?month=YYYY-MM` (Calendar days with remaining capacity)
  - `GET /api/v1/public/packages/:id/slots?date=YYYY-MM-DD` (Available slots and seat counts)
- **Files to Create/Modify:**
  - `backend/controllers/publicActivityController.js`
- **Acceptance Criteria:**
  - [ ] Returns only `published` activities; drafts return HTTP 404.

---

### [TASK-S4-04] Customer OTP Auth Endpoints
- **Type:** `[Backend API]`
- **Module:** Module 8
- **Description:** Implement customer mobile/email OTP authentication:
  - `POST /api/v1/auth/customer/send-otp`
  - `POST /api/v1/auth/customer/verify-otp` (Auto-creates user with role `customer` on first login, issues JWT)
  - `GET /api/v1/customer/profile` & `PUT /api/v1/customer/profile`
- **Files to Create/Modify:**
  - `backend/controllers/customerAuthController.js`
- **Acceptance Criteria:**
  - [ ] Seamless login preserves checkout cart state.

---

### [TASK-S4-05] Coupon Validation & Price Quote Engine API
- **Type:** `[Backend API]`
- **Module:** Module 9, 10 & 19
- **Description:** Server-authoritative price breakdown endpoint:
  - `POST /api/v1/coupons/validate` (Validates expiry, min order, and user redemption count)
  - `POST /api/v1/bookings/quote` (Takes `packageId`, `slotId`, `date`, `adultCount`, `childCount`, optional `couponCode`; computes exact subtotal, discount, taxes, and final payable amount)
- **Files to Create/Modify:**
  - `backend/routes/bookingRoutes.js`
  - `backend/controllers/quoteController.js`
  - `backend/services/pricingEngine.js`
- **Acceptance Criteria:**
  - [ ] Never trusts client prices; amounts calculated exclusively on server.

---

### [TASK-S4-06] Customer Search & Faceted Filter Page UI
- **Type:** `[Frontend UI]`
- **Module:** Module 6
- **Description:** Build Search & Listing screen:
  - Sticky sidebar with Category pills, Price range slider, Duration filters, and Free Cancellation toggle.
  - Sort dropdown (Price Low-to-High, High-to-Low, Top Rated).
  - Responsive Activity Cards (Primary photo, title, duration badge, cancellation tag, rating stars, starting price).
- **Files to Create/Modify:**
  - `frontend/app/search/page.js`
  - `frontend/components/search/FilterSidebar.js`
  - `frontend/components/search/ActivityCard.js`
- **Acceptance Criteria:**
  - [ ] URL query params synchronize smoothly with selected filters.

---

### [TASK-S4-07] Activity Detail Page — Hero Gallery & Content UI
- **Type:** `[Frontend UI]`
- **Module:** Module 7
- **Description:** Build top and middle sections of the SSR Activity Detail page:
  - Photo grid gallery with fullscreen Lightbox modal.
  - Title, destination breadcrumb, duration badge, rating summary.
  - Tabs: Overview, Highlights, Step-by-Step Itinerary, Inclusions/Exclusions, FAQs, Meeting Point Map.
- **Files to Create/Modify:**
  - `frontend/app/activity/[slug]/page.js`
  - `frontend/components/activity/ActivityGallery.js`
  - `frontend/components/activity/ActivityContentTabs.js`
- **Acceptance Criteria:**
  - [ ] Server-Side Rendered (SSR) for optimal SEO and performance.

---

### [TASK-S4-08] Activity Detail Page — Live Booking Widget UI
- **Type:** `[Frontend UI]`
- **Module:** Module 7
- **Description:** Build sticky Right-Hand Booking Widget:
  - Step 1: Package Selector (Standard vs VIP cards with price differences).
  - Step 2: Date Picker (Highlights available days; disables blackout dates).
  - Step 3: Slot Radio Pills (Shows remaining seats).
  - Step 4: Adults & Children counter (`- 1 +`).
  - "Book Now" CTA with live price calculation.
- **Files to Create/Modify:**
  - `frontend/components/activity/BookingWidget.js`
- **Acceptance Criteria:**
  - [ ] Dynamically updates available slots when date is changed.

---

### [TASK-S4-09] Customer Auth Modal & Auto-Login Flow UI
- **Type:** `[Frontend UI]`
- **Module:** Module 8
- **Description:** Build sleek Customer OTP Modal:
  - Mobile / Email input.
  - OTP auto-focus input boxes with countdown timer.
  - Stores auth token in secure cookie/localStorage and resumes checkout.
- **Files to Create/Modify:**
  - `frontend/components/auth/CustomerOtpModal.js`
- **Acceptance Criteria:**
  - [ ] User can log in without losing selected activity, date, or slot.

---

### [TASK-S4-10] Checkout Screen (Traveller Details & Review) UI
- **Type:** `[Frontend UI]`
- **Module:** Module 9 & 10
- **Description:** Build Checkout Page:
  - Lead Traveller contact details (Full Name, Email, Phone).
  - Guest names and age categories.
  - Special requests / notes textarea.
- **Files to Create/Modify:**
  - `frontend/app/checkout/page.js`
  - `frontend/components/checkout/TravellerForm.js`
- **Acceptance Criteria:**
  - [ ] Validates passenger counts match selected adult/child totals.

---

### [TASK-S4-11] Checkout Screen (Coupon Engine & Price Summary) UI
- **Type:** `[Frontend UI]`
- **Module:** Module 10 & 19
- **Description:** Build Checkout Right Sidebar:
  - Coupon Code input with "Apply" button and savings tag.
  - Itemized Price Breakdown (Base price, Adult/Child subtotal, Discount, Taxes, Total Amount).
  - Proceed to Payment button.
- **Files to Create/Modify:**
  - `frontend/components/checkout/OrderSummary.js`
- **Acceptance Criteria:**
  - [ ] Applying coupon immediately calls backend quote API and renders verified totals.

---

### [TASK-S4-12] Sprint 4 End-to-End Search & Quote Tests
- **Type:** `[Testing / QA]`
- **Module:** Quality Assurance
- **Description:** Write integration tests verifying search filtering accuracy, live slot retrieval, and price quote calculation with discount codes.
- **Files to Create/Modify:**
  - `backend/tests/integration/searchAndQuote.test.js`
- **Acceptance Criteria:**
  - [ ] Automated tests verify coupon limits, date cutoffs, and price integrity.

---

# 🏃 SPRINT 5: Razorpay, Instant Vouchers & Post-Booking
**Sprint Goal:** Complete Razorpay payment gateway integration with idempotent webhooks, instant confirmation, PDF vouchers with encrypted QR codes, transactional notifications, cancellation/refund engine, and customer "My Trips".

---

### [TASK-S5-01] Bookings, Payments, Vouchers & Refunds Schema
- **Type:** `[Database Migration]`
- **Module:** Module 10, 11, 12 & 14
- **Description:** Create MySQL tables for complete transaction lifecycle:
  - `bookings` (`id`, `booking_ref`, `customer_id`, `package_id`, `slot_id`, `booking_date`, `adult_count`, `child_count`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `currency`, `status`: `initiated`, `payment_pending`, `confirmed`, `completed`, `cancel_requested`, `cancelled`, `cancellation_reason`, `created_at`)
  - `travellers` (`id`, `booking_id`, `full_name`, `traveller_type`: `adult`, `child`, `age`, `is_lead`)
  - `payments` (`id`, `booking_id`, `gateway`: `razorpay`, `gateway_order_id`, `gateway_payment_id`, `gateway_signature`, `amount`, `status`: `created`, `captured`, `failed`, `idempotency_key`)
  - `vouchers` (`id`, `booking_id`, `voucher_code`, `qr_token`, `pdf_url`, `issued_at`)
  - `refunds` (`id`, `booking_id`, `payment_id`, `refund_amount`, `gateway_refund_id`, `status`: `requested`, `processing`, `refunded`, `failed`, `initiated_by`, `reason`)
  - `notifications` (`id`, `recipient`, `channel`: `email`, `sms`, `template_slug`, `status`: `sent`, `failed`, `sent_at`)
- **Files to Create/Modify:**
  - `backend/database/migrations/008_create_booking_and_payment_tables.sql`
- **Acceptance Criteria:**
  - [ ] Foreign keys cascade properly across bookings, payments, and vouchers.

---

### [TASK-S5-02] Razorpay Order Creation & Inventory Hold API
- **Type:** `[Backend API]`
- **Module:** Module 10 (Booking & Payment)
- **Description:** Build payment initiation endpoint:
  - `POST /api/v1/payments/create-order`
  - Reserves inventory in database transaction.
  - Creates booking record in `initiated` state.
  - Calls Razorpay Orders API server-side to generate `order_id`.
- **Files to Create/Modify:**
  - `backend/services/razorpayService.js`
  - `backend/controllers/paymentController.js`
- **Acceptance Criteria:**
  - [ ] Returns Razorpay Order ID and key to frontend.

---

### [TASK-S5-03] Razorpay Webhook & Idempotent Signature Verification API
- **Type:** `[Backend API / Security]`
- **Module:** Module 10 & 11
- **Description:** Build bulletproof payment verification:
  - `POST /api/v1/payments/verify` (Client payment callback)
  - `POST /api/v1/payments/webhook` (Server-to-server Razorpay webhook)
  - HMAC-SHA256 signature verification.
  - Idempotency guard: If payment ID already processed, return HTTP 200 without duplicate action.
  - Transition booking to `confirmed`, mark inventory permanently `booked`.
- **Files to Create/Modify:**
  - `backend/controllers/webhookController.js`
  - `backend/utils/cryptoHelper.js`
- **Acceptance Criteria:**
  - [ ] Multiple webhook retries execute safely without creating duplicate vouchers or inventory deductions.

---

### [TASK-S5-04] PDF Voucher Generation Engine with Encrypted QR Code
- **Type:** `[Backend Service]`
- **Module:** Module 12 (Vouchers & QR)
- **Description:** Build automated voucher engine:
  - Generates branded PDF voucher using Puppeteer/PDFKit.
  - Encodes secure signed JWT token into QR code pointing to verification endpoint: `GET /api/v1/vouchers/verify?token=...`.
  - Never exposes raw database IDs or sensitive PII directly in QR payload.
- **Files to Create/Modify:**
  - `backend/services/voucherPdfService.js`
  - `backend/services/qrService.js`
  - `backend/controllers/voucherController.js`
- **Acceptance Criteria:**
  - [ ] Scanning QR code validates booking authenticity and status.

---

### [TASK-S5-05] Transactional Notifications Engine (Email + SMS)
- **Type:** `[Backend Service]`
- **Module:** Module 13
- **Description:** Implement automated alerts triggered on booking events:
  - Payment Success & Instant Confirmation with PDF voucher attached.
  - Supplier alert for new booking.
  - Booking Cancellation and Refund notices.
- **Files to Create/Modify:**
  - `backend/services/notificationService.js`
  - `backend/templates/emails/bookingConfirmation.html`
  - `backend/templates/emails/bookingCancelled.html`
- **Acceptance Criteria:**
  - [ ] Asynchronous event-driven dispatch with failure retry logging.

---

### [TASK-S5-06] Cancellation Policy Engine & Gateway Refund API
- **Type:** `[Backend API]`
- **Module:** Module 14 (Cancellation & Refund)
- **Description:** Implement policy-driven cancellation:
  - `POST /api/v1/bookings/:id/cancel`
  - Checks booking date/time against cancellation policy (e.g. Free cancellation up to 24h prior).
  - Calculates exact refundable amount.
  - Triggers Razorpay Refund API (`POST /v1/payments/{payment_id}/refund`).
  - Restores released capacity in `inventory` table.
- **Files to Create/Modify:**
  - `backend/controllers/cancellationController.js`
  - `backend/services/refundService.js`
- **Acceptance Criteria:**
  - [ ] Cannot cancel completed or redeemed activities.
  - [ ] Inventory is immediately restored for other customers.

---

### [TASK-S5-07] Admin Booking Control Center API
- **Type:** `[Backend API]`
- **Module:** Module 16
- **Description:** Admin endpoints for booking operations:
  - `GET /api/v1/admin/bookings` (Search by booking ref, customer, supplier, date, status)
  - `GET /api/v1/admin/bookings/:id` (Full audit timeline, payment logs, gateway payloads)
  - `POST /api/v1/admin/bookings/:id/resend-voucher`
  - `POST /api/v1/admin/bookings/:id/manual-refund` (Admin override refund)
- **Files to Create/Modify:**
  - `backend/controllers/adminBookingController.js`
- **Acceptance Criteria:**
  - [ ] Full action audit log recorded for manual administrative interventions.

---

### [TASK-S5-08] Razorpay Client Integration & Checkout Modal UI
- **Type:** `[Frontend UI]`
- **Module:** Module 10
- **Description:** Integrate Razorpay SDK on frontend:
  - Loads Razorpay checkout script securely.
  - Opens payment modal with order options.
  - Handles payment success, modal dismissal, and failure retry handlers.
- **Files to Create/Modify:**
  - `frontend/components/checkout/RazorpayButton.js`
  - `frontend/hooks/useRazorpay.js`
- **Acceptance Criteria:**
  - [ ] Smooth transition to Booking Confirmation screen on success.

---

### [TASK-S5-09] Booking Confirmation & Success Screen UI
- **Type:** `[Frontend UI]`
- **Module:** Module 11 & 12
- **Description:** Build Booking Success page:
  - Celebration checkmark animation.
  - Booking Reference code, activity name, departure date, time slot, passenger count.
  - 1-Click "Download PDF Voucher" button.
  - "Add to Calendar" (.ics file) button.
- **Files to Create/Modify:**
  - `frontend/app/booking/success/[id]/page.js`
  - `frontend/components/booking/ConfirmationCard.js`
- **Acceptance Criteria:**
  - [ ] Voucher downloads immediately as a valid PDF.

---

### [TASK-S5-10] Customer "My Bookings / My Trips" Dashboard UI
- **Type:** `[Frontend UI]`
- **Module:** Module 20
- **Description:** Build Customer Post-Booking portal:
  - Tabs: `Upcoming Trips`, `Completed Trips`, `Cancelled Trips`.
  - Trip Cards showing photo, title, date, slot, voucher download button.
  - "Cancel Booking" button with confirmation modal displaying live calculated refund amount.
- **Files to Create/Modify:**
  - `frontend/app/my-trips/page.js`
  - `frontend/components/customer/TripCard.js`
  - `frontend/components/customer/CancelBookingModal.js`
- **Acceptance Criteria:**
  - [ ] Live refund calculation displays policy penalty before user confirms cancellation.

---

### [TASK-S5-11] Admin Booking Management Dashboard UI
- **Type:** `[Frontend UI]`
- **Module:** Module 16
- **Description:** Build Admin Booking Control Center:
  - Searchable booking table with status pills.
  - Detailed timeline drawer displaying payment timestamps, gateway reference IDs, voucher links, and resend buttons.
- **Files to Create/Modify:**
  - `frontend/app/admin/bookings/page.js`
  - `frontend/components/admin/BookingDetailDrawer.js`
- **Acceptance Criteria:**
  - [ ] Admin can view live payment statuses and trigger voucher resends.

---

### [TASK-S5-12] Sprint 5 Payment Webhook & Refund Automated Tests
- **Type:** `[Testing / QA]`
- **Module:** Quality Assurance
- **Description:** Test suite validating Razorpay webhook signature verification, idempotency replay protection, and cancellation refund math.
- **Files to Create/Modify:**
  - `backend/tests/integration/paymentsAndRefunds.test.js`
- **Acceptance Criteria:**
  - [ ] 100% test pass rate across webhook verification and refund calculations.

---

# 🏃 SPRINT 6: Settlements, Reviews, SEO, Analytics & Go-Live
**Sprint Goal:** Implement financial commission freezes, supplier settlement reports (CSV/Excel), verified customer reviews, SSR SEO metadata, GA4 analytics, security audits, and production deployment runbook.

---

### [TASK-S6-01] Commission, Settlement & Review Tables
- **Type:** `[Database Migration]`
- **Module:** Module 17, 18 & 21
- **Description:** Create MySQL tables for settlements, commissions, and ratings:
  - `commissions` (`id`, `supplier_id`, `activity_id`, `commission_type`: `percentage`, `fixed`, `rate_value`, `effective_from`)
  - `settlements` (`id`, `supplier_id`, `period_start`, `period_end`, `gross_amount`, `total_commission`, `refund_deductions`, `net_payable`, `status`: `pending`, `approved`, `paid`, `payout_ref`, `settled_at`)
  - `reviews` (`id`, `booking_id`, `customer_id`, `activity_id`, `rating`: 1-5, `comment`, `status`: `published`, `hidden`, `created_at`)
- **Files to Create/Modify:**
  - `backend/database/migrations/009_create_settlements_and_reviews_tables.sql`
- **Acceptance Criteria:**
  - [ ] Enforces one review per completed booking ID.

---

### [TASK-S6-02] Financial Commission Freeze & Ledger API
- **Type:** `[Backend Service / Finance]`
- **Module:** Module 17 (Commission Engine)
- **Description:** Build financial snapshot engine:
  - Upon booking confirmation, freezes supplier payable and marketplace commission amounts directly into the booking record.
  - Ensures future commission changes do not alter historical booking financials.
- **Files to Create/Modify:**
  - `backend/services/commissionService.js`
- **Acceptance Criteria:**
  - [ ] Financial audit trail maintains exact penny-level precision.

---

### [TASK-S6-03] Supplier Settlement Reporting & CSV Export API
- **Type:** `[Backend API]`
- **Module:** Module 18
- **Description:** Build financial settlement reports:
  - `GET /api/v1/admin/settlements` (Aggregate supplier payable balances with date range filters)
  - `GET /api/v1/admin/settlements/export` (Stream CSV/Excel file containing booking references, gross values, commission deducted, net payout)
  - `PUT /api/v1/admin/settlements/:id/status` (Mark settlement as `Approved` or `Paid`)
- **Files to Create/Modify:**
  - `backend/controllers/settlementController.js`
  - `backend/services/csvExportService.js`
- **Acceptance Criteria:**
  - [ ] CSV downloads cleanly with proper headers and financial totals.

---

### [TASK-S6-04] Verified Customer Reviews & Moderation API
- **Type:** `[Backend API]`
- **Module:** Module 21 (Reviews & Ratings)
- **Description:** Endpoints for review submissions:
  - `POST /api/v1/bookings/:id/review` (Only allowed if booking status is `completed` and no review exists)
  - `GET /api/v1/activities/:id/reviews` (Paginated public reviews with average rating)
  - `PUT /api/v1/admin/reviews/:id/moderate` (Admin hide/publish review)
- **Files to Create/Modify:**
  - `backend/routes/reviewRoutes.js`
  - `backend/controllers/reviewController.js`
- **Acceptance Criteria:**
  - [ ] Average rating and total review counts on activity update automatically.

---

### [TASK-S6-05] SSR SEO Engine (Metadata, Sitemap & Robots)
- **Type:** `[Frontend & Backend SEO]`
- **Module:** Module 22
- **Description:** Implement complete SEO foundation:
  - Dynamic `sitemap.xml` containing all published activities, destinations, and categories.
  - `robots.txt` disallowing checkout, account, and admin paths.
  - JSON-LD Structured Data (`TouristAttraction`, `Product`, `AggregateRating`, `BreadcrumbList`).
  - OpenGraph social media sharing metadata.
- **Files to Create/Modify:**
  - `frontend/app/sitemap.js`
  - `frontend/app/robots.js`
  - `frontend/components/seo/StructuredData.js`
- **Acceptance Criteria:**
  - [ ] Google Rich Results Test passes for activity product schema.

---

### [TASK-S6-06] GA4 Enhanced E-Commerce Analytics Integration
- **Type:** `[Frontend Analytics]`
- **Module:** Module 23
- **Description:** Wire Google Analytics 4 (GA4) enhanced e-commerce event tracking:
  - `view_item` (Activity detail view)
  - `select_item` (Package selection)
  - `begin_checkout` (Proceed to checkout)
  - `purchase` (Verified payment with transaction ID and revenue)
  - `refund` (Cancellation executed)
- **Files to Create/Modify:**
  - `frontend/services/analytics.js`
  - `frontend/components/analytics/GoogleAnalytics.js`
- **Acceptance Criteria:**
  - [ ] Never sends sensitive PII or payment card details in event payloads.

---

### [TASK-S6-07] Admin Settlement & Finance Dashboard UI
- **Type:** `[Frontend UI]`
- **Module:** Module 18
- **Description:** Build Accountant / Finance portal:
  - Overview cards: Gross Merchandise Value (GMV), Total Commission Earned, Net Supplier Payout Pending.
  - Payout ledger table with date filters and "Export to CSV" button.
- **Files to Create/Modify:**
  - `frontend/app/admin/finance/page.js`
  - `frontend/components/admin/SettlementLedgerTable.js`
- **Acceptance Criteria:**
  - [ ] Financial figures format accurately in currency symbols.

---

### [TASK-S6-08] Verified Review Submission & Display UI
- **Type:** `[Frontend UI]`
- **Module:** Module 21
- **Description:** Build review UI:
  - Modal on Completed Trip card in "My Trips": 1–5 Interactive Star rating, tags selector, review text.
  - Reviews breakdown and testimonial cards on Activity Detail page.
- **Files to Create/Modify:**
  - `frontend/components/customer/LeaveReviewModal.js`
  - `frontend/components/activity/ReviewsSection.js`
- **Acceptance Criteria:**
  - [ ] Only customers with completed bookings see the "Write a Review" button.

---

### [TASK-S6-09] Security Hardening & Penetration Testing
- **Type:** `[Security Audit]`
- **Module:** Module 24
- **Description:** Perform security testing across application:
  - Insecure Direct Object Reference (IDOR) check on vouchers and bookings.
  - SQL Injection & Cross-Site Scripting (XSS) input sanitization test.
  - Rate limiting verification on all public endpoints.
  - CORS and HTTP Security headers (`Helmet`, `HSTS`, `CSP`).
- **Files to Create/Modify:**
  - `backend/server.js`
  - `backend/middleware/securityHeaders.js`
- **Acceptance Criteria:**
  - [ ] Zero critical or high security vulnerabilities detected.

---

### [TASK-S6-10] User Acceptance Testing (UAT) Sign-off Run
- **Type:** `[UAT Testing]`
- **Module:** Module 24
- **Description:** Complete full end-to-end user journeys:
  - 1. Supplier onboards, uploads KYC, signs e-sign, and receives approval.
  - 2. Supplier creates activity with 2 packages and slots; Admin reviews and publishes.
  - 3. Customer searches, filters, selects slot, applies coupon, and pays via Razorpay sandbox.
  - 4. Customer downloads PDF voucher with valid QR code.
  - 5. Customer cancels eligible booking and receives sandbox refund.
  - 6. Supplier and Admin dashboards reflect correct booking and settlement data.
- **Files to Create/Modify:**
  - `docs/UAT_EXECUTION_RESULTS.md`
- **Acceptance Criteria:**
  - [ ] Complete end-to-end journey passes with formal sign-off.

---

### [TASK-S6-11] Production Deployment Runbook & Infrastructure Setup
- **Type:** `[DevOps / Deployment]`
- **Module:** Module 24
- **Description:** Prepare production deployment pipeline:
  - Production environment configuration (`.env.production`).
  - Database automated migration and backup cron jobs.
  - Process management setup (PM2 / Docker / Systemd).
  - Reverse proxy SSL certificates (Nginx / Cloudflare).
  - Documented Rollback runbook in case of deployment issues.
- **Files to Create/Modify:**
  - `docs/PRODUCTION_DEPLOYMENT_RUNBOOK.md`
  - `backend/ecosystem.config.js`
- **Acceptance Criteria:**
  - [ ] Cold start and disaster recovery procedures are documented and verified.

---

### [TASK-S6-12] Production Smoke Testing & Final Go-Live
- **Type:** `[Go-Live Verification]`
- **Module:** Module 24
- **Description:** Execute production smoke tests on production domain:
  - Verify SSL certificate and HTTPS redirection.
  - Verify transactional email dispatch and SMS delivery.
  - Verify live Razorpay credentials and webhook signature matching.
  - Verify sitemap indexing and Google Analytics real-time stream.
- **Files to Create/Modify:**
  - `docs/GO_LIVE_SMOKE_TEST_REPORT.md`
- **Acceptance Criteria:**
  - [ ] 100% smoke test checklist items verified green. System officially launched for December 2026.

---

## Developer Execution Instructions

When starting a sprint or task:
1. Select the task ID (e.g. `[TASK-S1-01]`).
2. Review the **Files to Create/Modify** and **Acceptance Criteria**.
3. Implement in vertical slice: Database migration → Backend API → Frontend UI.
4. Run integration tests to verify the Acceptance Criteria.
5. Check off the task checkbox `[x]` upon completion.
