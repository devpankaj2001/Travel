const bcrypt = require('bcryptjs');
const { query } = require('./connection');
const config = require('../config');

const seedDatabase = async () => {
  console.log('[Seeding] Starting database seeding...');

  try {
    // -------------------------------------------------------------
    // 1. ROLES (4 Roles in Phase 1 Scope)
    // -------------------------------------------------------------
    const roles = [
      { name: 'Site Admin', slug: 'site_admin', description: 'Approvals, users, activities, bookings, coupons, configuration and reports' },
      { name: 'Accountant / Finance', slug: 'accountant', description: 'Revenue, commission, refunds and settlement reporting/actions as permitted' },
      { name: 'Supplier', slug: 'supplier', description: 'Company/KYC, activities, packages, pricing, slots, inventory and bookings' },
      { name: 'Customer', slug: 'customer', description: 'Search, filter, view, book, pay, view trips, cancel eligible bookings, review completed bookings' }
    ];

    for (const r of roles) {
      await query(
        `INSERT INTO roles (name, slug, description) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
        [r.name, r.slug, r.description]
      );
    }
    console.log('[Seeding] Roles seeded.');

    // Fetch roles map
    const roleRows = await query('SELECT id, slug FROM roles');
    const roleMap = {};
    roleRows.forEach(row => { roleMap[row.slug] = row.id; });

    // -------------------------------------------------------------
    // 2. PERMISSIONS
    // -------------------------------------------------------------
    const permissions = [
      // Supplier module
      { name: 'Supplier View', slug: 'supplier.view', module: 'suppliers', description: 'View supplier listings and profiles' },
      { name: 'Supplier Approval', slug: 'supplier.approve', module: 'suppliers', description: 'Approve pending supplier applications' },
      { name: 'Supplier Rejection', slug: 'supplier.reject', module: 'suppliers', description: 'Reject supplier applications' },
      { name: 'Supplier Manage', slug: 'supplier.manage', module: 'suppliers', description: 'Manage own supplier company details and documents' },

      // Activity module
      { name: 'Activity View', slug: 'activity.view', module: 'activities', description: 'View activities and details' },
      { name: 'Activity Approval', slug: 'activity.approve', module: 'activities', description: 'Approve new activity submissions' },
      { name: 'Activity Rejection', slug: 'activity.reject', module: 'activities', description: 'Reject activity submissions' },
      { name: 'Activity Manage', slug: 'activity.manage', module: 'activities', description: 'Create and edit activity listings and slots' },

      // Booking module
      { name: 'Booking View', slug: 'booking.view', module: 'bookings', description: 'View booking records and customer participants' },
      { name: 'Booking Manage', slug: 'booking.manage', module: 'bookings', description: 'Create or modify bookings' },
      { name: 'Booking Cancel', slug: 'booking.cancel', module: 'bookings', description: 'Cancel bookings according to policy' },

      // Payment module
      { name: 'Payment View', slug: 'payment.view', module: 'payments', description: 'View payment transactions and vouchers' },
      { name: 'Payment Refund', slug: 'payment.refund', module: 'payments', description: 'Approve and trigger customer refunds' },

      // Coupons module
      { name: 'Coupons Manage', slug: 'coupon.manage', module: 'coupons', description: 'Create and manage promo codes and discounts' },

      // Reports module
      { name: 'Revenue Report', slug: 'report.revenue', module: 'reports', description: 'Access revenue metrics and sales summaries' },
      { name: 'Financial Audit Report', slug: 'report.financial', module: 'reports', description: 'View reconciliation, tax, and payout reports' },
      { name: 'Activity Performance Report', slug: 'report.activity', module: 'reports', description: 'View inventory fill rates and activity metrics' },

      // User & Role module
      { name: 'User View', slug: 'user.view', module: 'users', description: 'View platform users' },
      { name: 'User Manage', slug: 'user.manage', module: 'users', description: 'Manage users, block, or verify accounts' },
      { name: 'Role View', slug: 'role.view', module: 'roles', description: 'View system roles and permissions' },
      { name: 'Role Assign', slug: 'role.assign', module: 'roles', description: 'Assign roles to staff users' }
    ];

    for (const p of permissions) {
      await query(
        `INSERT INTO permissions (name, slug, module, description) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE name = VALUES(name), module = VALUES(module), description = VALUES(description)`,
        [p.name, p.slug, p.module, p.description]
      );
    }
    console.log('[Seeding] Permissions seeded.');

    // Fetch permissions map
    const permRows = await query('SELECT id, slug FROM permissions');
    const permMap = {};
    permRows.forEach(row => { permMap[row.slug] = row.id; });

    // -------------------------------------------------------------
    // 3. ROLE - PERMISSION MAPPINGS
    // -------------------------------------------------------------
    const rolePermissionAssignments = {
      site_admin: [
        'supplier.view', 'supplier.approve', 'supplier.reject',
        'activity.view', 'activity.approve', 'activity.reject', 'activity.manage',
        'booking.view', 'booking.manage', 'booking.cancel',
        'payment.view', 'coupon.manage',
        'report.revenue', 'report.activity',
        'user.view', 'user.manage',
        'role.view', 'role.assign'
      ],
      accountant: [
        'payment.view', 'payment.refund',
        'report.revenue', 'report.financial',
        'booking.view'
      ],
      supplier: [
        'supplier.manage',
        'activity.view', 'activity.manage',
        'booking.view'
      ],
      customer: [
        'booking.view', 'booking.manage', 'booking.cancel'
      ]
    };

    for (const [roleSlug, permSlugs] of Object.entries(rolePermissionAssignments)) {
      const roleId = roleMap[roleSlug];
      if (!roleId) continue;

      for (const pSlug of permSlugs) {
        const permId = permMap[pSlug];
        if (!permId) continue;

        await query(
          `INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`,
          [roleId, permId]
        );
      }
    }
    console.log('[Seeding] Role-Permissions mapped successfully.');

    // -------------------------------------------------------------
    // 4. PRIMARY SITE ADMIN SEED (Configurable from .env)
    // -------------------------------------------------------------
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    const adminPasswordHash = await bcrypt.hash(config.seed.adminPassword, salt);

    const adminEmail = config.seed.adminEmail;
    const adminRoleId = roleMap['site_admin'];

    const existingAdmin = await query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    if (existingAdmin.length === 0) {
      await query(
        `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, account_type, customer_segment, status, email_verified_at)
         VALUES (?, ?, ?, ?, ?, NULL, 'individual', 'retail', 'active', NOW())`,
        [adminRoleId, config.seed.adminFirstName, config.seed.adminLastName, adminEmail, adminPasswordHash]
      );
      console.log(`[Seeding] Primary Site Admin created: ${adminEmail}`);
    } else {
      console.log(`[Seeding] Primary Site Admin already exists: ${adminEmail}`);
    }

    // -------------------------------------------------------------
    // 5. DEMO DATA SEEDING (Controlled via SEED_DEMO_DATA in .env)
    // -------------------------------------------------------------
    if (config.seed.seedDemoData) {
      console.log('[Seeding] SEED_DEMO_DATA=true: Seeding development demo accounts...');

      const demoPasswordHash = await bcrypt.hash('Password@123', salt);

      const demoUsers = [
        {
          role_slug: 'site_accountant',
          first_name: 'Kavita',
          last_name: 'Accountant',
          email: 'accountant@bookingplatform.com',
          phone: '+919876543211',
          account_type: 'individual',
          customer_segment: 'retail',
          status: 'active'
        },
        {
          role_slug: 'finance',
          first_name: 'Rohit',
          last_name: 'Finance',
          email: 'finance@bookingplatform.com',
          phone: '+919876543212',
          account_type: 'individual',
          customer_segment: 'retail',
          status: 'active'
        },
        {
          role_slug: 'supplier',
          first_name: 'Ramesh',
          last_name: 'Adventures',
          email: 'supplier@demo.com',
          phone: '+919876543213',
          account_type: 'organization',
          customer_segment: 'retail',
          status: 'active'
        },
        {
          role_slug: 'customer',
          first_name: 'Ananya',
          last_name: 'Sharma',
          email: 'customer@demo.com',
          phone: '+919876543214',
          account_type: 'individual',
          customer_segment: 'retail',
          status: 'active'
        }
      ];

      for (const u of demoUsers) {
        const roleId = roleMap[u.role_slug];
        const existing = await query('SELECT id FROM users WHERE email = ?', [u.email]);

        let userId;
        if (existing.length === 0) {
          const result = await query(
            `INSERT INTO users (role_id, first_name, last_name, email, password_hash, phone, account_type, customer_segment, status, email_verified_at, phone_verified_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [roleId, u.first_name, u.last_name, u.email, demoPasswordHash, u.phone, u.account_type, u.customer_segment, u.status]
          );
          userId = result.insertId;
          console.log(`[Seeding] Created demo user: ${u.email} (${u.role_slug})`);
        } else {
          userId = existing[0].id;
        }

        if (u.role_slug === 'supplier') {
          const existingSupplier = await query('SELECT id FROM suppliers WHERE user_id = ?', [userId]);
          if (existingSupplier.length === 0) {
            await query(
              `INSERT INTO suppliers (user_id, company_name, trade_license_no, tax_id, contact_person, business_address, city, country, status, approved_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', NOW())`,
              [
                userId,
                'Himalayan Treks & Adventures Pvt Ltd',
                'TL-2026-98124',
                'GSTIN07AABCH1234F1Z5',
                'Ramesh Kumar',
                '102 Mall Road, Manali',
                'Manali',
                config.business.defaultCountry
              ]
            );
            console.log(`[Seeding] Created demo supplier profile for ${u.email}`);
          }
        }
      }
    } else {
      console.log('[Seeding] SEED_DEMO_DATA=false: Skipped demo users (Production mode).');
    }

    console.log('\n[Seeding Completed Successfully]');
    console.log('Site Admin Email:', adminEmail);
    console.log('--------------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeding Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
