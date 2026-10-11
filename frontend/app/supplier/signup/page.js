'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import {
  Compass,
  CheckCircle2,
  Upload,
  FileText,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  Anchor,
  Zap,
  Crown,
  Landmark,
  MapPin,
  Trees,
  FileCheck,
  HelpCircle,
  X,
  Clock,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Ticket,
  Car,
  Heart,
  Plus
} from 'lucide-react';

export default function SupplierSignupPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // Logo upload ref
  const logoInputRef = useRef(null);

  // Predefined 5 Main Categories with Subcategories (Fallback & Seed)
  const defaultTaxonomy = [
    {
      id: 1,
      slug: 'attractions',
      name: 'Attractions',
      icon: Ticket,
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
      id: 2,
      slug: 'tours-activity',
      name: 'Tours / Activity',
      icon: Compass,
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
      id: 3,
      slug: 'transportation',
      name: 'Transportation',
      icon: Car,
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
      id: 4,
      slug: 'experiences',
      name: 'Experiences',
      icon: Heart,
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
      id: 5,
      slug: 'add-on-services',
      name: 'Add-on Services',
      icon: Layers,
      subcategories: [
        'Lounge Access',
        'SIM Cards & eSIMs',
        'Vouchers',
        'Other'
      ]
    }
  ];

  const [taxonomy, setTaxonomy] = useState(defaultTaxonomy);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);

  // Form State supporting both Account Types
  const [formData, setFormData] = useState({
    // Account Type: 'individual' | 'corporate' (Section 1 & 2.1)
    account_type: 'corporate',

    // Common Contact & Identity Fields
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    country: 'India',
    state: '',
    city: '',
    postal_code: '',

    // Individual Person Specific (Section 2.1 B)
    full_legal_name: '',
    residential_address: '',
    display_name: '', // Optional public business name
    personal_id_type: 'Aadhaar Card',
    personal_id_number: '',
    pan_number: '',

    // Registered Corporate Entity Specific (Section 2.1 C)
    company_name: '',
    brand_name: '',
    business_type: 'Private Limited',
    business_reg_no: '',
    owner_name: '',
    business_address: '',
    tax_id: '', // GSTIN
    website: '',
    logo_name: '',
    logo_url: '',

    // Step 2: Categories & Services (Section 3)
    main_categories: ['tours-activity'], // Array of selected main category slugs
    sub_categories: ['Domestic Tours', 'City Tours & Day Trips'], // Array of selected subcategory names
    custom_subcategories: {}, // { [mainCatSlug]: ['Custom Name 1', 'Custom Name 2'] }
    custom_other_inputs: {}, // temp text input per main category
    services: ['Guided City Tours', 'Day Trips'],
    custom_services: [],
    add_ons: ['Vouchers'],
    other_addon_input: '',
    custom_addons: [],
    description: '',

    // Step 3: Documents
    documents: [],
    other_documents: []
  });

  const [newServiceTag, setNewServiceTag] = useState('');

  // Fetch taxonomy from backend
  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        setLoadingTaxonomy(true);
        const res = await authService.getTaxonomy();
        if (res && res.success && res.data?.categories?.length > 0) {
          const iconMap = {
            attractions: Ticket,
            'tours-activity': Compass,
            transportation: Car,
            experiences: Heart,
            'add-on-services': Layers
          };
          const mapped = res.data.categories.map(c => ({
            ...c,
            icon: iconMap[c.slug] || Compass,
            subcategories: c.subcategories ? c.subcategories.map(s => s.name) : []
          }));
          setTaxonomy(mapped);
        }
      } catch (err) {
        console.warn('Could not load backend taxonomy, using standard defaults:', err);
      } finally {
        setLoadingTaxonomy(false);
      }
    };
    fetchTaxonomy();
  }, []);

  // Update dynamic document checklist whenever account_type changes (Section 4)
  useEffect(() => {
    if (formData.account_type === 'individual') {
      setFormData(prev => ({
        ...prev,
        documents: [
          { id: 'gov_id', key: 'id_proof', label: 'Government-Issued Identity Proof (Aadhaar / Passport / DL)', filename: '', required: true, uploaded: false },
          { id: 'res_address', key: 'address_proof', label: 'Residential Address Proof', filename: '', required: true, uploaded: false },
          { id: 'ind_pan', key: 'pan_card', label: 'Individual PAN Card (Where applicable)', filename: '', required: false, uploaded: false }
        ]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        documents: [
          { id: 'reg_cert', key: 'business_registration', label: 'Business Registration Certificate (COI / Trade License)', filename: '', required: true, uploaded: false },
          { id: 'gst_cert', key: 'gst_certificate', label: 'GST / Tax Registration Proof', filename: '', required: true, uploaded: false },
          { id: 'corp_pan', key: 'pan_card', label: 'Company PAN Card', filename: '', required: true, uploaded: false },
          { id: 'biz_address', key: 'address_proof', label: 'Registered Business Address Proof', filename: '', required: true, uploaded: false },
          { id: 'rep_id', key: 'id_proof', label: 'Authorized Representative Identity Proof', filename: '', required: true, uploaded: false }
        ]
      }));
    }
  }, [formData.account_type]);

  // Demo Autofill Helper
  const handleFillDemoData = () => {
    if (formData.account_type === 'individual') {
      setFormData(prev => ({
        ...prev,
        first_name: 'Amit',
        last_name: 'Sharma',
        full_legal_name: 'Amit Kumar Sharma',
        display_name: 'Amit Himalayan Trails',
        email: 'amit.trails@demo.com',
        phone: '9876543210',
        password: 'Password@123',
        residential_address: 'Flat 402, Pine Wood Apartments, Old Manali',
        city: 'Manali',
        state: 'Himachal Pradesh',
        postal_code: '175131',
        country: 'India',
        pan_number: 'ABEPS1234F',
        main_categories: ['tours-activity', 'experiences'],
        sub_categories: ['Adventure Tours', 'Outdoor Activities', 'Unique & Local Experiences'],
        services: ['Guided Trekking', 'Camping Packages', 'Local Cultural Experiences'],
        description: 'Independent certified mountain guide with 8 years of experience organizing bespoke trekking and local Himalayan excursions.',
        documents: prev.documents.map(d => ({ ...d, filename: `${d.id}_verified.pdf`, uploaded: true }))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        first_name: 'Rahul',
        last_name: 'Mehta',
        company_name: 'Himalayan Adventure Expeditions Pvt Ltd',
        brand_name: 'Himalayan Expeditions',
        owner_name: 'Rahul Mehta',
        email: 'info@himalayanexpeditions.com',
        phone: '9812345678',
        password: 'Password@123',
        business_type: 'Private Limited',
        business_reg_no: 'U63040HP2021PTC019823',
        tax_id: '02AABCH1234F1Z8',
        pan_number: 'AABCH1234F',
        business_address: '102, Mall Road Commercial Complex',
        city: 'Manali',
        state: 'Himachal Pradesh',
        postal_code: '175131',
        country: 'India',
        website: 'https://himalayanexpeditions.com',
        main_categories: ['tours-activity', 'transportation'],
        sub_categories: ['Domestic Tours', 'Adventure Tours', 'Airport Transfers', 'Car Rentals'],
        services: ['Guided City Tours', 'Day Trips and Excursions', 'Airport Pickup and Drop'],
        description: 'Full-service destination management company & tour operator offering curated adventure packages, transport, and luxury glamping across India.',
        documents: prev.documents.map(d => ({ ...d, filename: `${d.id}_verified.pdf`, uploaded: true }))
      }));
    }
    setTermsConfirmed(true);
    addToast(`Sample ${formData.account_type === 'individual' ? 'Individual' : 'Corporate'} details filled!`, 'info');
  };

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('123456');
  const [resendCooldown, setResendCooldown] = useState(60);
  const otpInputsRef = useRef([]);

  // OTP Timer countdown
  useEffect(() => {
    let timer;
    if (otpModalOpen && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpModalOpen, resendCooldown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Toggle Main Category Selection (Multi-select: Section 3.2)
  const handleToggleMainCategory = (slug) => {
    setFormData(prev => {
      const exists = prev.main_categories.includes(slug);
      let updatedMain;
      if (exists) {
        if (prev.main_categories.length === 1) {
          addToast('At least one Main Category must be selected', 'warning');
          return prev;
        }
        updatedMain = prev.main_categories.filter(s => s !== slug);
      } else {
        updatedMain = [...prev.main_categories, slug];
      }
      return { ...prev, main_categories: updatedMain };
    });
  };

  // Toggle Sub-Category Selection (Multi-select: Section 3.2)
  const handleToggleSubCategory = (subName) => {
    setFormData(prev => {
      const exists = prev.sub_categories.includes(subName);
      let updatedSub;
      if (exists) {
        updatedSub = prev.sub_categories.filter(s => s !== subName);
      } else {
        updatedSub = [...prev.sub_categories, subName];
      }
      return { ...prev, sub_categories: updatedSub };
    });
  };

  // Add Custom Subcategory under a Main Category (Section 3.3)
  const handleAddCustomSubcategory = (mainCatSlug) => {
    const text = (formData.custom_other_inputs[mainCatSlug] || '').trim();
    if (!text) return;

    setFormData(prev => {
      const currentList = prev.custom_subcategories[mainCatSlug] || [];
      if (currentList.some(item => item.toLowerCase() === text.toLowerCase())) {
        addToast('This custom sub-category is already added', 'warning');
        return prev;
      }
      return {
        ...prev,
        custom_subcategories: {
          ...prev.custom_subcategories,
          [mainCatSlug]: [...currentList, text]
        },
        custom_other_inputs: {
          ...prev.custom_other_inputs,
          [mainCatSlug]: ''
        }
      };
    });
    addToast(`Added custom sub-category: "${text}" (Pending review)`, 'info');
  };

  const handleRemoveCustomSubcategory = (mainCatSlug, textToRemove) => {
    setFormData(prev => ({
      ...prev,
      custom_subcategories: {
        ...prev.custom_subcategories,
        [mainCatSlug]: (prev.custom_subcategories[mainCatSlug] || []).filter(t => t !== textToRemove)
      }
    }));
  };

  // Tag management for Services
  const handleAddServiceTag = (e) => {
    if (e) e.preventDefault();
    if (!newServiceTag.trim()) return;
    const tag = newServiceTag.trim();
    if (!formData.services.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, tag],
        custom_services: [...prev.custom_services, tag]
      }));
    }
    setNewServiceTag('');
  };

  const handleRemoveServiceTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== tagToRemove),
      custom_services: prev.custom_services.filter(s => s !== tagToRemove)
    }));
  };

  // Toggle Add-on Services (Section 3.1 & 3.4)
  const handleToggleAddon = (addonName) => {
    setFormData(prev => {
      const exists = prev.add_ons.includes(addonName);
      return {
        ...prev,
        add_ons: exists ? prev.add_ons.filter(a => a !== addonName) : [...prev.add_ons, addonName]
      };
    });
  };

  const handleAddCustomAddon = () => {
    if (!formData.other_addon_input.trim()) return;
    const val = formData.other_addon_input.trim();
    setFormData(prev => ({
      ...prev,
      custom_addons: [...prev.custom_addons, val],
      add_ons: [...prev.add_ons, val],
      other_addon_input: ''
    }));
    addToast(`Added custom add-on: "${val}"`, 'info');
  };

  // Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      logo_name: file.name,
      logo_url: previewUrl
    }));
    addToast('Logo uploaded successfully!', 'success');
  };

  // Document File Upload
  const handleDocUpload = async (docId, file) => {
    if (!file) return;
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await fetch('http://localhost:5000/api/v1/auth/upload-document', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (data && data.success && data.data?.document_url) {
        setFormData(prev => ({
          ...prev,
          documents: prev.documents.map(d =>
            d.id === docId ? { ...d, filename: file.name, uploaded: true, url: data.data.document_url, size: data.data.file_size } : d
          )
        }));
        addToast(`${file.name} uploaded successfully!`, 'success');
        return;
      }
    } catch {
      // fallback
    }

    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.id === docId ? { ...d, filename: file.name, uploaded: true, url: `/uploads/documents/${file.name}`, size: file.size } : d
      )
    }));
    addToast(`${file.name} attached successfully!`, 'success');
  };

  // Step Validations
  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.email.trim() || !formData.phone.trim()) {
        addToast('Email address and mobile number are required', 'error');
        return;
      }
      if (formData.account_type === 'individual') {
        if (!formData.first_name.trim() || !formData.residential_address.trim()) {
          addToast('Please enter your full name and residential address', 'error');
          return;
        }
      } else {
        if (!formData.company_name.trim() || !formData.first_name.trim() || !formData.business_address.trim()) {
          addToast('Please enter registered company name, contact person and business address', 'error');
          return;
        }
      }
      if (formData.password && formData.password.length < 6) {
        addToast('Password must be at least 6 characters long', 'error');
        return;
      }
    }

    if (currentStep === 2) {
      if (formData.main_categories.length === 0) {
        addToast('Please select at least one Main Category', 'error');
        return;
      }
      if (formData.sub_categories.length === 0) {
        addToast('Please select at least one Sub-Category', 'error');
        return;
      }
      if (!formData.description.trim() || formData.services.length === 0) {
        addToast('Please provide at least one service and a description of your activities', 'error');
        return;
      }
    }

    if (currentStep === 3) {
      const missingRequired = formData.documents.filter(d => d.required && !d.uploaded);
      if (missingRequired.length > 0) {
        addToast(`Please upload required documents: ${missingRequired.map(d => d.label.split('(')[0]).join(', ')}`, 'error');
        return;
      }
    }

    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Application & Dispatch OTP (Section 2 & 7)
  const handleSubmitApplication = async () => {
    if (!termsConfirmed) {
      addToast('Please confirm and accept the registration terms', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      // Flatten custom subcategories
      const flattenedCustomSubs = [];
      Object.entries(formData.custom_subcategories).forEach(([mainSlug, names]) => {
        const mCat = taxonomy.find(t => t.slug === mainSlug);
        names.forEach(name => {
          flattenedCustomSubs.push({ main_category_id: mCat?.id || 1, name });
        });
      });

      const res = await authService.supplierSignup({
        account_type: formData.account_type,
        company_name: formData.account_type === 'individual' ? (formData.display_name || `${formData.first_name} ${formData.last_name}`) : formData.company_name.trim(),
        legal_name: formData.account_type === 'individual' ? formData.full_legal_name || `${formData.first_name} ${formData.last_name}` : formData.company_name.trim(),
        display_name: formData.display_name.trim() || null,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password || 'Password@123',
        phone: formData.phone.trim().replace(/\s+/g, ''),
        business_type: formData.business_type,
        website: formData.website,
        business_address: formData.business_address,
        residential_address: formData.residential_address,
        trade_license_no: formData.business_reg_no,
        tax_id: formData.tax_id || formData.pan_number,
        pan_number: formData.pan_number,
        city: formData.city,
        country: formData.country,
        main_categories: formData.main_categories,
        sub_categories: formData.sub_categories,
        custom_subcategories: flattenedCustomSubs,
        services: formData.services,
        custom_services: formData.custom_services,
        add_ons: formData.add_ons,
        description: formData.description,
        documents: formData.documents.filter(d => d.uploaded).map(d => ({
          document_type: d.key,
          document_name: d.filename,
          document_url: d.url || `/uploads/documents/${d.filename}`,
          file_size: d.size || 1024
        }))
      });

      if (res && res.success) {
        addToast('Verification code dispatched to your phone and email!', 'success');
        if (res.data?.verification?.otpCode) {
          setDemoOtp(res.data.verification.otpCode);
        }
        setOtpCode(['', '', '', '', '', '']);
        setResendCooldown(60);
        setOtpModalOpen(true);
      } else {
        addToast(res?.message || 'Registration request failed. Please check your data.', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'Failed to submit registration.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Verification
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const fullCode = otpCode.join('').trim();
    if (fullCode.length !== 6) {
      addToast('Please enter the complete 6-digit OTP code', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await authService.supplierVerifyOtp({
        email: formData.email.trim(),
        phone: formData.phone.trim().replace(/\s+/g, ''),
        code: fullCode
      });

      if (res && res.success) {
        addToast('OTP verified! Your supplier application is submitted for Admin verification.', 'success');
        setOtpModalOpen(false);
        setCurrentStep(5);
      } else {
        addToast(res?.message || 'Invalid OTP code. Please try again.', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'OTP verification failed', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await authService.supplierResendOtp({
        email: formData.email.trim(),
        phone: formData.phone.trim().replace(/\s+/g, '')
      });
      if (res && res.success) {
        addToast('New verification code sent!', 'success');
        setResendCooldown(60);
      } else {
        addToast(res?.message || 'Failed to resend code', 'error');
      }
    } catch {
      addToast('Error resending OTP', 'error');
    }
  };

  const handleOtpDigitChange = (index, val) => {
    const digit = val.slice(-1);
    const updated = [...otpCode];
    updated[index] = digit;
    setOtpCode(updated);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const steps = [
    { num: 1, label: 'Account & Identity' },
    { num: 2, label: 'Categories & Services' },
    { num: 3, label: 'Verification Docs' },
    { num: 4, label: 'Application Review' },
    { num: 5, label: 'Status: Pending' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F1F5F9',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1080px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.07)',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'row',
        minHeight: '660px',
        overflow: 'hidden'
      }}>

        {/* SIDEBAR */}
        <aside style={{
          width: '260px',
          backgroundColor: '#FAFAFA',
          borderRight: '1px solid #E2E8F0',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Compass size={20} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.3px' }}>
                TravelHub
              </span>
            </Link>

            {/* Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {steps.map((st) => {
                const isActive = currentStep === st.num;
                const isCompleted = currentStep > st.num;
                return (
                  <div key={st.num} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800',
                      backgroundColor: isCompleted ? '#2563EB' : isActive ? '#2563EB' : '#FFFFFF',
                      color: (isCompleted || isActive) ? '#FFFFFF' : '#64748B',
                      border: (isCompleted || isActive) ? 'none' : '2px solid #CBD5E1',
                      flexShrink: 0
                    }}>
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : st.num}
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: isActive ? '800' : '600',
                      color: isActive ? '#0F172A' : isCompleted ? '#2563EB' : '#64748B'
                    }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#94A3B8', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <span>Need assistance?</span>
            <div style={{ fontWeight: '750', color: '#2563EB', marginTop: '2px' }}>
              supplier-onboarding@travelhub.com
            </div>
          </div>
        </aside>

        {/* MAIN BODY */}
        <main style={{
          flex: 1,
          padding: '36px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}>
          <div>

            {/* ========================================================== */}
            {/* STEP 1: ACCOUNT TYPE & IDENTITY (SECTION 1 & 2)            */}
            {/* ========================================================== */}
            {currentStep === 1 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Supplier Account Registration
                    </h2>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0' }}>
                      Select your legal business structure to begin onboarding
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillDemoData}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: '750',
                      color: '#2563EB',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Fill Demo ({formData.account_type === 'individual' ? 'Individual' : 'Corporate'})</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '680px' }}>
                  {/* Account Type Toggle Cards (Section 1 & 2.1) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                      Select Supplier Account Type <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* Individual Person Card */}
                      <div
                        onClick={() => setFormData(p => ({ ...p, account_type: 'individual' }))}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: formData.account_type === 'individual' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          backgroundColor: formData.account_type === 'individual' ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: formData.account_type === 'individual' ? '#2563EB' : '#F1F5F9',
                          color: formData.account_type === 'individual' ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <User size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: formData.account_type === 'individual' ? '#1E40AF' : '#0F172A' }}>
                            Individual Person
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                            For local guides, independent drivers, sole practitioners, and travel hosts.
                          </div>
                        </div>
                      </div>

                      {/* Registered Corporate Entity Card */}
                      <div
                        onClick={() => setFormData(p => ({ ...p, account_type: 'corporate' }))}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: formData.account_type === 'corporate' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                          backgroundColor: formData.account_type === 'corporate' ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: formData.account_type === 'corporate' ? '#2563EB' : '#F1F5F9',
                          color: formData.account_type === 'corporate' ? '#FFFFFF' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: formData.account_type === 'corporate' ? '#1E40AF' : '#0F172A' }}>
                            Registered Corporate Entity
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                            For registered companies, travel agencies, DMC tour operators & corporations.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Fields - Individual Person (Section 2.1 B) */}
                  {formData.account_type === 'individual' ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            First Name <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Amit"
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Sharma"
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            Full Legal Name <span style={{ color: '#94A3B8' }}>(as per Govt ID)</span>
                          </label>
                          <input
                            type="text"
                            name="full_legal_name"
                            value={formData.full_legal_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Amit Kumar Sharma"
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            Public Business / Display Name <span style={{ color: '#94A3B8' }}>(Optional)</span>
                          </label>
                          <input
                            type="text"
                            name="display_name"
                            value={formData.display_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Amit Himalayan Trails"
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                          Residential Address <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="residential_address"
                          value={formData.residential_address}
                          onChange={handleInputChange}
                          placeholder="e.g. Flat 402, Pine Wood Apartments, Old Manali"
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    /* Dynamic Fields - Corporate Entity (Section 2.1 C) */
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                          Registered Legal Business Name <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleInputChange}
                          placeholder="e.g. Himalayan Adventure Expeditions Pvt Ltd"
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            Public Business / Brand Name
                          </label>
                          <input
                            type="text"
                            name="brand_name"
                            value={formData.brand_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Himalayan Expeditions"
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            Business Registration Type <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <select
                            name="business_type"
                            value={formData.business_type}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', backgroundColor: '#FFFFFF' }}
                          >
                            <option value="Private Limited">Private Limited</option>
                            <option value="LLP">Limited Liability Partnership (LLP)</option>
                            <option value="Partnership">Partnership Firm</option>
                            <option value="Sole Proprietorship">Sole Proprietorship</option>
                            <option value="Public Limited">Public Limited</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            Owner / Authorized Signatory Name <span style={{ color: '#EF4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Rahul Mehta"
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                            Registration / Trade License No.
                          </label>
                          <input
                            type="text"
                            name="business_reg_no"
                            value={formData.business_reg_no}
                            onChange={handleInputChange}
                            placeholder="e.g. U63040HP2021PTC019823"
                            style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                          Registered Business Address <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="business_address"
                          value={formData.business_address}
                          onChange={handleInputChange}
                          placeholder="e.g. 102, Mall Road Commercial Complex, Manali"
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Common Contact Fields (Section 2.1 A) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        Email Address <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. partner@travelhub.com"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        Mobile Number with Country Code <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 10px', border: '1px solid #CBD5E1', borderRadius: '8px', backgroundColor: '#F8FAFC', fontSize: '12.5px', fontWeight: '750', color: '#334155' }}>
                          <span>🇮🇳 +91</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="e.g. 9876543210"
                          style={{ flex: 1, padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* City, State, Country */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        City <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Manali"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        State / Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Himachal Pradesh"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="e.g. India"
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                      Password <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Create a password (min 6 characters)"
                        style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 28px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: '750',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <span>Next: Category & Services</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 2: CATEGORY, SUB-CATEGORY & SERVICES (SECTION 3)      */}
            {/* ========================================================== */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
                  Category & Services Selection
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 20px' }}>
                  Select one or multiple Main Categories, relevant Sub-Categories, and add-on services
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '680px' }}>
                  {/* 1. Main Categories (Multi-Selection: Section 3.1 & 3.2) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                      Main Categories (Select all that apply) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                      {taxonomy.map((cat) => {
                        const isSelected = formData.main_categories.includes(cat.slug);
                        const IconComp = cat.icon || Compass;
                        return (
                          <div
                            key={cat.slug}
                            onClick={() => handleToggleMainCategory(cat.slug)}
                            style={{
                              padding: '12px 6px',
                              borderRadius: '10px',
                              border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                              backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                          >
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                            <IconComp size={20} style={{ color: isSelected ? '#2563EB' : '#64748B' }} />
                            <span style={{ fontSize: '11px', fontWeight: '750', color: isSelected ? '#1E40AF' : '#334155' }}>
                              {cat.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Dynamic Sub-Categories with "Other" for each selected Main Category (Section 3.2 & 3.3) */}
                  {formData.main_categories.map((catSlug) => {
                    const catObj = taxonomy.find(t => t.slug === catSlug);
                    if (!catObj) return null;
                    const subList = catObj.subcategories || [];
                    const customList = formData.custom_subcategories[catSlug] || [];

                    return (
                      <div key={catSlug} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#1E40AF', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Sub-Categories for:</span>
                          <span style={{ color: '#0F172A' }}>{catObj.name}</span>
                        </div>

                        {/* Pills of Predefined Sub-Categories */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {subList.map((subName) => {
                            if (subName.toLowerCase() === 'other') return null; // handled below
                            const isSelected = formData.sub_categories.includes(subName);
                            return (
                              <button
                                key={subName}
                                type="button"
                                onClick={() => handleToggleSubCategory(subName)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '650',
                                  cursor: 'pointer',
                                  border: isSelected ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                                  backgroundColor: isSelected ? '#2563EB' : '#FFFFFF',
                                  color: isSelected ? '#FFFFFF' : '#334155'
                                }}
                              >
                                {isSelected ? '✓ ' + subName : '+ ' + subName}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom "Other" Sub-Category Section (Section 3.3) */}
                        <div style={{ marginTop: '12px', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                            Other Sub-Category (Can't find yours? Enter custom name):
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={formData.custom_other_inputs[catSlug] || ''}
                              onChange={(e) => setFormData(p => ({
                                ...p,
                                custom_other_inputs: { ...p.custom_other_inputs, [catSlug]: e.target.value }
                              }))}
                              placeholder="e.g. Customized Rajasthan Tour Packages"
                              style={{ flex: 1, padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSubcategory(catSlug); }}}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomSubcategory(catSlug)}
                              style={{ padding: '7px 14px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}
                            >
                              + Add Other
                            </button>
                          </div>

                          {/* List of custom subcategories entered */}
                          {customList.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                              {customList.map((cName, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    backgroundColor: '#FEF3C7',
                                    color: '#92400E',
                                    fontSize: '11.5px',
                                    fontWeight: '700'
                                  }}
                                >
                                  <span>{cName} (Custom - Pending Review)</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomSubcategory(catSlug, cName)}
                                    style={{ border: 'none', background: 'none', color: '#92400E', cursor: 'pointer', padding: 0 }}
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 3. Services / Activities Provided (Section 3.4) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                      Services / Activities Provided <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      padding: '8px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      minHeight: '42px',
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center'
                    }}>
                      {formData.services.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            fontSize: '12px',
                            fontWeight: '750'
                          }}
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveServiceTag(tag)}
                            style={{ border: 'none', background: 'none', color: '#2563EB', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="text"
                        value={newServiceTag}
                        onChange={e => setNewServiceTag(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddServiceTag(e); }}
                        placeholder="Add custom service label (e.g. Scuba Diving with Photos)"
                        style={{ flex: 1, padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12.5px' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddServiceTag}
                        style={{ padding: '7px 14px', borderRadius: '6px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: '750', color: '#334155', cursor: 'pointer' }}
                      >
                        + Add Service
                      </button>
                    </div>
                  </div>

                  {/* 4. Add-on Services (Section 3.1 & 3.4) */}
                  <div style={{ padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                      Add-on Services Provided
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {['Lounge Access', 'SIM Cards & eSIMs', 'Vouchers'].map(ao => {
                        const isChecked = formData.add_ons.includes(ao);
                        return (
                          <button
                            key={ao}
                            type="button"
                            onClick={() => handleToggleAddon(ao)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '650',
                              border: isChecked ? '1.5px solid #2563EB' : '1px solid #CBD5E1',
                              backgroundColor: isChecked ? '#2563EB' : '#FFFFFF',
                              color: isChecked ? '#FFFFFF' : '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            {isChecked ? '✓ ' + ao : '+ ' + ao}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input
                        type="text"
                        value={formData.other_addon_input}
                        onChange={e => setFormData(p => ({ ...p, other_addon_input: e.target.value }))}
                        placeholder="Other Add-on Name (e.g. Travel Insurance)"
                        style={{ flex: 1, padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAddon(); }}}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomAddon}
                        style={{ padding: '7px 12px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}
                      >
                        + Add Add-on
                      </button>
                    </div>
                  </div>

                  {/* 5. Description of Services */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                      Description of Services / Activities <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your tour operations, safety credentials, fleet/equipment, and experience."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '13px', lineHeight: 1.5 }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{ padding: '9px 20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: '750', cursor: 'pointer' }}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 28px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: '750',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <span>Next: Documents</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 3: DYNAMIC VERIFICATION DOCUMENTS (SECTION 4)         */}
            {/* ========================================================== */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
                  {formData.account_type === 'individual' ? 'Personal Identity & Address Verification' : 'Company Legal & Tax Documentation'}
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 20px' }}>
                  Please upload clear copies (PDF, JPG, PNG) for admin review
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '680px' }}>
                  {formData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A' }}>
                          {doc.label} {doc.required && <span style={{ color: '#EF4444' }}>*</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: doc.uploaded ? '#2563EB' : '#94A3B8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} />
                          <span>{doc.uploaded ? doc.filename : 'No document selected'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {doc.uploaded ? (
                          <span style={{ padding: '3px 10px', borderRadius: '100px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: '800' }}>
                            Attached
                          </span>
                        ) : (
                          <span style={{ padding: '3px 10px', borderRadius: '100px', backgroundColor: '#F1F5F9', color: doc.required ? '#EF4444' : '#64748B', fontSize: '11px', fontWeight: '700' }}>
                            {doc.required ? 'Required' : 'Optional'}
                          </span>
                        )}

                        <label style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          backgroundColor: doc.uploaded ? '#F8FAFC' : '#2563EB',
                          color: doc.uploaded ? '#475569' : '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '700',
                          border: doc.uploaded ? '1px solid #CBD5E1' : 'none'
                        }}>
                          {doc.uploaded ? <Edit2 size={13} /> : <Upload size={13} />}
                          <span>{doc.uploaded ? 'Change' : 'Upload'}</span>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleDocUpload(doc.id, f);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{ padding: '9px 20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: '750', cursor: 'pointer' }}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 28px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: '750',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <span>Next: Review Application</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 4: REVIEW & APPLICATION SUBMIT (SECTION 3.5 & 5)      */}
            {/* ========================================================== */}
            {currentStep === 4 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    Review Supplier Application
                  </h2>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '100px',
                    backgroundColor: formData.account_type === 'individual' ? '#FEF3C7' : '#EFF6FF',
                    color: formData.account_type === 'individual' ? '#92400E' : '#1E40AF',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    {formData.account_type === 'individual' ? '👤 Individual Person' : '🏢 Corporate Entity'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>
                  {/* Account & Contact Summary */}
                  <div style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                        1. Identity & Contact Information
                      </span>
                      <button type="button" onClick={() => setCurrentStep(1)} style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}>
                        ✎ Edit
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Legal Name / Entity:</span>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>
                          {formData.account_type === 'individual' ? (formData.full_legal_name || `${formData.first_name} ${formData.last_name}`) : formData.company_name}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Contact Person / Signatory:</span>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>
                          {formData.first_name} {formData.last_name}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Email:</span>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>{formData.email}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Mobile:</span>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>+91 {formData.phone}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748B' }}>Address:</span>
                        <div style={{ fontWeight: '700', color: '#0F172A' }}>
                          {formData.account_type === 'individual' ? formData.residential_address : formData.business_address}, {formData.city}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories & Services Summary */}
                  <div style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                        2. Categories & Operational Services
                      </span>
                      <button type="button" onClick={() => setCurrentStep(2)} style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}>
                        ✎ Edit
                      </button>
                    </div>

                    <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <span style={{ color: '#64748B' }}>Main Categories:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {formData.main_categories.map(slug => {
                            const name = taxonomy.find(t => t.slug === slug)?.name || slug;
                            return (
                              <span key={slug} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: '700', fontSize: '11.5px' }}>
                                {name}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span style={{ color: '#64748B' }}>Sub-Categories:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {formData.sub_categories.map(sc => (
                            <span key={sc} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#334155', fontWeight: '650', fontSize: '11.5px' }}>
                              {sc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Custom subcategories */}
                      {Object.values(formData.custom_subcategories).flat().length > 0 && (
                        <div>
                          <span style={{ color: '#92400E' }}>Custom Sub-Categories (Submitted for Moderation):</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                            {Object.values(formData.custom_subcategories).flat().map((csc, idx) => (
                              <span key={idx} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: '700', fontSize: '11.5px' }}>
                                {csc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <span style={{ color: '#64748B' }}>Services Provided:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {formData.services.map(serv => (
                            <span key={serv} style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1', color: '#0F172A', fontWeight: '650', fontSize: '11.5px' }}>
                              {serv}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                        3. Attached Documents ({formData.documents.filter(d => d.uploaded).length}/{formData.documents.length})
                      </span>
                      <button type="button" onClick={() => setCurrentStep(3)} style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}>
                        ✎ Edit
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {formData.documents.filter(d => d.uploaded).map(d => (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#16A34A', fontWeight: '650' }}>
                          <CheckCircle2 size={14} />
                          <span>{d.label.split('(')[0]}: {d.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Declaration & Consent */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsConfirmed}
                      onChange={(e) => setTermsConfirmed(e.target.checked)}
                      style={{ marginTop: '2px', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="terms" style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, cursor: 'pointer' }}>
                      I hereby declare that all supplied personal/business credentials and legal documents are true and accurate. I understand that supplier features will be activated upon Admin compliance verification.
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{ padding: '9px 20px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', color: '#475569', fontSize: '13px', fontWeight: '750', cursor: 'pointer' }}
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 32px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* STEP 5: APPLICATION SUBMITTED - PENDING (SECTION 5 & 6)    */}
            {/* ========================================================== */}
            {currentStep === 5 && (
              <div style={{ textAlign: 'center', padding: '30px 20px', maxWidth: '580px', margin: '0 auto' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <Clock size={36} />
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: '850', color: '#0F172A', margin: '0 0 10px' }}>
                  Application Submitted – Status: Pending Review
                </h2>
                <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 24px' }}>
                  Thank you for registering with TravelHub as an{' '}
                  <strong>{formData.account_type === 'individual' ? 'Individual Person' : 'Registered Corporate Entity'}</strong>.
                  Our compliance team and Admin have received your legal verification documentation.
                </p>

                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'left', marginBottom: '28px', fontSize: '12.5px', color: '#334155' }}>
                  <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>What happens next?</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <li>Admin review of submitted identity and business proofs</li>
                    <li>Digital Master Services Agreement (E-Sign) execution in your dashboard</li>
                    <li>Full supplier features and catalog activity association will activate once approved</li>
                  </ul>
                </div>

                <Link
                  href="/supplier/dashboard"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '800',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <span>Go to Supplier Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================================================================ */}
      {/* OTP MODAL (DISPATCHED ON SUBMISSION)                             */}
      {/* ================================================================ */}
      {otpModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            padding: '32px 28px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ShieldCheck size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
              Verify Phone & Email
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
              Enter the 6-digit verification code sent to <strong>{formData.email}</strong> and <strong>+91 {formData.phone}</strong>.
            </p>

            {/* Test Simulation Helper Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '8px',
              border: '1px solid #FDE68A',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#92400E'
            }}>
              <span>Demo Test Code: <strong>{demoOtp}</strong></span>
              <button
                type="button"
                onClick={() => setOtpCode(demoOtp.split(''))}
                style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#F59E0B', color: '#FFFFFF', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
              >
                Autofill
              </button>
            </div>

            {/* 6-Digit OTP Inputs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '22px' }}>
              {otpCode.map((digit, i) => (
                <input
                  key={i}
                  ref={el => otpInputsRef.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpDigitChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: '44px',
                    height: '50px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#0F172A',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '800',
                border: 'none',
                cursor: otpLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {otpLoading ? 'Verifying OTP...' : 'Verify & Complete Registration'}
            </button>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748B' }}>
              Didn't receive code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                style={{ background: 'none', border: 'none', color: resendCooldown > 0 ? '#94A3B8' : '#2563EB', fontWeight: '750', cursor: resendCooldown > 0 ? 'default' : 'pointer', padding: 0 }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
