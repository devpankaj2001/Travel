const { transaction } = require('../../database/connection');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value) => (value == null ? '' : String(value).trim());

const normalizeKey = (value) => clean(value).toLowerCase().replace(/\s+/g, ' ');

const slugify = (value) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const normalizePhone = (phone, countryCode) => {
  const raw = clean(phone).replace(/[\s()-]/g, '');
  if (!raw) return '';
  if (raw.startsWith('+')) return raw;
  const prefix = clean(countryCode) || '+91';
  const code = prefix.startsWith('+') ? prefix : `+${prefix}`;
  return `${code}${raw.replace(/^0+/, '')}`;
};

const uniqueNames = (list) => {
  const seen = new Set();
  const names = [];
  (Array.isArray(list) ? list : []).forEach((item) => {
    const name = clean(item);
    const key = normalizeKey(name);
    if (!name || seen.has(key)) return;
    seen.add(key);
    names.push(name);
  });
  return names;
};

/**
 * Account-type registration rules from the supplier module.
 * Returns field errors and a normalized payload safe to store with the OTP.
 */
const validateSupplierRegistration = (body = {}) => {
  const errors = [];
  const push = (field, message) => {
    if (!errors.some((item) => item.field === field && item.message === message)) {
      errors.push({ field, message });
    }
  };

  const accountType = clean(body.account_type).toLowerCase();
  if (!['individual', 'corporate'].includes(accountType)) {
    push('account_type', 'Select Individual Person or Registered Corporate Entity.');
  }

  const firstName = clean(body.first_name);
  const lastName = clean(body.last_name);
  const email = clean(body.email).toLowerCase();
  const phone = normalizePhone(body.phone, body.country_code);
  const password = body.password == null ? '' : String(body.password);

  if (!firstName) push('first_name', 'First name is required.');
  if (!lastName) push('last_name', 'Last name is required.');
  if (!email || !EMAIL_RE.test(email)) push('email', 'Enter a valid email address.');
  if (!phone || phone.replace(/\D/g, '').length < 8 || phone.replace(/\D/g, '').length > 15) {
    push('phone', 'Enter a valid mobile number with country code.');
  }
  if (password.length < 6) push('password', 'Password must be at least 6 characters.');
  if (body.terms_accepted !== true && body.terms_accepted !== 'true') {
    push('terms_accepted', 'Accept the Terms and Conditions and Privacy Policy to continue.');
  }

  const contactAddress = clean(body.contact_address);
  const country = clean(body.country);
  const state = clean(body.state);
  const city = clean(body.city);
  const postalCode = clean(body.postal_code);
  if (!contactAddress) push('contact_address', 'Contact address is required.');
  if (!country) push('country', 'Country is required.');
  if (!state) push('state', 'State / Province is required.');
  if (!city) push('city', 'City is required.');
  if (!postalCode) push('postal_code', 'Postal code is required.');

  const isIndividual = accountType === 'individual';
  const isIndia = country.toLowerCase() === 'india';
  const displayName = clean(body.display_name);
  const brandName = clean(body.brand_name);
  const residentialAddress = clean(body.residential_address);
  const businessAddress = clean(body.business_address);
  const identityType = clean(body.identity_type);
  const identityNumber = clean(body.identity_number);
  const panNumber = clean(body.pan_number).toUpperCase();
  const ownerName = clean(body.owner_name);
  const businessType = clean(body.business_type);
  const registrationNo = clean(body.trade_license_no || body.business_reg_no);
  const taxId = clean(body.tax_id).toUpperCase();
  let companyName = clean(body.company_name);
  let legalName = clean(body.legal_name) || clean(body.full_legal_name);

  if (isIndividual) {
    if (!legalName) push('full_legal_name', 'Full legal name is required.');
    if (!residentialAddress) push('residential_address', 'Residential address is required.');
    if (!identityType) push('identity_type', 'Select an identity proof type.');
    if (!identityNumber) push('identity_number', 'Identity proof number is required.');
    if (!companyName) companyName = displayName || legalName || `${firstName} ${lastName}`.trim();
  } else if (accountType === 'corporate') {
    if (!companyName) push('company_name', 'Registered legal business name is required.');
    if (!brandName) push('brand_name', 'Public business / brand name is required.');
    if (!businessType) push('business_type', 'Business registration type is required.');
    if (!registrationNo) push('trade_license_no', 'Business registration number is required.');
    if (!ownerName) push('owner_name', 'Owner / authorized representative is required.');
    if (!businessAddress) push('business_address', 'Registered business address is required.');
    if (isIndia && !taxId) push('tax_id', 'GST / tax registration number is required for suppliers in India.');
    legalName = legalName || companyName;
  }

  const selections = Array.isArray(body.category_selections) ? body.category_selections : [];
  if (selections.length === 0) {
    push('main_categories', 'Select at least one main category.');
  }

  const normalizedSelections = selections.map((group) => {
    const customNames = uniqueNames(group.custom_names);
    const subNames = uniqueNames(group.sub_names).filter((name) => normalizeKey(name) !== 'other');
    const subIds = Array.isArray(group.sub_category_ids)
      ? group.sub_category_ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
      : [];
    return {
      main_category_id: group.main_category_id ? Number(group.main_category_id) : null,
      slug: clean(group.slug),
      name: clean(group.name),
      sub_category_ids: subIds,
      sub_names: subNames,
      custom_names: customNames,
      other_selected: Boolean(group.other_selected)
    };
  });

  normalizedSelections.forEach((group) => {
    const label = group.name || group.slug || 'a selected category';
    const hasSub = group.sub_category_ids.length > 0 || group.sub_names.length > 0 || group.custom_names.length > 0;
    if (!hasSub) {
      push(`sub_categories_${group.slug || label}`, `Select at least one sub-category under ${label}.`);
    }
    if (group.other_selected && group.custom_names.length === 0) {
      push(`custom_sub_${group.slug || label}`, `Enter a sub-category name for Other under ${label}.`);
    }
  });

  const services = uniqueNames(body.services).filter((name) => normalizeKey(name) !== 'other');
  const customServices = uniqueNames(body.custom_services);
  if (services.length === 0 && customServices.length === 0) {
    push('services', 'Select at least one service, or add a custom service name.');
  }
  if (body.other_service_selected && customServices.length === 0) {
    push('custom_services', 'Enter a custom service name when Other is selected.');
  }

  const addOns = uniqueNames(body.add_ons).filter((name) => normalizeKey(name) !== 'other');
  const customAddons = uniqueNames(body.custom_addons);
  if ((body.other_addon_selected || (Array.isArray(body.add_ons) && body.add_ons.some((name) => normalizeKey(name) === 'other'))) && customAddons.length === 0) {
    push('custom_addons', 'Enter an add-on name when Other is selected.');
  }

  const description = clean(body.description);
  if (description.length > 1000) {
    push('description', 'Description must be 1000 characters or fewer.');
  }

  const documents = (Array.isArray(body.documents) ? body.documents : [])
    .filter((doc) => doc && clean(doc.document_url) && clean(doc.document_name))
    .map((doc) => ({
      document_type: clean(doc.document_type) || 'other',
      document_name: clean(doc.document_name),
      document_url: clean(doc.document_url),
      file_size: Number(doc.file_size) || null
    }));
  const uploadedTypes = new Set(documents.map((doc) => doc.document_type));

  if (isIndividual) {
    if (!uploadedTypes.has('id_proof')) push('doc_id_proof', 'Upload a government-issued identity proof.');
    if (!uploadedTypes.has('address_proof')) push('doc_address_proof', 'Upload a residential address proof.');
  } else if (accountType === 'corporate') {
    if (!uploadedTypes.has('business_registration')) push('doc_business_registration', 'Upload the business registration certificate.');
    if (!uploadedTypes.has('address_proof')) push('doc_address_proof', 'Upload the registered business address proof.');
    if (!uploadedTypes.has('id_proof')) push('doc_id_proof', 'Upload the authorized representative identity proof.');
    if (isIndia && !uploadedTypes.has('gst_certificate')) push('doc_gst_certificate', 'Upload the GST / tax registration proof.');
    if (isIndia && !uploadedTypes.has('pan_card')) push('doc_pan_card', 'Upload the company PAN card.');
  }

  const customSubcategories = normalizedSelections.flatMap((group) => (
    group.custom_names.map((name) => ({
      main_category_id: group.main_category_id,
      main_slug: group.slug,
      name
    }))
  ));

  return {
    ok: errors.length === 0,
    errors,
    message: errors[0]?.message || 'Please correct the highlighted registration details.',
    data: {
      account_type: isIndividual ? 'individual' : 'corporate',
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      terms_accepted: true,
      contact_address: contactAddress,
      country,
      state,
      city,
      postal_code: postalCode,
      company_name: companyName || null,
      legal_name: legalName || `${firstName} ${lastName}`.trim(),
      display_name: isIndividual ? (displayName || null) : (brandName || null),
      brand_name: brandName || null,
      residential_address: residentialAddress || null,
      business_address: isIndividual ? (residentialAddress || contactAddress) : (businessAddress || null),
      identity_type: isIndividual ? identityType : null,
      identity_number: isIndividual ? identityNumber : null,
      pan_number: panNumber || null,
      owner_name: isIndividual ? (ownerName || `${firstName} ${lastName}`.trim()) : ownerName,
      business_type: isIndividual ? 'Individual' : (businessType || null),
      trade_license_no: isIndividual ? null : (registrationNo || null),
      tax_id: taxId || null,
      website: clean(body.website) || null,
      main_categories: normalizedSelections.map((group) => group.slug || group.name).filter(Boolean),
      main_category_names: normalizedSelections.map((group) => group.name || group.slug).filter(Boolean),
      sub_categories: normalizedSelections.flatMap((group) => group.sub_names.concat(group.custom_names)),
      category_selections: normalizedSelections,
      custom_subcategories: customSubcategories,
      services,
      custom_services: customServices,
      add_ons: addOns,
      custom_addons: customAddons,
      description: description || null,
      documents
    }
  };
};

