-- ===============================================================
-- Activity Booking Platform - Phase 1 Database Migration
-- Implements all 28 Core Entities & 4 Scoped Roles from Specification
-- Target: December 2026 Production-Ready Phase 1
-- ===============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------
-- 1. ROLES (Section 3: Exactly 4 Roles - Customer, Supplier, Site Admin, Accountant / Finance)
-- ---------------------------------------------------------------

INSERT INTO `roles` (`id`, `name`, `slug`, `description`) VALUES
  (1, 'Site Admin', 'site_admin', 'Approvals, users, activities, bookings, coupons, configuration and reports'),
  (2, 'Accountant / Finance', 'accountant', 'Revenue, commission, refunds and settlement reporting/actions as permitted'),
  (4, 'Supplier', 'supplier', 'Company/KYC, activities, packages, pricing, slots, inventory and bookings'),
  (5, 'Customer', 'customer', 'Search, filter, view, book, pay, view trips, cancel eligible bookings, review completed bookings')
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `slug` = VALUES(`slug`),
  `description` = VALUES(`description`);

-- ---------------------------------------------------------------
-- 2. CUSTOMER PROFILES (Entity 5 in Section 7)
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

-- Backfill customer_profiles for existing users with customer role
INSERT IGNORE INTO `customer_profiles` (`user_id`, `first_name`, `last_name`, `phone`, `avatar_url`)
SELECT u.`id`, u.`first_name`, u.`last_name`, u.`phone`, u.`avatar_url`
FROM `users` u
WHERE u.`role_id` = 5;

-- ---------------------------------------------------------------
-- 3. SUPPLIER PROFILES (Entity 6 in Section 7)
-- ---------------------------------------------------------------

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

-- Backfill supplier_profiles from existing suppliers table
INSERT IGNORE INTO `supplier_profiles` (
  `user_id`, `company_name`, `legal_name`, `business_reg_no`, `tax_id`, 
  `contact_person`, `address_line1`, `city`, `country`, `bank_name`, 
  `account_number`, `ifsc_swift`, `status`, `approval_notes`, `approved_by`, `approved_at`, `created_at`
)
SELECT 
  s.`user_id`, s.`company_name`, s.`company_name`, s.`trade_license_no`, s.`tax_id`,
  s.`contact_person`, s.`business_address`, s.`city`, s.`country`, s.`bank_name`,
  s.`bank_account_no`, s.`bank_iban`,
  CASE 
    WHEN s.`status` = 'pending_verification' THEN 'submitted'
    WHEN s.`status` = 'under_review' THEN 'under_verification'
    ELSE s.`status`
  END,
  s.`approval_notes`, s.`approved_by`, s.`approved_at`, s.`created_at`
FROM `suppliers` s;

-- ---------------------------------------------------------------
-- 4. DESTINATIONS & CATEGORIES (Entities 7 & 8)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 5. CANCELLATION POLICIES (Entity 16)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 6. ACTIVITY PACKAGES / OPTIONS (Entity 11)
-- Core Rule: Activity -> Package -> Slot -> Inventory -> Pricing
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 7. PACKAGE PRICING (Entity 12)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 8. AVAILABILITY DATES & TIME SLOTS (Entities 13 & 14)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 9. TRANSACTIONAL INVENTORY (Entity 15)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 10. TRAVELLERS SNAPSHOT (Entity 18 in Section 7)
-- ---------------------------------------------------------------

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

-- Backfill travellers from existing booking_participants if any
INSERT IGNORE INTO `travellers` (`booking_id`, `full_name`, `traveller_type`, `id_type`, `id_number`, `is_lead`)
SELECT bi.`booking_id`, bp.`full_name`, bp.`age_group`, bp.`id_type`, bp.`id_number`, FALSE
FROM `booking_participants` bp
JOIN `booking_items` bi ON bp.`booking_item_id` = bi.`id`;

-- ---------------------------------------------------------------
-- 11. REFUNDS (Entity 20 in Section 7)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 12. COUPONS & REDEMPTIONS (Entity 22 in Section 7)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 13. REVIEWS & RATINGS (Entity 23 in Section 7)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 14. COMMISSIONS & SETTLEMENTS (Entities 24 & 25 in Section 7)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 15. AUDIT LOGS & ANALYTICS EVENTS (Entities 27 & 28 in Section 7)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- 16. SEED DEFAULT REFERENCE DATA
-- ---------------------------------------------------------------

-- Default Cancellation Policies
INSERT INTO `cancellation_policies` (`id`, `name`, `free_cancellation_hours`, `refund_percent`, `policy_text`) VALUES
  (1, 'Flexible - 24 Hours', 24, 100.00, 'Free cancellation up to 24 hours before the experience starts. Full 100% refund.'),
  (2, 'Moderate - 48 Hours', 48, 100.00, 'Free cancellation up to 48 hours before the experience starts. 50% refund between 24-48 hours.'),
  (3, 'Strict - Non Refundable', 0, 0.00, 'This experience is non-refundable and cannot be changed once booked.')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `policy_text` = VALUES(`policy_text`);

-- Default Categories matching Design
INSERT INTO `categories` (`id`, `name`, `slug`, `icon_name`, `display_order`) VALUES
  (1, 'Desert Safari', 'desert-safari', 'Compass', 1),
  (2, 'Water Sports & Cruises', 'water-sports', 'Anchor', 2),
  (3, 'City Tours & Sightseeing', 'city-tours', 'Camera', 3),
  (4, 'Adventure & Theme Parks', 'adventure-theme-parks', 'Zap', 4),
  (5, 'Luxury & VIP Experiences', 'luxury-vip', 'Crown', 5),
  (6, 'Cultural & Heritage', 'cultural-heritage', 'Landmark', 6),
  (7, 'Day Trips & Excursions', 'day-trips', 'MapPin', 7),
  (8, 'Nature & Wildlife', 'nature-wildlife', 'Trees', 8)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `slug` = VALUES(`slug`);

-- Default Destinations matching Design
INSERT INTO `destinations` (`id`, `name`, `slug`, `country`, `display_order`) VALUES
  (1, 'Dubai', 'dubai', 'United Arab Emirates', 1),
  (2, 'Abu Dhabi', 'abu-dhabi', 'United Arab Emirates', 2),
  (3, 'Paris', 'paris', 'France', 3),
  (4, 'Bali', 'bali', 'Indonesia', 4),
  (5, 'Manali', 'manali', 'India', 5),
  (6, 'Tokyo', 'tokyo', 'Japan', 6),
  (7, 'Jaipur', 'jaipur', 'India', 7),
  (8, 'Goa', 'goa', 'India', 8)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `slug` = VALUES(`slug`);

-- Default Coupons
INSERT INTO `coupons` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `usage_limit`, `per_customer_limit`, `valid_from`, `valid_to`, `is_active`) VALUES
  (1, 'WELCOME10', 'Welcome 10% discount on first activity booking', 'percentage', 10.00, 500.00, 1000.00, 5000, 1, '2026-01-01 00:00:00', '2027-12-31 23:59:59', TRUE),
  (2, 'FLAT500', 'Flat INR 500 discount on luxury packages', 'fixed', 500.00, 2500.00, 500.00, 1000, 1, '2026-01-01 00:00:00', '2027-12-31 23:59:59', TRUE)
ON DUPLICATE KEY UPDATE `code` = VALUES(`code`);

SET FOREIGN_KEY_CHECKS = 1;
