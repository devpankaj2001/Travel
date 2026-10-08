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
  Plus
} from 'lucide-react';

export default function SupplierSignupPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    company_name: '',
    owner_name: '',
    email: '',
    phone: '',
    business_type: 'Private Limited',
    website: '',
    password: '',

    // Step 2: Category & Services
    main_category: '',
    main_category_name: '',
    sub_category: '',
    services: ['Trekking', 'Camping', 'Nature Walk', 'Guided Tours'],
    description: '',

    // Step 3: Documents
    documents: [
      { id: 'gst', key: 'gst_certificate', label: 'GST Certificate', required: true, file: null, name: '', url: '', size: null, uploading: false },
      { id: 'pan', key: 'pan_card', label: 'PAN Card', required: true, file: null, name: '', url: '', size: null, uploading: false },
      { id: 'aadhaar', key: 'aadhaar_card', label: 'Aadhaar Card', required: true, file: null, name: '', url: '', size: null, uploading: false },
      { id: 'reg', key: 'business_registration', label: 'Business Registration (Optional)', required: false, file: null, name: '', url: '', size: null, uploading: false },
      { id: 'address', key: 'address_proof', label: 'Address Proof', required: true, file: null, name: '', url: '', size: null, uploading: false }
    ]
  });

  const [newServiceTag, setNewServiceTag] = useState('');

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const otpInputsRef = useRef([]);

  // Fetch Categories from MySQL DB on Mount
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await authService.getCategories();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
          const first = res.data[0];
          setFormData(prev => ({
            ...prev,
            main_category: first.slug,
            main_category_name: first.name,
            sub_category: first.subcategories?.[0] || 'Trekking'
          }));
        } else {
          // Fallback categories matching the database schema
          const fallback = [
            { id: 4, name: 'Adventure', slug: 'adventure', icon_name: 'Zap', subcategories: ['Trekking', 'Camping', 'Rock Climbing', 'Theme Parks'] },
            { id: 3, name: 'Sightseeing', slug: 'sightseeing', icon_name: 'Camera', subcategories: ['City Tours', 'Guided Walking Tours', 'Monument Visits'] },
            { id: 1, name: 'Adventure Sports', slug: 'adventure-sports', icon_name: 'Compass', subcategories: ['Paragliding', 'Bungee Jumping', 'Quad Biking'] },
            { id: 2, name: 'Water Activities', slug: 'water-activities', icon_name: 'Anchor', subcategories: ['Scuba Diving', 'Rafting', 'Jet Skiing', 'Kayaking'] }
          ];
          setCategories(fallback);
          setFormData(prev => ({
            ...prev,
            main_category: fallback[0].slug,
            main_category_name: fallback[0].name,
            sub_category: fallback[0].subcategories[0]
          }));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

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
      main_category: cat.slug,
      main_category_name: cat.name,
      sub_category: cat.subcategories?.[0] || 'Trekking'
    }));
  };

  // Tag management
  const handleAddServiceTag = (e) => {
    e.preventDefault();
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

  // Document Upload Handler (Supports PDF, DOC, DOCX, JPG, PNG)
  const handleFileUpload = async (docId, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('File size must not exceed 10MB', 'error');
      return;
    }

    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.id === docId ? { ...d, uploading: true } : d
      )
    }));

    try {
      const res = await authService.uploadDocument(file);
      if (res.success && res.data) {
        setFormData(prev => ({
          ...prev,
          documents: prev.documents.map(d =>
            d.id === docId
              ? {
                  ...d,
                  file,
                  name: res.data.file_name || file.name,
                  url: res.data.file_url,
                  size: res.data.file_size || file.size,
                  uploading: false
                }
              : d
          )
        }));
        addToast(`${file.name} uploaded successfully`, 'success');
      } else {
        setFormData(prev => ({
          ...prev,
          documents: prev.documents.map(d =>
            d.id === docId
              ? {
                  ...d,
                  file,
                  name: file.name,
                  url: `/uploads/documents/${file.name}`,
                  size: file.size,
                  uploading: false
                }
              : d
          )
        }));
        addToast(`${file.name} uploaded successfully`, 'success');
      }
    } catch {
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.map(d =>
          d.id === docId
            ? {
                ...d,
                file,
                name: file.name,
                url: `/uploads/documents/${file.name}`,
                size: file.size,
                uploading: false
              }
            : d
        )
      }));
      addToast(`${file.name} uploaded successfully`, 'success');
    }
  };

  const handleRemoveDocument = (docId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.id === docId ? { ...d, file: null, name: '', url: '', size: null, uploading: false } : d
      )
    }));
  };

  // Step Validations
  const validateStep1 = () => {
    if (!formData.company_name.trim()) {
      addToast('Please enter Company / Business Name', 'error');
      return false;
    }
    if (!formData.owner_name.trim()) {
      addToast('Please enter Owner / Contact Person Name', 'error');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      addToast('Please enter a valid Email Address', 'error');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      addToast('Please enter a valid Mobile Number', 'error');
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.main_category) {
      addToast('Please select a main category', 'error');
      return false;
    }
    if (!formData.sub_category) {
      addToast('Please select a sub category', 'error');
      return false;
    }
    if (formData.services.length === 0) {
      addToast('Please provide at least one service or activity', 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const requiredMissing = formData.documents.filter(d => d.required && !d.name);
    if (requiredMissing.length > 0) {
      addToast(`Please upload: ${requiredMissing.map(d => d.label).join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Application (Trigger OTP)
  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      const nameParts = formData.owner_name.trim().split(' ');
      const first_name = nameParts[0] || 'Supplier';
      const last_name = nameParts.slice(1).join(' ') || 'Partner';

      const payload = {
        company_name: formData.company_name.trim(),
        first_name,
        last_name,
        owner_name: formData.owner_name.trim(),
        contact_person: formData.owner_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        business_type: formData.business_type,
        website: formData.website.trim(),
        main_category: formData.main_category,
        sub_category: formData.sub_category,
        services: formData.services,
        description: formData.description.trim(),
        documents: formData.documents
          .filter(d => d.name)
          .map(d => ({
            document_type: d.key,
            document_name: d.name,
            document_url: d.url,
            file_size: d.size
          }))
      };

      const res = await authService.supplierSignup(payload);
      if (res.success) {
        addToast('Verification code dispatched to your email!', 'success');
        if (res.data?.otpCode) {
          setDemoOtp(res.data.otpCode);
        }
        setResendCooldown(60);
        setOtpModalOpen(true);
      } else {
        addToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      addToast(err.message || 'An error occurred during registration', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP Inputs
  const handleOtpDigitChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredCode = otpCode.join('');
    if (enteredCode.length !== 6) {
      addToast('Please enter full 6-digit OTP code', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await authService.supplierVerifyOtp({
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        otp: enteredCode
      });

      if (res.success) {
        addToast('🎉 Account registered successfully! Application is under review.', 'success');
        setOtpModalOpen(false);
        router.push('/supplier/dashboard');
      } else {
        addToast(res.message || 'Invalid verification code', 'error');
      }
    } catch (err) {
      addToast(err.message || 'OTP verification failed', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await authService.supplierResendOtp({
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim()
      });
      if (res.success) {
        addToast('New verification code sent', 'success');
        if (res.data?.otpCode) setDemoOtp(res.data.otpCode);
        setResendCooldown(60);
      } else {
        addToast(res.message || 'Failed to resend code', 'error');
      }
    } catch {
      addToast('Failed to resend OTP', 'error');
    }
  };

  // Helper to render Category Icons dynamically matching theme teal
  const renderCategoryIcon = (iconName) => {
    const style = { color: '#0D9488', width: '24px', height: '24px' };
    switch ((iconName || '').toLowerCase()) {
      case 'compass': return <Compass style={style} />;
      case 'anchor': return <Anchor style={style} />;
      case 'camera': return <Camera style={style} />;
      case 'zap': return <Zap style={style} />;
      case 'crown': return <Crown style={style} />;
      case 'landmark': return <Landmark style={style} />;
      case 'mappin': return <MapPin style={style} />;
      case 'trees': return <Trees style={style} />;
      default: return <Compass style={style} />;
    }
  };

  // Stepper Items
  const steps = [
    { num: 1, label: 'Business Info' },
    { num: 2, label: 'Category' },
    { num: 3, label: 'Documents' },
    { num: 4, label: 'Review' },
    { num: 5, label: 'Submit' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      fontFamily: "'Manrope', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'row'
    }}>

      {/* ============================================================== */}
      {/* LEFT COLUMN: BRANDING BANNER (40% WIDTH)                       */}
      {/* ============================================================== */}
      <div style={{
        flex: '0 0 40%',
        width: '40%',
        backgroundColor: '#1E2548',
        color: '#FFFFFF',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 40px',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(30, 37, 72, 0.2)',
        zIndex: 10
      }}>
        {/* Background Scenic Image with Theme Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.28,
            zIndex: 0
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #111827 0%, rgba(30, 37, 72, 0.88) 55%, rgba(51, 63, 112, 0.82) 100%)',
          zIndex: 1
        }} />

        {/* Top Logo */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              backgroundColor: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.4)'
            }}>
              <Compass size={22} />
            </div>
            <div>
              <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px', color: '#FFFFFF' }}>
                TRAVEL<span style={{ color: '#0D9488' }}>.</span>
              </span>
              <span style={{ display: 'block', fontSize: '9px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#D6F5EE', marginTop: '1px' }}>
                Supplier Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center Pitch */}
        <div style={{ position: 'relative', zIndex: 10, margin: 'auto 0', padding: '32px 0' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#FFFFFF', lineHeight: 1.2, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Become a Supplier
          </h1>
          <p style={{ fontSize: '17px', color: '#D6F5EE', fontWeight: '600', margin: '0 0 32px' }}>
            Grow your business with us
          </p>

          {/* Benefit Checkpoints matching Theme Teal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Reach more customers',
              'List your activities',
              'Secure bookings',
              'Competitive commission'
            ].map((benefit, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(214, 245, 238, 0.18)',
                  border: '1.5px solid #0D9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Check size={14} strokeWidth={3} style={{ color: '#D6F5EE' }} />
                </div>
                <span style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: '700' }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '12px',
          color: '#94A3B8',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>Enterprise Partner Network</span>
          <span style={{ color: '#D6F5EE', fontWeight: '750' }}>Verified 2026</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT COLUMN: MULTI-STEP REGISTRATION FORM (60% WIDTH)        */}
      {/* ============================================================== */}
      <div style={{
        flex: '0 0 60%',
        width: '60%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '44px 56px',
        overflowY: 'auto'
      }}>
        <div style={{ maxWidth: '780px', width: '100%', margin: '0 auto' }}>

          {/* Stepper Header */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Merchant Onboarding
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', margin: '2px 0 0', letterSpacing: '-0.3px' }}>
                  Supplier Registration
                </h2>
              </div>
            </div>

            {/* Stepper Indicator */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
              {/* Connecting line background */}
              <div style={{ position: 'absolute', top: '16px', left: '30px', right: '30px', height: '2px', backgroundColor: '#E2E8F0', zIndex: 0 }} />
              {/* Active progress line */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '30px',
                height: '2px',
                backgroundColor: '#0D9488',
                width: `${((currentStep - 1) / (steps.length - 1)) * 92}%`,
                transition: 'width 0.3s ease',
                zIndex: 0
              }} />

              {steps.map((st) => {
                const isCompleted = currentStep > st.num;
                const isActive = currentStep === st.num;

                return (
                  <div key={st.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '13px',
                      backgroundColor: isCompleted ? '#0D9488' : isActive ? '#333F70' : '#FFFFFF',
                      color: (isCompleted || isActive) ? '#FFFFFF' : '#94A3B8',
                      border: (isCompleted || isActive) ? 'none' : '2px solid #CBD5E1',
                      boxShadow: isActive ? '0 0 0 4px #D6F5EE' : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      {isCompleted ? <Check size={16} strokeWidth={3} /> : st.num}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isActive ? '800' : '650',
                      color: isActive ? '#333F70' : isCompleted ? '#0D9488' : '#94A3B8',
                      marginTop: '8px',
                      whiteSpace: 'nowrap'
                    }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 1: BASIC INFORMATION (Screen 1)                           */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '850', color: '#0F172A', margin: '0 0 4px' }}>
                  Business Information
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Enter your organization details and primary contact information.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Company / Business Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Company / Business Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Adventure Tours Pvt. Ltd."
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {/* Owner / Contact Person Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Owner / Contact Person Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    placeholder="Rahul Sharma"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Email Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="rahul@adventuretours.com"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '11px 14px',
                      backgroundColor: '#F8FAFC',
                      borderRight: '1.5px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: '800',
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
                      placeholder="98765 43210"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        border: 'none',
                        outline: 'none',
                        fontSize: '13.5px',
                        color: '#0F172A'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Business Type & Website */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Business Type <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Private Limited">Private Limited</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                      <option value="Public Limited">Public Limited</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Website <span style={{ color: '#94A3B8', fontWeight: '500' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="www.adventuretours.com"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Account Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Account Password <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter secure password (min 6 chars)"
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 14px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      style={{
                        position: 'absolute',
                        right: '12px',
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
              </div>

              {/* Step 1 Actions */}
              <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 28px',
                    backgroundColor: '#333F70',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: CATEGORY & SERVICES (Screen 2 - Loaded from MySQL Table)*/}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '850', color: '#0F172A', margin: '0 0 4px' }}>
                  Select Your Category
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Categories are loaded dynamically from the central database table.
                </p>
              </div>

              {/* Main Category Cards Grid */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '8px' }}>
                  Main Category <span style={{ color: '#EF4444' }}>*</span>
                </label>

                {loadingCategories ? (
                  <div style={{ padding: '36px', textAlign: 'center', color: '#94A3B8' }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: '#0D9488', margin: '0 auto 8px' }} />
                    <span style={{ fontSize: '13px' }}>Loading categories from database...</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {categories.slice(0, 4).map((cat) => {
                      const isSelected = formData.main_category === cat.slug;
                      return (
                        <button
                          key={cat.id || cat.slug}
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          style={{
                            padding: '16px 12px',
                            borderRadius: '14px',
                            border: isSelected ? '2px solid #0D9488' : '1.5px solid #E2E8F0',
                            backgroundColor: isSelected ? '#D6F5EE' : '#FFFFFF',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 4px 12px rgba(13, 148, 136, 0.15)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ marginBottom: '8px' }}>
                            {renderCategoryIcon(cat.icon_name)}
                          </div>
                          <span style={{
                            fontSize: '12.5px',
                            fontWeight: '800',
                            color: isSelected ? '#047857' : '#0F172A',
                            lineHeight: 1.2
                          }}>
                            {cat.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sub Category Dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                  Sub Category <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  name="sub_category"
                  value={formData.sub_category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    cursor: 'pointer'
                  }}
                >
                  {(() => {
                    const currentCatObj = categories.find(c => c.slug === formData.main_category);
                    const subcats = currentCatObj?.subcategories || ['Trekking', 'Camping', 'Guided Tours', 'Water Sports', 'Day Trips'];
                    return subcats.map((sc, i) => (
                      <option key={i} value={sc}>{sc}</option>
                    ));
                  })()}
                </select>
              </div>

              {/* Services / Activities You Provide */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                  Services / Activities You Provide <span style={{ color: '#EF4444' }}>*</span>
                </label>

                {/* Tag Pills */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  marginBottom: '8px',
                  minHeight: '44px',
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
                        backgroundColor: '#D6F5EE',
                        color: '#0D9488',
                        fontSize: '12px',
                        fontWeight: '750'
                      }}
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveServiceTag(tag)}
                        style={{ border: 'none', background: 'none', color: '#0D9488', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Tag Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newServiceTag}
                    onChange={e => setNewServiceTag(e.target.value)}
                    placeholder="Type a service and click Add (e.g. Scuba Diving)"
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddServiceTag}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#333F70',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Description of Services */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                  Description of Services <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="We provide guided trekking tours, camping experiences and nature exploration activities across India."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Step 2 Actions */}
              <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={handlePrevious}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 22px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#475569',
                    fontWeight: '750',
                    fontSize: '13.5px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 28px',
                    backgroundColor: '#333F70',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)'
                  }}
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: DOCUMENT UPLOAD (Screen 3)                             */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '850', color: '#0F172A', margin: '0 0 4px' }}>
                  Upload Required Documents
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Please upload clear and valid documents for verification.
                </p>
              </div>

              {/* Document rows matching Screenshot 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {formData.documents.map((doc) => {
                  const isUploaded = !!doc.name;
                  return (
                    <div
                      key={doc.id}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: '1.5px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      {/* Left: Document Label */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#D6F5EE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0D9488'
                        }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A' }}>
                            {doc.label} {doc.required && <span style={{ color: '#EF4444' }}>*</span>}
                          </span>
                        </div>
                      </div>

                      {/* Right: Uploaded Badge OR Upload Button */}
                      <div>
                        {isUploaded ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              backgroundColor: '#D6F5EE',
                              border: '1px solid #BBF7D0',
                              fontSize: '12px',
                              fontWeight: '750',
                              color: '#0D9488'
                            }}>
                              <FileCheck size={14} style={{ color: '#0D9488' }} />
                              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {doc.name}
                              </span>
                            </div>

                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#D6F5EE',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0D9488'
                            }}>
                              <Check size={14} strokeWidth={3} />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveDocument(doc.id)}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: '#EF4444',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title="Delete document"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <label style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1.5px dashed #0D9488',
                            backgroundColor: '#F0FDFA',
                            color: '#0D9488',
                            fontSize: '12.5px',
                            fontWeight: '750',
                            cursor: 'pointer'
                          }}>
                            <Upload size={14} />
                            <span>Click to upload</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(doc.id, f);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step 3 Actions */}
              <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={handlePrevious}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 22px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#475569',
                    fontWeight: '750',
                    fontSize: '13.5px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 28px',
                    backgroundColor: '#333F70',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)'
                  }}
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: REVIEW & SUBMIT (Screen 4)                             */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '850', color: '#0F172A', margin: '0 0 4px' }}>
                  Review Your Information
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Please verify your details before submitting.
                </p>
              </div>

              {/* 3 Overview Review Cards matching Screenshot 4 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Card 1: Business Information */}
                <div style={{
                  padding: '20px 24px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Business Information
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 'none',
                        background: 'none',
                        color: '#0D9488',
                        fontSize: '12.5px',
                        fontWeight: '750',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: '10px', fontSize: '13px' }}>
                    <span style={{ color: '#64748B', fontWeight: '650' }}>Business Name</span>
                    <span style={{ color: '#0F172A', fontWeight: '750' }}>{formData.company_name}</span>

                    <span style={{ color: '#64748B', fontWeight: '650' }}>Owner Name</span>
                    <span style={{ color: '#0F172A', fontWeight: '750' }}>{formData.owner_name}</span>

                    <span style={{ color: '#64748B', fontWeight: '650' }}>Email</span>
                    <span style={{ color: '#0F172A', fontWeight: '750' }}>{formData.email}</span>

                    <span style={{ color: '#64748B', fontWeight: '650' }}>Mobile</span>
                    <span style={{ color: '#0F172A', fontWeight: '750' }}>+91 {formData.phone}</span>

                    <span style={{ color: '#64748B', fontWeight: '650' }}>Business Type</span>
                    <span style={{ color: '#0F172A', fontWeight: '750' }}>{formData.business_type}</span>
                  </div>
                </div>

                {/* Card 2: Category & Services */}
                <div style={{
                  padding: '20px 24px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Category & Services
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 'none',
                        background: 'none',
                        color: '#0D9488',
                        fontSize: '12.5px',
                        fontWeight: '750',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: '10px', fontSize: '13px', alignItems: 'center' }}>
                    <span style={{ color: '#64748B', fontWeight: '650' }}>Main Category</span>
                    <span style={{ color: '#0F172A', fontWeight: '750' }}>{formData.main_category_name || formData.main_category}</span>

                    <span style={{ color: '#64748B', fontWeight: '650' }}>Sub Category</span>
                    <span style={{ color: '#0F172A', fontWeight: '750' }}>{formData.sub_category}</span>

                    <span style={{ color: '#64748B', fontWeight: '650' }}>Services</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {formData.services.map((s, idx) => (
                        <span key={idx} style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#D6F5EE',
                          color: '#0D9488',
                          fontSize: '11px',
                          fontWeight: '750'
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card 3: Documents */}
                <div style={{
                  padding: '20px 24px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2E8F0',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Documents
                    </h4>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 'none',
                        background: 'none',
                        color: '#0D9488',
                        fontSize: '12.5px',
                        fontWeight: '750',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {formData.documents.filter(d => d.name).map((doc, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#D6F5EE',
                        border: '1px solid #BBF7D0',
                        fontSize: '12px',
                        fontWeight: '750',
                        color: '#065F46'
                      }}>
                        <FileCheck size={14} style={{ color: '#0D9488' }} />
                        <span>{doc.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Step 4 Actions */}
              <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={handlePrevious}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 22px',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    color: '#475569',
                    fontWeight: '750',
                    fontSize: '13.5px',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 32px',
                    backgroundColor: isSubmitting ? '#94A3B8' : '#0D9488',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
                  }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Application'}
                </button>
              </div>
            </div>
          )}

          {/* Already registered footnote */}
          <div style={{ textAlign: 'center', marginTop: '36px', fontSize: '13px', color: '#64748B' }}>
            Already registered as a partner?{' '}
            <Link href="/supplier/login" style={{ color: '#0D9488', fontWeight: '800', textDecoration: 'none' }}>
              Log in to Supplier Portal
            </Link>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 5: OTP VERIFICATION MODAL                                 */}
      {/* ============================================================== */}
      {otpModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(30, 37, 72, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '460px',
            padding: '32px',
            boxShadow: '0 25px 60px rgba(15, 23, 42, 0.35)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#D6F5EE',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0D9488',
                marginBottom: '12px'
              }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: '0 0 6px' }}>
                Verify Your Account
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                We sent a 6-digit verification code to<br />
                <strong style={{ color: '#0F172A' }}>{formData.email}</strong>
              </p>
            </div>


            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 6 Digit Inputs */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpInputsRef.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpDigitChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e.target)}
                    style={{
                      width: '46px',
                      height: '52px',
                      borderRadius: '10px',
                      border: '2px solid #CBD5E1',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: '800',
                      color: '#0F172A',
                      outline: 'none',
                      backgroundColor: '#F8FAFC'
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.some(d => !d)}
                style={{
                  padding: '13px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: (otpLoading || otpCode.some(d => !d)) ? '#94A3B8' : '#333F70',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: (otpLoading || otpCode.some(d => !d)) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)'
                }}
              >
                {otpLoading ? 'Verifying...' : 'Verify & Activate Account'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '12.5px', color: '#64748B' }}>
                {resendCooldown > 0 ? (
                  <span>Resend code in <strong>{resendCooldown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ border: 'none', background: 'none', color: '#0D9488', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