const tryQuery = async (connection, sql, params = []) => {
  try {
    return await connection.query(sql, params);
  } catch (err) {
    const message = String(err.message || '');
    if (
      message.includes("doesn't exist")
      || message.includes('Unknown table')
      || message.includes('Unknown column')
    ) {
      console.warn('[Supplier Registration]', message);
      return null;
    }
    throw err;
  }
};

const insertDynamic = async (connection, table, data, statusFallback) => {
  let payload = { ...data };
  for (let attempt = 0; attempt < 15; attempt += 1) {
    const columns = Object.keys(payload).filter((key) => payload[key] !== undefined);
    const sql = `INSERT INTO \`${table}\` (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
    try {
      const [result] = await connection.query(sql, columns.map((column) => payload[column]));
      return result;
    } catch (err) {
      const message = String(err.message || '');
      const unknown = message.match(/Unknown column '([^']+)'/i);
      if (unknown && Object.prototype.hasOwnProperty.call(payload, unknown[1])) {
        delete payload[unknown[1]];
        continue;
      }
      if (message.includes('Data truncated') && payload.status && statusFallback && payload.status !== statusFallback) {
        payload = { ...payload, status: statusFallback };
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Could not save ${table}`);
};

/**
 * Create the user and supplier records only after OTP verification.
 * Supplier status stays pending until an admin approves the application.
 */
