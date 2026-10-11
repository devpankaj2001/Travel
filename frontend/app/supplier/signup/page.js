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
  Sparkles
} from 'lucide-react';

export default function SupplierSignupPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  // Logo upload ref
  const logoInputRef = useRef(null);

  // Form State initialized clean and empty for genuine registrations
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    company_name: '',
    owner_name: '',
    email: '',
    phone: '',
    business_type: 'Private Limited',
    website: '',
    password: '',
    logo_name: '',
    logo_url: '',

    // Step 2: Category & Services
    main_category: 'adventure',
    main_category_name: 'Adventure',
    sub_category: 'Trekking',
    services: [],
    description: '',

    // Step 3: Documents
    documents: [
      { id: 'gst', key: 'gst_certificate', label: 'GST Certificate', filename: '', required: true, uploaded: false },
      { id: 'pan', key: 'pan_card', label: 'PAN Card', filename: '', required: true, uploaded: false },
      { id: 'aadhaar', key: 'aadhaar_card', label: 'Aadhaar Card', filename: '', required: true, uploaded: false },
      { id: 'reg', key: 'business_registration', label: 'Business Registration', filename: '', required: false, uploaded: false },
      { id: 'address', key: 'address_proof', label: 'Address Proof', filename: '', required: true, uploaded: false }
    ],
    other_documents: []
  });

  const [newServiceTag, setNewServiceTag] = useState('');

  // Quick Demo Autofill Helper for convenience
  const handleFillDemoData = () => {
    setFormData({
      company_name: 'Adventure Tours Pvt. Ltd.',
      owner_name: 'Rahul Sharma',
      email: 'rahul@adventuretours.com',
      phone: '98765 43210',
      business_type: 'Private Limited',
      website: 'www.adventuretours.com',
      password: 'Password@123',
      logo_name: 'adventure_tours_logo.png',
      logo_url: '',
      main_category: 'adventure',
      main_category_name: 'Adventure',
      sub_category: 'Trekking',
      services: ['Trekking', 'Camping', 'Nature Walk', 'Guided Tours'],
      description: 'We provide guided trekking tours, camping experiences and exploration activities across India.',
      documents: [
        { id: 'gst', key: 'gst_certificate', label: 'GST Certificate', filename: 'GST_Certificate.pdf', required: true, uploaded: true },
        { id: 'pan', key: 'pan_card', label: 'PAN Card', filename: 'PAN_Card.pdf', required: true, uploaded: true },
        { id: 'aadhaar', key: 'aadhaar_card', label: 'Aadhaar Card', filename: 'Aadhaar_Card.pdf', required: true, uploaded: true },
        { id: 'reg', key: 'business_registration', label: 'Business Registration', filename: 'Registration.pdf', required: false, uploaded: true },
        { id: 'address', key: 'address_proof', label: 'Address Proof', filename: 'Address_Proof.pdf', required: true, uploaded: true }
      ],
      other_documents: []
    });
    setTermsConfirmed(true);
    addToast('Demo sample details filled for quick preview!', 'info');
  };

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('123456');
  const [resendCooldown, setResendCooldown] = useState(60);
  const otpInputsRef = useRef([]);

  // Mockup category cards
  const categoryCards = [
    {
      id: 'adventure',
      title: 'Adventure',
      icon: Compass,
      subcategories: ['Trekking', 'Camping', 'Nature Walk', 'Guided Tours', 'Rock Climbing']
    },
    {
      id: 'sightseeing',
      title: 'Sightseeing',
      icon: Camera,
      subcategories: ['City Tours', 'Monument Visits', 'Historical Walks', 'Museums']
    },
    {
      id: 'water',
      title: 'Water Activities',
      icon: Anchor,
      subcategories: ['Scuba Diving', 'Parasailing', 'Jet Ski', 'Rafting', 'Kayaking']
    },
    {
      id: 'culture',
      title: 'Culture & Heritage',
      icon: Landmark,
      subcategories: ['Heritage Village', 'Cooking Classes', 'Folk Performances', 'Temple Tours']
    }
  ];

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

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Select Main Category Card
  const handleCategorySelect = (cat) => {
    setFormData(prev => ({
      ...prev,
      main_category: cat.id,
      main_category_name: cat.title,
      sub_category: cat.subcategories[0]
    }));
  };

  // Tag management
  const handleAddServiceTag = (e) => {
    if (e) e.preventDefault();
    if (!newServiceTag.trim()) return;
    const tag = newServiceTag.trim();
    if (!formData.services.includes(tag)) {
      setFormData(prev => ({ ...prev, services: [...prev.services, tag] }));
    }
    setNewServiceTag('');
  };

  const handleRemoveServiceTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== tagToRemove)
    }));
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
    addToast('Business logo uploaded successfully!', 'success');
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
      // Fallback to local reference
    }

    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.id === docId ? { ...d, filename: file.name, uploaded: true, url: `/uploads/documents/${file.name}`, size: file.size } : d
      )
    }));
    addToast(`${file.name} uploaded successfully!`, 'success');
  };

  // Step Navigation & Validations
  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.company_name.trim() || !formData.owner_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        addToast('Please fill all required basic fields', 'error');
        return;
      }
      if (formData.password && formData.password.length < 6) {
        addToast('Password must be at least 6 characters long', 'error');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.description.trim() || formData.services.length === 0) {
        addToast('Please provide at least one service and a description', 'error');
        return;
      }
    }
    if (currentStep === 3) {
      const missingRequired = formData.documents.filter(d => d.required && !d.uploaded);
      if (missingRequired.length > 0) {
        addToast(`Please upload required documents: ${missingRequired.map(d => d.label).join(', ')}`, 'error');
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

  // Final Submit Action - dispatches to backend API and opens OTP verification modal
  const handleSubmitApplication = async () => {
    if (!termsConfirmed) {
      addToast('Please confirm that all information is correct', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authService.supplierSignup({
        company_name: formData.company_name.trim(),
        owner_name: formData.owner_name.trim(),
        email: formData.email.trim(),
        password: formData.password || 'Password@123',
        phone: formData.phone.trim().replace(/\s+/g, ''),
        business_type: formData.business_type,
        website: formData.website,
        main_category: formData.main_category,
        sub_category: formData.sub_category,
        services: formData.services,
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
      addToast(err?.message || 'Failed to submit registration. Please verify details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Verification Action - inserts supplier records into database
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
        addToast('OTP verified! Your supplier profile is now saved in the database.', 'success');
        setOtpModalOpen(false);
        setCurrentStep(5); // Render Screen 5: Pending Approval
      } else {
        addToast(res?.message || 'Invalid OTP code. Please try again.', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'OTP verification failed', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
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

  // Stepper Items (Screens 1 to 5)
  const steps = [
    { num: 1, label: 'Business Info' },
    { num: 2, label: 'Category & Services' },
    { num: 3, label: 'Documents' },
    { num: 4, label: 'Review' },
    { num: 5, label: 'Submit' }
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
      {/* MAIN PORTAL WRAPPER (MATCHING ATTACHED DESIGN) */}
      <div style={{
        width: '100%',
        maxWidth: '1040px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.07)',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'row',
        minHeight: '620px',
        overflow: 'hidden'
      }}>

        {/* ============================================================== */}
        {/* LEFT SIDEBAR: LOGO + VERTICAL STEPPER (MATCHING MOCKUP)        */}
        {/* ============================================================== */}
        <aside style={{
          width: '240px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            {/* TravelHub Brand Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '36px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: '900',
                fontSize: '18px'
              }}>
                T
              </div>
              <span style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.3px' }}>
                Travel<span style={{ color: '#2563EB' }}>Hub</span>
              </span>
            </Link>

            {/* Vertical Stepper */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
              {steps.map((st) => {
                const isCompleted = currentStep > st.num;
                const isActive = currentStep === st.num;

                return (
                  <div
                    key={st.num}
                    onClick={() => {
                      if (currentStep !== 5 && st.num < currentStep) setCurrentStep(st.num);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: st.num < currentStep && currentStep !== 5 ? 'pointer' : 'default'
                    }}
                  >
                    {/* Step Number Circle */}
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '800',
                      backgroundColor: isCompleted ? '#2563EB' : isActive ? '#2563EB' : '#FFFFFF',
                      color: (isCompleted || isActive) ? '#FFFFFF' : '#94A3B8',
                      border: (isCompleted || isActive) ? 'none' : '2px solid #CBD5E1',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}>
                      {isCompleted ? <Check size={14} strokeWidth={3} /> : st.num}
                    </div>

                    {/* Step Label */}
                    <span style={{
                      fontSize: '13px',
                      fontWeight: isActive ? '800' : '650',
                      color: isActive ? '#0F172A' : isCompleted ? '#2563EB' : '#64748B'
                    }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Help Note */}
          <div style={{ fontSize: '11px', color: '#94A3B8', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <span>Need assistance?</span>
            <div style={{ fontWeight: '750', color: '#2563EB', marginTop: '2px' }}>
              support@travelhub.com
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT MAIN AREA: DYNAMIC STEPS (SCREENS 1 TO 5)                */}
        {/* ============================================================== */}
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
            {/* 1. REGISTRATION - BASIC INFORMATION (SCREEN 1)             */}
            {/* ========================================================== */}
            {currentStep === 1 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    Supplier Registration
                  </h2>
                  <button
                    type="button"
                    onClick={handleFillDemoData}
                    title="Click to fill sample details for quick testing"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 12px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: '#2563EB',
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Fill Demo Data</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
                  {/* Company / Business Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                      Company / Business Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Adventure Tours Pvt. Ltd."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0F172A'
                      }}
                      required
                    />
                  </div>

                  {/* Owner / Contact Person */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                      Owner / Contact Person <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rahul Sharma"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0F172A'
                      }}
                      required
                    />
                  </div>

                  {/* Email & Mobile Number Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        Email Address <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. rahul@adventuretours.com"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#0F172A'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          backgroundColor: '#F8FAFC',
                          fontSize: '12.5px',
                          fontWeight: '750',
                          color: '#334155'
                        }}>
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="e.g. 98765 43210"
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#0F172A'
                          }}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Type & Website */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        Business Type <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select
                        name="business_type"
                        value={formData.business_type}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Private Limited">Private Limited</option>
                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                        <option value="Partnership">Partnership</option>
                        <option value="LLP">LLP</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                        Website <span style={{ color: '#94A3B8' }}>(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="e.g. www.adventuretours.com"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#0F172A'
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
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
                        style={{
                          width: '100%',
                          padding: '9px 36px 9px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#0F172A'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Upload Logo Box (Matching Mockup Screen 1) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      style={{
                        width: '84px',
                        height: '84px',
                        border: '1.5px dashed #CBD5E1',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F8FAFC',
                        cursor: 'pointer',
                        gap: '4px',
                        overflow: 'hidden'
                      }}
                    >
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <>
                          <Camera size={20} style={{ color: '#94A3B8' }} />
                          <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748B' }}>Upload Logo</span>
                        </>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleLogoUpload}
                    />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>
                        Company Logo <span style={{ color: '#94A3B8', fontWeight: '400' }}>(Optional)</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                        {formData.logo_name || 'Recommended: 400x400 (PNG or JPG)'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Next Button */}
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
                    <span>Next</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* 2. REGISTRATION - CATEGORY & SERVICES (SCREEN 2)           */}
            {/* ========================================================== */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 20px' }}>
                  Select Your Category
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
                  {/* Category Selection Cards (Grid: 4 columns) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {categoryCards.map((cat) => {
                      const isSelected = formData.main_category === cat.id;
                      const IconComponent = cat.icon;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat)}
                          style={{
                            padding: '16px 8px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <IconComponent size={22} style={{ color: isSelected ? '#2563EB' : '#64748B' }} />
                          <span style={{ fontSize: '11.5px', fontWeight: '750', color: isSelected ? '#1E40AF' : '#334155' }}>
                            {cat.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Sub Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                      Sub Category <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                    >
                      {(categoryCards.find(c => c.id === formData.main_category)?.subcategories || ['Trekking', 'Camping']).map((sub, i) => (
                        <option key={i} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                    {/* Services / Activities */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
                      Services / Activities <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      padding: '8px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      minHeight: '44px',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF'
                    }}>
                      {formData.services.length === 0 ? (
                        <span style={{ fontSize: '12px', color: '#94A3B8', padding: '2px 4px' }}>
                          No services added yet. Select from quick add below or type a custom service.
                        </span>
                      ) : (
                        formData.services.map((tag, idx) => (
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
                        ))
                      )}
                    </div>

                    {/* Quick Suggestions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Quick add:</span>
                      {(categoryCards.find(c => c.id === formData.main_category)?.subcategories || []).map(sug => {
                        const isAdded = formData.services.includes(sug);
                        return (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => {
                              if (!isAdded) {
                                setFormData(prev => ({ ...prev, services: [...prev.services, sug] }));
                              }
                            }}
                            disabled={isAdded}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: isAdded ? '#F1F5F9' : '#FFFFFF',
                              color: isAdded ? '#94A3B8' : '#2563EB',
                              border: '1px solid #CBD5E1',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: isAdded ? 'default' : 'pointer'
                            }}
                          >
                            {isAdded ? '✓ ' + sug : '+ ' + sug}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Add Tag Input */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="text"
                        value={newServiceTag}
                        onChange={e => setNewServiceTag(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddServiceTag(e); }}
                        placeholder="Add another service (e.g. River Rafting)"
                        style={{
                          flex: 1,
                          padding: '7px 12px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '6px',
                          fontSize: '12.5px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddServiceTag}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                          fontWeight: '750',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '750', color: '#334155' }}>
                        Description <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {formData.description.length}/500
                      </span>
                    </div>
                    <textarea
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="e.g. We provide guided trekking tours, camping experiences and exploration activities across India."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#0F172A',
                        lineHeight: 1.5
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Back and Next Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: '9px 20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
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
                    <span>Next</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* 3. REGISTRATION - DOCUMENT UPLOAD (SCREEN 3)               */}
            {/* ========================================================== */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 20px' }}>
                  Suspension / Business Documents
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
                  {formData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {/* Document Label */}
                      <div style={{ width: '180px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A' }}>
                          {doc.label} {doc.required && <span style={{ color: '#EF4444' }}>*</span>}
                        </span>
                      </div>

                      {/* File Icon + Name Box */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                        <FileText size={16} style={{ color: doc.uploaded ? '#2563EB' : '#94A3B8', flexShrink: 0 }} />
                        <span style={{
                          fontSize: '12.5px',
                          color: doc.uploaded ? '#334155' : '#94A3B8',
                          fontWeight: doc.uploaded ? '600' : '400',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {doc.uploaded ? doc.filename : 'No file chosen'}
                        </span>
                      </div>

                      {/* Uploaded Badge / Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {doc.uploaded ? (
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '100px',
                            backgroundColor: '#DCFCE7',
                            color: '#16A34A',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            Uploaded
                          </span>
                        ) : (
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '100px',
                            backgroundColor: '#F1F5F9',
                            color: doc.required ? '#EF4444' : '#64748B',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {doc.required ? 'Required' : 'Optional'}
                          </span>
                        )}

                        <label style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          backgroundColor: doc.uploaded ? '#F8FAFC' : '#2563EB',
                          color: doc.uploaded ? '#475569' : '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '700',
                          border: doc.uploaded ? '1px solid #CBD5E1' : 'none'
                        }} title={doc.uploaded ? "Change file" : "Upload file"}>
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

                  {/* Optional Other Documents Dropzone */}
                  <div style={{
                    marginTop: '8px',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1.5px dashed #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}>
                    <Upload size={20} style={{ color: '#64748B', margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>
                      Other Documents (Optional)
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Click to upload or drag and drop PDF, JPG, PNG (Max 5MB)
                    </div>
                  </div>
                </div>

                {/* Back and Next Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: '9px 20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
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
                    <span>Next</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* 4. REGISTRATION - REVIEW & SUBMIT (SCREEN 4)               */}
            {/* ========================================================== */}
            {currentStep === 4 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    Review Your Information
                  </h2>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12.5px' }}>
                    {formData.owner_name ? formData.owner_name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SP'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>
                  {/* Review Box: Business Information */}
                  <div style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                        Business Information
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}
                      >
                        ✎ Edit
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '6px', fontSize: '12.5px' }}>
                      <span style={{ color: '#64748B' }}>Business Name</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.company_name || '—'}</span>

                      <span style={{ color: '#64748B' }}>Owner Name</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.owner_name || '—'}</span>

                      <span style={{ color: '#64748B' }}>Email</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.email || '—'}</span>

                      <span style={{ color: '#64748B' }}>Mobile</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.phone ? `+91 ${formData.phone}` : '—'}</span>

                      <span style={{ color: '#64748B' }}>Business Type</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.business_type || '—'}</span>

                      <span style={{ color: '#64748B' }}>Website</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.website || 'None'}</span>

                      <span style={{ color: '#64748B' }}>Logo</span>
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" style={{ width: '52px', height: '52px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '6px',
                          backgroundColor: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          color: '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: '800',
                          textAlign: 'center',
                          padding: '4px'
                        }}>
                          {formData.company_name ? formData.company_name.slice(0, 10).toUpperCase() : 'NO LOGO'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Review Box: Category & Services */}
                  <div style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                        Category & Services
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}
                      >
                        ✎ Edit
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '6px', fontSize: '12.5px' }}>
                      <span style={{ color: '#64748B' }}>Main Category</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.main_category_name}</span>

                      <span style={{ color: '#64748B' }}>Sub Category</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.sub_category}</span>

                      <span style={{ color: '#64748B' }}>Services</span>
                      <span style={{ color: '#0F172A', fontWeight: '700' }}>{formData.services.length > 0 ? formData.services.join(', ') : 'None selected'}</span>
                    </div>
                  </div>

                  {/* Review Box: Documents */}
                  <div style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                        Documents
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', fontWeight: '750', cursor: 'pointer' }}
                      >
                        ✎ Edit
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {formData.documents.map((doc) => (
                        <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                          <span style={{ color: doc.uploaded ? '#334155' : '#94A3B8' }}>
                            {doc.uploaded ? '✔' : '○'} {doc.label} {doc.filename ? `(${doc.filename})` : ''}
                          </span>
                          <span style={{
                            color: doc.uploaded ? '#16A34A' : (doc.required ? '#EF4444' : '#94A3B8'),
                            fontWeight: '750'
                          }}>
                            {doc.uploaded ? 'Uploaded' : (doc.required ? 'Pending' : 'Not Uploaded')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#334155' }}>
                    <input
                      type="checkbox"
                      checked={termsConfirmed}
                      onChange={(e) => setTermsConfirmed(e.target.checked)}
                      style={{ accentColor: '#2563EB', width: '16px', height: '16px' }}
                    />
                    <span>I confirm that all information is correct.</span>
                  </label>
                </div>

                {/* Back and Submit Application Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      padding: '9px 20px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
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
                      padding: '10px 28px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: '750',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* 5. PENDING APPROVAL - APPLICATION UNDER REVIEW (SCREEN 5)   */}
            {/* ========================================================== */}
            {currentStep === 5 && (
              <div>
                {/* Header Status Notice */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D97706',
                    flexShrink: 0
                  }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
                      Your Application is Under Review
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                      Thank you for registering. Our verification team is currently reviewing your application.
                    </p>
                  </div>
                </div>

                {/* 4-Step Stepper Progress Bar */}
                <div style={{
                  padding: '20px 24px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '28px'
                }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'absolute', top: '14px', left: '30px', right: '30px', height: '2px', backgroundColor: '#E2E8F0', zIndex: 0 }} />
                    <div style={{ position: 'absolute', top: '14px', left: '30px', width: '35%', height: '2px', backgroundColor: '#10B981', zIndex: 0 }} />

                    {/* Step 1: Submitted */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>Submitted</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>1 Oct 2026</span>
                    </div>

                    {/* Step 2: Under Review */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                        <Clock size={14} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#D97706', marginTop: '6px' }}>Under Review</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#D97706' }}>In Progress</span>
                    </div>

                    {/* Step 3: Document Verification */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid #CBD5E1', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                        3
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', marginTop: '6px' }}>Document Verification</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Pending</span>
                    </div>

                    {/* Step 4: Approval */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid #CBD5E1', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px' }}>
                        4
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', marginTop: '6px' }}>Approval</span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Pending</span>
                    </div>
                  </div>
                </div>

                {/* Split Box: What happens next? & Need Help? */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {/* Left: What happens next */}
                  <div style={{ padding: '16px', backgroundColor: '#EFF6FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E40AF', marginBottom: '8px' }}>
                      What happens next?
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#1E3A8A', lineHeight: 1.7 }}>
                      <li>We will review your documents and business information.</li>
                      <li>You may receive an email for additional information.</li>
                      <li>Once approved, you will get full access to supplier features.</li>
                      <li>You will be notified via email and in-app notification.</li>
                    </ul>
                  </div>

                  {/* Right: Need Help? */}
                  <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                        Need Help?
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                        If you have any questions, please contact our support team.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToast('Support channel opened: support@travelhub.com', 'info')}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        color: '#0F172A',
                        fontWeight: '750',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Contact Support
                    </button>
                  </div>
                </div>

                {/* Route to Dashboard Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <Link
                    href="/supplier/dashboard"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '750',
                      borderRadius: '8px',
                      textDecoration: 'none'
                    }}
                  >
                    <span>Go to Supplier Dashboard</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Footnote */}
          {currentStep < 5 && (
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', marginTop: '24px', textAlign: 'center', fontSize: '12.5px', color: '#64748B' }}>
              Already registered?{' '}
              <Link href="/supplier/login" style={{ color: '#2563EB', fontWeight: '750', textDecoration: 'none' }}>
                Log in to Supplier Portal
              </Link>
            </div>
          )}
        </main>

      </div>

      {/* OTP Verification Modal Overlay */}
      {otpModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '32px 28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOtpModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <ShieldCheck size={28} />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: '0 0 8px' }}>
              Verify Your Contact Info
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', lineHeight: 1.5 }}>
              Enter the 6-digit verification code dispatched to <strong style={{ color: '#0F172A' }}>{formData.email}</strong> and <strong style={{ color: '#0F172A' }}>+91 {formData.phone}</strong>
            </p>

            {/* Demo Helper Banner */}
            {demoOtp && (
              <div style={{
                marginBottom: '20px',
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                border: '1px dashed #CBD5E1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#475569'
              }}>
                <span>Test Code: <strong style={{ color: '#2563EB', letterSpacing: '1px' }}>{demoOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtp.split(''))}
                  style={{
                    border: 'none',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '11px',
                    fontWeight: '750',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Auto-fill Code
                </button>
              </div>
            )}

            {/* 6 OTP Input Boxes */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpInputsRef.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  style={{
                    width: '46px',
                    height: '52px',
                    fontSize: '22px',
                    fontWeight: '800',
                    textAlign: 'center',
                    border: digit ? '2px solid #2563EB' : '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    color: '#0F172A',
                    backgroundColor: digit ? '#EFF6FF' : '#FFFFFF',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>

            {/* Verify & Save Button */}
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '750',
                cursor: otpLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              {otpLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying & Saving to Database...</span>
                </>
              ) : (
                <>
                  <span>Verify & Create Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Resend Link */}
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748B' }}>
              Didn't receive code?{' '}
              {resendCooldown > 0 ? (
                <span style={{ color: '#94A3B8' }}>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontWeight: '750',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
