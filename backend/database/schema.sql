-- ===============================================================
-- Enterprise Booking Platform - Database Schema
-- Architecture for Sprint 0 & Sprint 1
-- ===============================================================

-- Database name is dynamically controlled via DB_NAME in .env

-- ---------------------------------------------------------------
-- 1. ROLES & PERMISSIONS (RBAC)
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 2. USERS
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT UNSIGNED NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) NULL,
  -- Future-ready fields
  `account_type` ENUM('individual', 'organization') NOT NULL DEFAULT 'individual',
  `customer_segment` ENUM('retail', 'agent', 'corporate') NOT NULL DEFAULT 'retail',
  `status` ENUM('active', 'inactive', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active',
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `phone_verified_at` TIMESTAMP NULL DEFAULT NULL,
  `avatar_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role_id`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 3. SUPPLIERS & VERIFICATIONS
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `company_name` VARCHAR(191) NOT NULL,
  `trade_license_no` VARCHAR(100) NULL,
  `tax_id` VARCHAR(100) NULL,
  `contact_person` VARCHAR(100) NULL,
  `business_address` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `business_type` VARCHAR(100) NULL,
  `website` VARCHAR(255) NULL,
  `main_category` VARCHAR(100) NULL,
  `sub_category` VARCHAR(100) NULL,
  `services` JSON NULL,
  `description` TEXT NULL,
  `bank_name` VARCHAR(100) NULL,
  `bank_account_no` VARCHAR(100) NULL,
  `bank_iban` VARCHAR(100) NULL,
  `status` ENUM('pending_verification', 'under_review', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'pending_verification',
  `approval_notes` TEXT NULL,
  `approved_by` INT UNSIGNED NULL,
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_suppliers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_documents` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT UNSIGNED NOT NULL,
  `document_type` VARCHAR(50) NOT NULL,
  `document_url` VARCHAR(255) NOT NULL,
  `document_name` VARCHAR(191) NOT NULL,
  `file_size` INT UNSIGNED NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `rejection_reason` TEXT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `verified_at` TIMESTAMP NULL DEFAULT NULL,
  `verified_by` INT UNSIGNED NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_verifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT UNSIGNED NOT NULL,
  `verification_type` ENUM('email', 'otp', 'document', 'manual') NOT NULL,
  `status` ENUM('pending', 'in_progress', 'verified', 'failed') NOT NULL DEFAULT 'pending',
  `token_or_otp` VARCHAR(255) NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `verified_at` TIMESTAMP NULL DEFAULT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `esign_documents` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT UNSIGNED NOT NULL,
  `document_title` VARCHAR(191) NOT NULL,
  `document_url` VARCHAR(255) NOT NULL,
  `signed_status` ENUM('pending', 'signed', 'rejected') NOT NULL DEFAULT 'pending',
  `signed_at` TIMESTAMP NULL DEFAULT NULL,
  `ip_address` VARCHAR(45) NULL,
  `esign_reference` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 4. ACTIVITIES, MEDIA, SLOTS, PRICING & INVENTORY
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `activities` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `description` LONGTEXT NULL,
  `category` VARCHAR(100) NOT NULL,
  `location` VARCHAR(191) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 60,
  -- Future-ready field
  `booking_channel` ENUM('web', 'agent', 'api') NOT NULL DEFAULT 'web',
  `status` ENUM('draft', 'pending_approval', 'approved', 'rejected', 'active', 'inactive') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  INDEX `idx_activities_supplier` (`supplier_id`),
  INDEX `idx_activities_status` (`status`),
  INDEX `idx_activities_channel` (`booking_channel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_media` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `activity_id` INT UNSIGNED NOT NULL,
  `media_type` ENUM('image', 'video') NOT NULL DEFAULT 'image',
  `url` VARCHAR(255) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT FALSE,
  `display_order` SMALLINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_slots` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `activity_id` INT UNSIGNED NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `days_of_week` VARCHAR(50) NOT NULL DEFAULT '1,2,3,4,5,6,7',
  `max_capacity` INT UNSIGNED NOT NULL DEFAULT 20,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_pricing` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `activity_id` INT UNSIGNED NOT NULL,
  `tier_name` ENUM('adult', 'child', 'infant', 'group') NOT NULL DEFAULT 'adult',
  `price` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  -- Future-ready field
  `customer_segment` ENUM('retail', 'agent', 'corporate') NOT NULL DEFAULT 'retail',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  INDEX `idx_pricing_activity` (`activity_id`),
  INDEX `idx_pricing_segment` (`customer_segment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_inventory` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `activity_id` INT UNSIGNED NOT NULL,
  `slot_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `total_capacity` INT UNSIGNED NOT NULL DEFAULT 20,
  `booked_capacity` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('available', 'sold_out', 'blocked') NOT NULL DEFAULT 'available',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`slot_id`) REFERENCES `activity_slots`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_slot_date` (`slot_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 5. BOOKINGS, ITEMS & PARTICIPANTS
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT UNSIGNED NOT NULL,
  -- Future-ready fields
  `booking_channel` ENUM('web', 'agent', 'api') NOT NULL DEFAULT 'web',
  `customer_segment` ENUM('retail', 'agent', 'corporate') NOT NULL DEFAULT 'retail',
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded') NOT NULL DEFAULT 'pending',
  `booking_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  INDEX `idx_bookings_user` (`user_id`),
  INDEX `idx_bookings_status` (`status`),
  INDEX `idx_bookings_channel` (`booking_channel`),
  INDEX `idx_bookings_segment` (`customer_segment`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT UNSIGNED NOT NULL,
  `activity_id` INT UNSIGNED NOT NULL,
  `slot_id` INT UNSIGNED NOT NULL,
  `activity_date` DATE NOT NULL,
  `adults_count` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `children_count` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `unit_price` DECIMAL(10, 2) NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`slot_id`) REFERENCES `activity_slots`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking_participants` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_item_id` INT UNSIGNED NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `age_group` ENUM('adult', 'child', 'infant') NOT NULL DEFAULT 'adult',
  `id_type` VARCHAR(50) NULL,
  `id_number` VARCHAR(100) NULL,
  FOREIGN KEY (`booking_item_id`) REFERENCES `booking_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 6. PAYMENTS & VOUCHERS
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT UNSIGNED NOT NULL,
  `payment_reference` VARCHAR(100) NOT NULL UNIQUE,
  `transaction_id` VARCHAR(100) NULL,
  `payment_gateway` VARCHAR(50) NOT NULL DEFAULT 'razorpay',
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `status` ENUM('pending', 'authorized', 'captured', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(50) NULL,
  `gateway_response` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  INDEX `idx_payments_booking` (`booking_id`),
  INDEX `idx_payments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vouchers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT UNSIGNED NOT NULL,
  `voucher_code` VARCHAR(50) NOT NULL UNIQUE,
  `qr_code_url` VARCHAR(255) NULL,
  `status` ENUM('active', 'redeemed', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `valid_until` DATE NOT NULL,
  `redeemed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  INDEX `idx_vouchers_code` (`voucher_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 7. NOTIFICATIONS & ACTIVITY LOGS (AUDIT TRAIL)
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('email', 'sms', 'push', 'system') NOT NULL DEFAULT 'system',
  `status` ENUM('pending', 'sent', 'failed', 'read') NOT NULL DEFAULT 'pending',
  `metadata` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` INT UNSIGNED NULL,
  `description` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_logs_user` (`user_id`),
  INDEX `idx_logs_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 8. AUTH UTILITY TABLES (OTPs, Password Resets, Refresh Tokens)
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `otps` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `phone` VARCHAR(30) NULL,
  `email` VARCHAR(191) NULL,
  `purpose` VARCHAR(50) NOT NULL,
  `code` VARCHAR(10) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `is_used` BOOLEAN NOT NULL DEFAULT FALSE,
  `attempts` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_otps_lookup` (`email`, `phone`, `purpose`, `is_used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `expires_at` TIMESTAMP NOT NULL,
  `is_used` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pwd_reset_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(500) NOT NULL UNIQUE,
  `expires_at` TIMESTAMP NOT NULL,
  `revoked` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------
-- 9. PHASE 1 ENTITIES (From Detailed Specification)
-- ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `customer_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `first_name` VARCHAR(100) NULL,
  `last_name` VARCHAR(100) NULL,
  `phone` VARCHAR(30) NULL,
  `emergency_phone` VARCHAR(30) NULL,
  `nationality` VARCHAR(100) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `terms_accepted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `company_name` VARCHAR(191) NOT NULL,
  `legal_name` VARCHAR(191) NULL,
  `business_reg_no` VARCHAR(100) NULL,
  `tax_id` VARCHAR(100) NULL,
  `contact_person` VARCHAR(100) NULL,
  `contact_email` VARCHAR(191) NULL,
  `contact_phone` VARCHAR(30) NULL,
  `address_line1` TEXT NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `postal_code` VARCHAR(20) NULL,
  `bank_name` VARCHAR(100) NULL,
  `account_number` VARCHAR(100) NULL,
  `ifsc_swift` VARCHAR(50) NULL,
  `status` ENUM('draft', 'submitted', 'under_verification', 'approved', 'rejected', 'suspended') NOT NULL DEFAULT 'draft',
  `approval_notes` TEXT NULL,
  `approved_by` INT UNSIGNED NULL,
  `approved_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_supplier_profiles_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `destinations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `parent_id` INT UNSIGNED NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `destinations`(`id`) ON DELETE SET NULL,
  INDEX `idx_destinations_slug` (`slug`),
  INDEX `idx_destinations_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `icon_name` VARCHAR(50) NULL,
  `image_url` VARCHAR(255) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_categories_slug` (`slug`),
  INDEX `idx_categories_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cancellation_policies` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `free_cancellation_hours` INT UNSIGNED NOT NULL DEFAULT 24,
  `refund_percent` DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
  `policy_text` TEXT NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_packages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `activity_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `duration_mins` INT UNSIGNED NOT NULL DEFAULT 60,
  `cancellation_policy_id` INT UNSIGNED NULL,
  `inclusions` JSON NULL,
  `exclusions` JSON NULL,
  `min_pax` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `max_pax` SMALLINT UNSIGNED NOT NULL DEFAULT 50,
  `confirmation_mode` ENUM('instant', 'on_request') NOT NULL DEFAULT 'instant',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `display_order` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`cancellation_policy_id`) REFERENCES `cancellation_policies`(`id`) ON DELETE SET NULL,
  INDEX `idx_packages_activity` (`activity_id`),
  INDEX `idx_packages_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `package_pricing` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `package_id` INT UNSIGNED NOT NULL,
  `adult_base_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `adult_sell_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `child_base_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `child_sell_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `infant_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `valid_from` DATE NULL,
  `valid_to` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`package_id`) REFERENCES `activity_packages`(`id`) ON DELETE CASCADE,
  INDEX `idx_package_pricing` (`package_id`, `valid_from`, `valid_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `availability_dates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `package_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `is_blackout` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_closed` BOOLEAN NOT NULL DEFAULT FALSE,
  `custom_cutoff_hours` SMALLINT UNSIGNED NULL,
  `notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`package_id`) REFERENCES `activity_packages`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_pkg_date` (`package_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `time_slots` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `package_id` INT UNSIGNED NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `capacity` INT UNSIGNED NOT NULL DEFAULT 20,
  `cutoff_hours` SMALLINT UNSIGNED NOT NULL DEFAULT 2,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`package_id`) REFERENCES `activity_packages`(`id`) ON DELETE CASCADE,
  INDEX `idx_time_slots_pkg` (`package_id`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `slot_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `total_capacity` INT UNSIGNED NOT NULL DEFAULT 20,
  `booked_capacity` INT UNSIGNED NOT NULL DEFAULT 0,
  `held_capacity` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('available', 'sold_out', 'blocked') NOT NULL DEFAULT 'available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`slot_id`) REFERENCES `time_slots`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_inventory_slot_date` (`slot_id`, `date`),
  INDEX `idx_inventory_lookup` (`slot_id`, `date`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `travellers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT UNSIGNED NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `traveller_type` ENUM('adult', 'child', 'infant') NOT NULL DEFAULT 'adult',
  `age` SMALLINT UNSIGNED NULL,
  `gender` ENUM('male', 'female', 'other') NULL,
  `nationality` VARCHAR(100) NULL,
  `id_type` VARCHAR(50) NULL,
  `id_number` VARCHAR(100) NULL,
  `is_lead` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  INDEX `idx_travellers_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `refunds` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT UNSIGNED NOT NULL,
  `payment_id` INT UNSIGNED NULL,
  `refund_amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `gateway_refund_id` VARCHAR(100) NULL,
  `status` ENUM('not_applicable', 'requested', 'processing', 'refunded', 'failed') NOT NULL DEFAULT 'requested',
  `initiated_by` INT UNSIGNED NULL,
  `reason` TEXT NULL,
  `gateway_response` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`initiated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_refunds_booking` (`booking_id`),
  INDEX `idx_refunds_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coupons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `discount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  `discount_value` DECIMAL(10, 2) NOT NULL,
  `min_order_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` DECIMAL(10, 2) NULL,
  `usage_limit` INT UNSIGNED NULL,
  `times_used` INT UNSIGNED NOT NULL DEFAULT 0,
  `per_customer_limit` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  `valid_from` DATETIME NOT NULL,
  `valid_to` DATETIME NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_coupons_code` (`code`),
  INDEX `idx_coupons_active` (`is_active`, `valid_from`, `valid_to`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coupon_redemptions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `coupon_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NOT NULL,
  `booking_id` INT UNSIGNED NOT NULL,
  `discount_applied` DECIMAL(10, 2) NOT NULL,
  `redeemed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  INDEX `idx_coupon_redemptions_user` (`coupon_id`, `customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT UNSIGNED NOT NULL UNIQUE,
  `customer_id` INT UNSIGNED NOT NULL,
  `activity_id` INT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `title` VARCHAR(191) NULL,
  `comment` TEXT NULL,
  `status` ENUM('published', 'hidden', 'flagged') NOT NULL DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  INDEX `idx_reviews_activity` (`activity_id`, `status`),
  INDEX `idx_reviews_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `commissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT UNSIGNED NULL,
  `activity_id` INT UNSIGNED NULL,
  `commission_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  `rate_value` DECIMAL(10, 2) NOT NULL DEFAULT 15.00,
  `effective_from` DATE NOT NULL,
  `effective_to` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON DELETE CASCADE,
  INDEX `idx_commissions_lookup` (`supplier_id`, `activity_id`, `effective_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settlements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT UNSIGNED NOT NULL,
  `period_start` DATE NOT NULL,
  `period_end` DATE NOT NULL,
  `gross_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `total_commission` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `refund_deductions` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `net_payable` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'INR',
  `status` ENUM('pending', 'approved', 'paid') NOT NULL DEFAULT 'pending',
  `payout_ref` VARCHAR(100) NULL,
  `settled_by` INT UNSIGNED NULL,
  `settled_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `supplier_profiles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`settled_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_settlements_supplier` (`supplier_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `actor_id` INT UNSIGNED NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` INT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `old_value` JSON NULL,
  `new_value` JSON NULL,
  `reason` TEXT NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_audit_logs_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_logs_actor` (`actor_id`),
  INDEX `idx_audit_logs_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `event_name` VARCHAR(100) NOT NULL,
  `user_id` INT UNSIGNED NULL,
  `session_id` VARCHAR(100) NULL,
  `event_data` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_analytics_event` (`event_name`),
  INDEX `idx_analytics_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