const persistSupplierApplication = async (payload) => {
  return transaction(async (connection) => {
    const userAccountType = payload.account_type === 'corporate' ? 'organization' : 'individual';
    const userResult = await insertDynamic(connection, 'users', {
      role_id: payload.supplierRoleId,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      password_hash: payload.passwordHash,
      phone: payload.phone,
      account_type: userAccountType,
      customer_segment: 'retail',
      status: 'active',
      email_verified_at: new Date(),
      phone_verified_at: new Date()
    });
    const userId = userResult.insertId;

    const contactPerson = payload.account_type === 'corporate'
      ? payload.owner_name
      : `${payload.first_name} ${payload.last_name}`.trim();

    const supplierResult = await insertDynamic(connection, 'suppliers', {
      user_id: userId,
      account_type: payload.account_type,
      company_name: payload.company_name,
      legal_name: payload.legal_name,
      display_name: payload.display_name,
      brand_name: payload.brand_name,
      trade_license_no: payload.trade_license_no,
      tax_id: payload.tax_id,
      pan_number: payload.pan_number,
      contact_person: contactPerson,
      owner_name: payload.owner_name,
      business_address: payload.business_address,
      residential_address: payload.residential_address,
      contact_address: payload.contact_address,
      city: payload.city,
      state: payload.state,
      postal_code: payload.postal_code,
      country: payload.country,
      business_type: payload.business_type,
      website: payload.website,
      identity_type: payload.identity_type,
      identity_number: payload.identity_number,
      main_category: (payload.main_category_names && payload.main_category_names[0]) || payload.main_categories?.[0] || null,
      sub_category: payload.sub_categories?.[0] || null,
      services: JSON.stringify(payload.services || []),
      add_ons: JSON.stringify({ selected: payload.add_ons || [], custom: payload.custom_addons || [] }),
      description: payload.description,
      terms_accepted_at: new Date(),
      status: 'pending'
    }, 'pending_verification');
    const supplierId = supplierResult.insertId;
    const reference = `SUP-${new Date().getFullYear()}-${String(supplierId).padStart(6, '0')}`;
    await tryQuery(connection, 'UPDATE suppliers SET application_reference = ? WHERE id = ?', [reference, supplierId]);

    const selections = Array.isArray(payload.category_selections) ? payload.category_selections : [];
    for (const group of selections) {
      let main = null;
      if (group.main_category_id) {
        const found = await tryQuery(connection, 'SELECT id, name, slug FROM main_categories WHERE id = ? LIMIT 1', [group.main_category_id]);
        main = found?.[0]?.[0] || null;
      }
      if (!main && (group.slug || group.name)) {
        const found = await tryQuery(
          connection,
          'SELECT id, name, slug FROM main_categories WHERE slug = ? OR name = ? LIMIT 1',
          [group.slug || '', group.name || group.slug || '']
        );
        main = found?.[0]?.[0] || null;
      }
      if (!main) continue;

      const linkedSubIds = new Set();
      for (const subId of group.sub_category_ids || []) {
        const found = await tryQuery(
          connection,
          'SELECT id, is_other FROM sub_categories WHERE id = ? AND main_category_id = ? LIMIT 1',
          [subId, main.id]
        );
        const row = found?.[0]?.[0];
        if (row && !row.is_other) linkedSubIds.add(row.id);
      }
      for (const subName of group.sub_names || []) {
        const found = await tryQuery(
          connection,
          'SELECT id, is_other FROM sub_categories WHERE main_category_id = ? AND (name = ? OR slug = ?) LIMIT 1',
          [main.id, subName, slugify(subName)]
        );
        const row = found?.[0]?.[0];
        if (row && !row.is_other) linkedSubIds.add(row.id);
      }
      for (const subId of linkedSubIds) {
        await tryQuery(
          connection,
          `INSERT INTO supplier_category_mappings (supplier_id, main_category_id, sub_category_id, is_custom, status)
           VALUES (?, ?, ?, FALSE, 'approved')`,
          [supplierId, main.id, subId]
        );
      }
      for (const customName of group.custom_names || []) {
        await tryQuery(
          connection,
          `INSERT INTO supplier_custom_subcategories (supplier_id, main_category_id, name, status)
           VALUES (?, ?, ?, 'pending_review')`,
          [supplierId, main.id, customName]
        );
        await tryQuery(
          connection,
          `INSERT INTO supplier_category_mappings (supplier_id, main_category_id, sub_category_id, is_custom, custom_name, status)
           VALUES (?, ?, NULL, TRUE, ?, 'pending_review')`,
          [supplierId, main.id, customName]
        );
      }
    }

    for (const serviceName of payload.custom_services || []) {
      await tryQuery(
        connection,
        `INSERT INTO supplier_custom_services (supplier_id, service_name, status)
         VALUES (?, ?, 'pending_review')`,
        [supplierId, serviceName]
      );
    }

    for (const addonName of payload.add_ons || []) {
      const found = await tryQuery(
        connection,
        'SELECT id FROM add_on_services WHERE name = ? OR slug = ? LIMIT 1',
        [addonName, slugify(addonName)]
      );
      const addon = found?.[0]?.[0];
      if (!addon) continue;
      await tryQuery(
        connection,
        `INSERT INTO supplier_addon_selections (supplier_id, add_on_service_id) VALUES (?, ?)`,
        [supplierId, addon.id]
      );
    }

    for (const addonName of payload.custom_addons || []) {
      await tryQuery(
        connection,
        `INSERT INTO supplier_custom_addons (supplier_id, name, status) VALUES (?, ?, 'pending_review')`,
        [supplierId, addonName]
      );
    }

    for (const doc of payload.documents || []) {
      await insertDynamic(connection, 'supplier_documents', {
        supplier_id: supplierId,
        document_type: doc.document_type || 'other',
        document_name: doc.document_name,
        document_url: doc.document_url,
        file_size: doc.file_size,
        status: 'pending'
      });
    }

    await tryQuery(
      connection,
      `INSERT INTO supplier_profiles (user_id, company_name, legal_name, business_reg_no, tax_id, contact_person, contact_email, contact_phone, address_line1, city, state, country, postal_code, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')`,
      [
        userId,
        payload.company_name,
        payload.legal_name,
        payload.trade_license_no,
        payload.tax_id,
        contactPerson,
        payload.email,
        payload.phone,
        payload.contact_address || payload.business_address,
        payload.city,
        payload.state,
        payload.country,
        payload.postal_code
      ]
    );

    await tryQuery(
      connection,
      `INSERT INTO supplier_verifications (supplier_id, verification_type, status, verified_at)
       VALUES (?, 'otp', 'verified', NOW())`,
      [supplierId]
    );

    return {
      userId,
      supplierId,
      reference,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      email: payload.email,
      phone: payload.phone,
      firstName: payload.first_name,
      lastName: payload.last_name,
      accountType: payload.account_type,
      supplierName: payload.account_type === 'corporate'
        ? (payload.brand_name || payload.company_name)
        : (payload.display_name || `${payload.first_name} ${payload.last_name}`.trim()),
      companyName: payload.company_name,
      mainCategoryNames: payload.main_category_names || payload.main_categories || [],
      subCategories: payload.sub_categories || [],
      documents: payload.documents || []
    };
  });
};

module.exports = {
  validateSupplierRegistration,
  persistSupplierApplication
};
