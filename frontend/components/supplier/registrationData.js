export const COUNTRY_CODES = [
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+1', label: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', label: 'United Kingdom', flag: '🇬🇧' },
  { code: '+971', label: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+65', label: 'Singapore', flag: '🇸🇬' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+977', label: 'Nepal', flag: '🇳🇵' },
  { code: '+94', label: 'Sri Lanka', flag: '🇱🇰' }
];

export const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Singapore',
  'Australia',
  'Nepal',
  'Sri Lanka',
  'Canada',
  'Thailand'
];

export const BUSINESS_TYPES = [
  'Private Limited Company',
  'Public Limited Company',
  'Limited Liability Partnership',
  'Partnership Firm',
  'Sole Proprietorship'
];

export const IDENTITY_TYPES = [
  'Aadhaar Card',
  'Passport',
  'Driving Licence',
  'Voter ID'
];

export const SERVICES_BY_SLUG = {
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

export const DEFAULT_ADD_ONS = ['Lounge Access', 'SIM Cards & eSIMs', 'Vouchers'];

const subcategory = (name, isOther = false) => ({ id: null, name, is_other: isOther || name.toLowerCase() === 'other' });

export const DEFAULT_TAXONOMY = [
  {
    id: null,
    slug: 'attractions',
    name: 'Attractions',
    subcategories: [
      'Attraction Tickets & Passes', 'Museums', 'Monuments', 'Palaces & Forts', 'Theme Parks',
      'Aquariums', 'Zoos', 'Observation Decks', 'National Parks', 'Other'
    ].map((name) => subcategory(name))
  },
  {
    id: null,
    slug: 'tours-activity',
    name: 'Tours / Activity',
    subcategories: [
      'Domestic Tours', 'International Tours', 'Honeymoon Packages', 'Family Tour Packages',
      'Adventure Tours', 'Luxury Tours', 'Religious & Spiritual Tours', 'Cultural & Heritage Tours',
      'Beach Holidays', 'Wildlife & Nature Tours', 'Road Trips', 'City Tours & Day Trips',
      'Outdoor Activities', 'Water Activities', 'Cruises', 'Food Tours',
      'Other Tour-Related Categories', 'Other'
    ].map((name) => subcategory(name))
  },
  {
    id: null,
    slug: 'transportation',
    name: 'Transportation',
    subcategories: [
      'Airport Transfers', 'Private Transfers', 'Shared Transfers', 'Hotel Transfers', 'City Transfers',
      'Train Passes', 'Bus Tours', 'Rail Passes', 'Ferry Tickets', 'Car Rentals',
      'Chauffeur Services', 'Cable Car Tickets', 'Other'
    ].map((name) => subcategory(name))
  },
  {
    id: null,
    slug: 'experiences',
    name: 'Experiences',
    subcategories: [
      'Food & Drink Experiences', 'Cultural Experiences', 'Shows & Entertainment', 'Classes & Workshops',
      'Wellness & Relaxation', 'Sports Activities', 'Shopping Experiences', 'Romantic Experiences',
      'Unique & Local Experiences', 'Seasonal Events', 'Other'
    ].map((name) => subcategory(name))
  },
  {
    id: null,
    slug: 'add-on-services',
    name: 'Add-on Services',
    subcategories: ['Lounge Access', 'SIM Cards & eSIMs', 'Vouchers', 'Other'].map((name) => subcategory(name))
  }
];

export const CATEGORY_THEMES = {
  attractions: ['#0f766e', '#134e4a'],
  'tours-activity': ['#1d4ed8', '#1e3a8a'],
  transportation: ['#c2410c', '#9a3412'],
  experiences: ['#7c3aed', '#5b21b6'],
  'add-on-services': ['#0e7490', '#155e75']
};

export const CATEGORY_IMAGES = {
  attractions: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=900&q=80',
  'tours-activity': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=900&q=80',
  transportation: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80',
  experiences: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  'add-on-services': 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80'
};

export function documentChecklist(accountType, country) {
  const india = (country || '').toLowerCase() === 'india';
  const corporate = accountType === 'corporate';
  return [
    { key: 'id_proof', label: 'Identity Proof', hint: corporate ? 'Passport or government ID of the representative' : 'Passport, driving licence, or government ID', required: true },
    { key: 'address_proof', label: 'Address Proof', hint: corporate ? 'Proof of the registered business address' : 'Utility bill, bank statement, or rental agreement', required: true },
    { key: 'pan_card', label: 'PAN / Tax Identification', hint: india && corporate ? 'Company PAN' : 'PAN card, where you have one', required: Boolean(india && corporate) },
    { key: 'business_registration', label: 'Business Registration Certificate', hint: 'Certificate of incorporation or trade licence', required: corporate },
    { key: 'gst_certificate', label: 'GST / Tax Registration', hint: india && corporate ? 'Required for India' : 'GST certificate, where applicable', required: Boolean(india && corporate) },
    { key: 'other', label: 'Other Supporting Documents', hint: 'Optional', required: false }
  ];
}

export function emptyRegistrationForm() {
  return {
    first_name: '',
    last_name: '',
    email: '',
    country_code: '+91',
    phone: '',
    password: '',
    confirm_password: '',
    terms_accepted: false,
    account_type: '',
    contact_address: '',
    country: '',
    state: '',
    city: '',
    postal_code: '',
    full_legal_name: '',
    residential_address: '',
    display_name: '',
    identity_type: '',
    identity_number: '',
    pan_number: '',
    company_name: '',
    brand_name: '',
    business_type: '',
    trade_license_no: '',
    owner_name: '',
    business_address: '',
    tax_id: '',
    main_categories: [],
    sub_selections: {},
    custom_sub_input: {},
    services: [],
    other_service_selected: false,
    custom_service_input: '',
    custom_services: [],
    add_ons: [],
    other_addon_selected: false,
    custom_addon_input: '',
    custom_addons: [],
    description: '',
    documents: {}
  };
}

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

export function validateRegistrationStep(step, form, taxonomy) {
  const errors = {};
  const set = (field, message) => { errors[field] = message; };
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

  if (step === 0) {
    if (!form.first_name.trim()) set('first_name', 'First name is required.');
    if (!form.last_name.trim()) set('last_name', 'Last name is required.');
    if (!emailOk) set('email', 'Enter a valid email address.');
    if (form.phone.replace(/\D/g, '').length < 8) set('phone', 'Enter a valid mobile number.');
    if (form.password.length < 6) set('password', 'Password must be at least 6 characters.');
    if (form.password !== form.confirm_password) set('confirm_password', 'Password and confirm password must match.');
    if (!form.terms_accepted) set('terms_accepted', 'Accept the Terms and Conditions and Privacy Policy to continue.');
  }

  if (step === 1 && !form.account_type) {
    set('account_type', 'Select Individual Person or Registered Corporate Entity.');
  }

  if (step === 2) {
    if (!form.first_name.trim()) set('first_name', 'First name is required.');
    if (!form.last_name.trim()) set('last_name', 'Last name is required.');
    if (!emailOk) set('email', 'Enter a valid email address.');
    if (form.phone.replace(/\D/g, '').length < 8) set('phone', 'Enter a valid mobile number.');
    if (!form.contact_address.trim()) set('contact_address', 'Contact address is required.');
    if (!form.country) set('country', 'Country is required.');
    if (!form.state.trim()) set('state', 'State / Province is required.');
    if (!form.city.trim()) set('city', 'City is required.');
    if (!form.postal_code.trim()) set('postal_code', 'Postal code is required.');
  }

  if (step === 3) {
    if (form.account_type === 'individual') {
      if (!form.full_legal_name.trim()) set('full_legal_name', 'Full legal name is required.');
      if (!form.residential_address.trim()) set('residential_address', 'Residential address is required.');
      if (!form.identity_type) set('identity_type', 'Select an identity proof type.');
      if (!form.identity_number.trim()) set('identity_number', 'Identity proof number is required.');
      if (!form.documents.id_proof?.url) set('doc_id_proof', 'Upload the identity proof.');
      if (!form.documents.address_proof?.url) set('doc_address_proof', 'Upload the address proof.');
    } else {
      if (!form.company_name.trim()) set('company_name', 'Registered legal business name is required.');
      if (!form.brand_name.trim()) set('brand_name', 'Public business / brand name is required.');
      if (!form.business_type) set('business_type', 'Business registration type is required.');
      if (!form.trade_license_no.trim()) set('trade_license_no', 'Business registration number is required.');
      if (!form.owner_name.trim()) set('owner_name', 'Owner / authorized representative is required.');
      if (!form.business_address.trim()) set('business_address', 'Registered business address is required.');
      if ((form.country || '').toLowerCase() === 'india' && !form.tax_id.trim()) {
        set('tax_id', 'GST / tax registration number is required for suppliers in India.');
      }
      if (!form.documents.business_registration?.url) set('doc_business_registration', 'Upload the business registration certificate.');
    }
  }

  if (step === 4 && form.main_categories.length === 0) {
    set('main_categories', 'Select at least one main category.');
  }

  if (step === 5) {
    form.main_categories.forEach((slug) => {
      const category = taxonomy.find((item) => item.slug === slug);
      const selected = form.sub_selections[slug] || { ids: [], names: [], custom: [], other: false };
      const hasChoice = selected.names.length > 0 || selected.custom.length > 0;
      if (!hasChoice) set(`sub_${slug}`, `Select at least one sub-category under ${category?.name || 'this category'}.`);
      if (selected.other && selected.custom.length === 0) set(`custom_${slug}`, 'Enter a sub-category name when Other is selected.');
    });
  }

  if (step === 6) {
    if (form.services.length === 0 && form.custom_services.length === 0) {
      set('services', 'Select at least one service, or add a custom service name.');
    }
    if (form.other_service_selected && form.custom_services.length === 0) {
      set('custom_services', 'Enter a custom service name when Other is selected.');
    }
    if (form.other_addon_selected && form.custom_addons.length === 0) {
      set('custom_addons', 'Enter an add-on name when Other is selected.');
    }
  }

  if (step === 7 && form.description.length > 1000) {
    set('description', 'Description must be 1000 characters or fewer.');
  }

  if (step === 8) {
    documentChecklist(form.account_type, form.country).forEach((doc) => {
      if (doc.required && !form.documents[doc.key]?.url) set(`doc_${doc.key}`, `${doc.label} is required.`);
    });
  }

  return errors;
}

export function buildRegistrationPayload(form, taxonomy) {
  const categorySelections = form.main_categories.map((slug) => {
    const category = taxonomy.find((item) => item.slug === slug);
    const selected = form.sub_selections[slug] || { ids: [], names: [], custom: [], other: false };
    return {
      main_category_id: category?.id || null,
      slug,
      name: category?.name || slug,
      sub_category_ids: selected.ids || [],
      sub_names: selected.names || [],
      custom_names: selected.custom || [],
      other_selected: Boolean(selected.other)
    };
  });

  const documents = documentChecklist(form.account_type, form.country)
    .filter((doc) => form.documents[doc.key]?.url)
    .map((doc) => ({
      document_type: doc.key,
      document_name: form.documents[doc.key].name,
      document_url: form.documents[doc.key].url,
      file_size: form.documents[doc.key].size || null
    }));

  return {
    account_type: form.account_type,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: `${form.country_code}${form.phone.replace(/\D/g, '').replace(/^0+/, '')}`,
    country_code: form.country_code,
    password: form.password,
    terms_accepted: true,
    contact_address: form.contact_address.trim(),
    country: form.country,
    state: form.state.trim(),
    city: form.city.trim(),
    postal_code: form.postal_code.trim(),
    full_legal_name: form.full_legal_name.trim(),
    legal_name: form.account_type === 'individual' ? form.full_legal_name.trim() : form.company_name.trim(),
    residential_address: form.residential_address.trim(),
    display_name: form.display_name.trim(),
    identity_type: form.identity_type,
    identity_number: form.identity_number.trim(),
    pan_number: form.pan_number.trim(),
    company_name: form.company_name.trim(),
    brand_name: form.brand_name.trim(),
    business_type: form.business_type,
    trade_license_no: form.trade_license_no.trim(),
    owner_name: form.owner_name.trim(),
    business_address: form.business_address.trim(),
    tax_id: form.tax_id.trim(),
    main_categories: form.main_categories,
    category_selections: categorySelections,
    services: form.services,
    custom_services: form.custom_services,
    other_service_selected: form.other_service_selected,
    add_ons: form.add_ons,
    custom_addons: form.custom_addons,
    other_addon_selected: form.other_addon_selected,
    description: form.description.trim(),
    documents
  };
}

export function hasDuplicateName(list, value) {
  const key = normalize(value);
  return list.some((item) => normalize(item) === key);
}
