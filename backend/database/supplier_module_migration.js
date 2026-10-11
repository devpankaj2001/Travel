const { pool, query } = require('./connection');

const runSupplierModuleMigration = async () => {
  console.log('[Migration] Starting Supplier Module Schema & Taxonomy Migration...');

  try {
    // 1. Alter suppliers table columns safely
    const addColIfNotExists = async (table, colDef) => {
      try {
        await query(`ALTER TABLE ${table} ADD COLUMN ${colDef};`);
        console.log(`[Migration] Added column to ${table}: ${colDef.split(' ')[0]}`);
      } catch (err) {
        if (!err.message.includes('Duplicate column') && !err.message.includes('already exists')) {
          console.warn(`[Migration Notice] ${err.message}`);
        }
      }
    };

    await addColIfNotExists('suppliers', "account_type ENUM('individual', 'corporate') NOT NULL DEFAULT 'corporate'");
    await addColIfNotExists('suppliers', 'display_name VARCHAR(191) NULL');
    await addColIfNotExists('suppliers', 'legal_name VARCHAR(191) NULL');
    await addColIfNotExists('suppliers', 'residential_address TEXT NULL');
    await addColIfNotExists('suppliers', "commission_model ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage'");
    await addColIfNotExists('suppliers', 'commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 15.00');
    await addColIfNotExists('suppliers', "currency VARCHAR(10) NOT NULL DEFAULT 'INR'");

    // Modify company_name and status to match new statuses
    try {
      await query("ALTER TABLE suppliers MODIFY COLUMN company_name VARCHAR(191) NULL;");
      await query(`ALTER TABLE suppliers MODIFY COLUMN status ENUM('pending', 'under_review', 'documents_required', 'approved', 'rejected', 'suspended', 'blocked', 'pending_verification') NOT NULL DEFAULT 'pending';`);
      console.log('[Migration] Updated suppliers company_name and status column definitions.');
    } catch (err) {
      console.warn('[Migration Notice] Could not modify suppliers columns:', err.message);
    }

    // 2. Create main_categories table
    await query(`
      CREATE TABLE IF NOT EXISTS main_categories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        icon_name VARCHAR(50) NULL,
        display_order SMALLINT UNSIGNED DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create sub_categories table
    await query(`
      CREATE TABLE IF NOT EXISTS sub_categories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        main_category_id INT UNSIGNED NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        is_other BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        display_order SMALLINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (main_category_id) REFERENCES main_categories(id) ON DELETE CASCADE,
        INDEX idx_subcat_main (main_category_id),
        INDEX idx_subcat_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create supplier_category_mappings
    await query(`
      CREATE TABLE IF NOT EXISTS supplier_category_mappings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT UNSIGNED NOT NULL,
        main_category_id INT UNSIGNED NOT NULL,
        sub_category_id INT UNSIGNED NULL,
        is_custom BOOLEAN DEFAULT FALSE,
        custom_name VARCHAR(191) NULL,
        status ENUM('pending_review', 'approved', 'rejected') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (main_category_id) REFERENCES main_categories(id) ON DELETE CASCADE,
        FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE CASCADE,
        INDEX idx_scm_supplier (supplier_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create supplier_custom_subcategories
    await query(`
      CREATE TABLE IF NOT EXISTS supplier_custom_subcategories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT UNSIGNED NOT NULL,
        main_category_id INT UNSIGNED NOT NULL,
        name VARCHAR(191) NOT NULL,
        status ENUM('pending_review', 'approved', 'rejected') DEFAULT 'pending_review',
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (main_category_id) REFERENCES main_categories(id) ON DELETE CASCADE,
        INDEX idx_scs_supplier (supplier_id),
        INDEX idx_scs_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create supplier_custom_services
    await query(`
      CREATE TABLE IF NOT EXISTS supplier_custom_services (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT UNSIGNED NOT NULL,
        main_category_id INT UNSIGNED NULL,
        service_name VARCHAR(191) NOT NULL,
        status ENUM('pending_review', 'approved', 'rejected') DEFAULT 'pending_review',
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        INDEX idx_scserv_supplier (supplier_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Create supplier_activities (Catalog Association Many-to-Many)
    await query(`
      CREATE TABLE IF NOT EXISTS supplier_activities (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT UNSIGNED NOT NULL,
        activity_id INT UNSIGNED NOT NULL,
        supplier_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        customer_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        b2b_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        pricing_model ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
        commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
        fixed_commission DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        status ENUM('pending_approval', 'approved', 'rejected') NOT NULL DEFAULT 'pending_approval',
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        rejection_reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        UNIQUE KEY uq_supplier_activity (supplier_id, activity_id),
        INDEX idx_sa_supplier (supplier_id),
        INDEX idx_sa_activity (activity_id),
        INDEX idx_sa_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Create add_on_services
    await query(`
      CREATE TABLE IF NOT EXISTS add_on_services (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        display_order SMALLINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Seed 5 Main Categories & Subcategories
    const mainCatsData = [
      {
        name: 'Attractions',
        slug: 'attractions',
        display_order: 1,
        subcategories: [
          'Attraction Tickets & Passes',
          'Museums',
          'Monuments',
          'Palaces & Forts',
          'Theme Parks',
          'Aquariums',
          'Zoos',
          'Observation Decks',
          'National Parks',
          'Other'
        ]
      },
      {
        name: 'Tours / Activity',
        slug: 'tours-activity',
        display_order: 2,
        subcategories: [
          'Domestic Tours',
          'International Tours',
          'Honeymoon Packages',
          'Family Tour Packages',
          'Adventure Tours',
          'Luxury Tours',
          'Religious & Spiritual Tours',
          'Cultural & Heritage Tours',
          'Beach Holidays',
          'Wildlife & Nature Tours',
          'Road Trips',
          'City Tours & Day Trips',
          'Outdoor Activities',
          'Water Activities',
          'Cruises',
          'Food Tours',
          'Other Tour-Related Categories',
          'Other'
        ]
      },
      {
        name: 'Transportation',
        slug: 'transportation',
        display_order: 3,
        subcategories: [
          'Airport Transfers',
          'Private Transfers',
          'Shared Transfers',
          'Hotel Transfers',
          'City Transfers',
          'Train Passes',
          'Bus Tours',
          'Rail Passes',
          'Ferry Tickets',
          'Car Rentals',
          'Chauffeur Services',
          'Cable Car Tickets',
          'Other'
        ]
      },
      {
        name: 'Experiences',
        slug: 'experiences',
        display_order: 4,
        subcategories: [
          'Food & Drink Experiences',
          'Cultural Experiences',
          'Shows & Entertainment',
          'Classes & Workshops',
          'Wellness & Relaxation',
          'Sports Activities',
          'Shopping Experiences',
          'Romantic Experiences',
          'Unique & Local Experiences',
          'Seasonal Events',
          'Other'
        ]
      },
      {
        name: 'Add-on Services',
        slug: 'add-on-services',
        display_order: 5,
        subcategories: [
          'Lounge Access',
          'SIM Cards & eSIMs',
          'Vouchers',
          'Other'
        ]
      }
    ];

    for (const mc of mainCatsData) {
      await query(
        `INSERT INTO main_categories (name, slug, display_order, is_active)
         VALUES (?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE name = VALUES(name), display_order = VALUES(display_order);`,
        [mc.name, mc.slug, mc.display_order]
      );

      const rows = await query('SELECT id FROM main_categories WHERE slug = ?', [mc.slug]);
      const mainCatId = rows[0].id;

      let subOrder = 1;
      for (const subName of mc.subcategories) {
        const subSlug = subName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const isOther = subName.toLowerCase() === 'other';

        const existingSub = await query(
          'SELECT id FROM sub_categories WHERE main_category_id = ? AND (slug = ? OR name = ?)',
          [mainCatId, subSlug, subName]
        );

        if (existingSub.length === 0) {
          await query(
            `INSERT INTO sub_categories (main_category_id, name, slug, is_other, display_order, is_active)
             VALUES (?, ?, ?, ?, ?, TRUE);`,
            [mainCatId, subName, subSlug, isOther, subOrder]
          );
        }
        subOrder++;
      }
    }

    await addColIfNotExists('suppliers', 'state VARCHAR(100) NULL');
    await addColIfNotExists('suppliers', 'postal_code VARCHAR(20) NULL');
    await addColIfNotExists('suppliers', 'contact_address TEXT NULL');
    await addColIfNotExists('suppliers', 'brand_name VARCHAR(191) NULL');
    await addColIfNotExists('suppliers', 'owner_name VARCHAR(191) NULL');
    await addColIfNotExists('suppliers', 'pan_number VARCHAR(30) NULL');
    await addColIfNotExists('suppliers', 'identity_type VARCHAR(50) NULL');
    await addColIfNotExists('suppliers', 'identity_number VARCHAR(100) NULL');
    await addColIfNotExists('suppliers', 'application_reference VARCHAR(32) NULL');
    await addColIfNotExists('suppliers', 'add_ons JSON NULL');
    await addColIfNotExists('suppliers', 'terms_accepted_at TIMESTAMP NULL DEFAULT NULL');

    try {
      await query('CREATE UNIQUE INDEX uq_suppliers_application_reference ON suppliers (application_reference)');
    } catch (err) {
      if (!String(err.message).includes('Duplicate') && !String(err.message).includes('exists')) {
        console.warn('[Migration Notice] application_reference index:', err.message);
      }
    }

    // Seed Add-on Services table as well. "Other" is a registration input, not a catalogue row.
    const addons = ['Lounge Access', 'SIM Cards & eSIMs', 'Vouchers'];
    for (let i = 0; i < addons.length; i++) {
      const name = addons[i];
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await query(
        `INSERT INTO add_on_services (name, slug, display_order)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name);`,
        [name, slug, i + 1]
      );
    }

    await query(`
      CREATE TABLE IF NOT EXISTS predefined_services (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        main_category_id INT UNSIGNED NOT NULL,
        name VARCHAR(191) NOT NULL,
        slug VARCHAR(191) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        display_order SMALLINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (main_category_id) REFERENCES main_categories(id) ON DELETE CASCADE,
        UNIQUE KEY uq_predefined_service (main_category_id, slug),
        INDEX idx_predefined_service_main (main_category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS supplier_addon_selections (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT UNSIGNED NOT NULL,
        add_on_service_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_supplier_addon (supplier_id, add_on_service_id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        FOREIGN KEY (add_on_service_id) REFERENCES add_on_services(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS supplier_custom_addons (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT UNSIGNED NOT NULL,
        name VARCHAR(191) NOT NULL,
        status ENUM('pending_review', 'approved', 'rejected') DEFAULT 'pending_review',
        admin_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
        INDEX idx_custom_addon_supplier (supplier_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const serviceCatalog = {
      attractions: [
        'Attraction Tickets',
        'Theme Park Tickets',
        'Museum Entry Tickets',
        'Monument and Palace Tickets',
        'Zoo and Aquarium Tickets'
      ],
      'tours-activity': [
        'Guided City Tours',
        'Day Trips and Excursions',
        'Adventure Tours',
        'Guided Trekking',
        'Camping Packages',
        'Wildlife Safari',
        'Honeymoon Packages',
        'Family Tour Packages'
      ],
      transportation: [
        'Airport Pickup and Drop',
        'Private Transfers',
        'Shared Transfers',
        'Hotel Transfers',
        'Car Rentals',
        'Chauffeur Services',
        'Night Transfers',
        'Corporate Transportation'
      ],
      experiences: [
        'Food Tasting Experiences',
        'Cooking Classes',
        'Cultural Shows',
        'Local Workshops',
        'Water Sports',
        'Wellness Experiences',
        'Private Cooking Classes',
        'Local Cultural Experiences'
      ],
      'add-on-services': [
        'Airport Lounge Access',
        'SIM Cards and eSIMs',
        'Travel Vouchers',
        'Attraction Passes'
      ]
    };

    for (const [mainSlug, names] of Object.entries(serviceCatalog)) {
      const mainRows = await query('SELECT id FROM main_categories WHERE slug = ?', [mainSlug]);
      if (!mainRows.length) continue;
      const mainId = mainRows[0].id;
      for (let i = 0; i < names.length; i++) {
        const serviceName = names[i];
        const serviceSlug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await query(
          `INSERT INTO predefined_services (main_category_id, name, slug, display_order, is_active)
           VALUES (?, ?, ?, ?, TRUE)
           ON DUPLICATE KEY UPDATE name = VALUES(name), display_order = VALUES(display_order), is_active = TRUE`,
          [mainId, serviceName, serviceSlug, i + 1]
        );
      }
    }

    console.log('[Migration] Supplier Module Schema & 5 Main Categories + Subcategories migration completed successfully!');
  } catch (error) {
    console.error('[Migration Error]:', error);
    throw error;
  }
};

if (require.main === module) {
  runSupplierModuleMigration()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async () => {
      await pool.end().catch(() => {});
      process.exit(1);
    });
}

module.exports = { runSupplierModuleMigration };
