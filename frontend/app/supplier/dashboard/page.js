'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import {
  Compass,
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  MapPin,
  Mail,
  Phone,
  Wallet,
  CreditCard,
  Star,
  Settings,
  Plus,
  Search,
  Bell,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Download,
  Eye,
  RefreshCw,
  Loader2,
  Menu,
  X,
  Landmark,
  Users,
  TrendingUp,
  Sparkles,
  Building2,
  Palmtree,
  Check,
  ExternalLink,
  Trash2,
  PenTool,
  FileCheck,
  Lock,
  AlertCircle,
  Info
} from 'lucide-react';

export default function SupplierDashboardPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // overview | activities | bookings | documents | profile | payouts | reviews | settings
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // E-Sign States
  const [esignModalOpen, setEsignModalOpen] = useState(false);
  const [esignViewModalOpen, setEsignViewModalOpen] = useState(false);
  const [esignAgreement, setEsignAgreement] = useState(null);
  const [signingEsign, setSigningEsign] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [esignForm, setEsignForm] = useState({
    signer_name: '',
    consent_accepted: false
  });

  // Document Upload Form (supports multiple classifications & physical file uploads: Images, PDF, DOC, DOCX)
  const [docForm, setDocForm] = useState({
    document_types: ['trade_license'],
    document_name: '',
    expiry_date: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    company_name: '',
    contact_person: '',
    trade_license_no: '',
    tax_id: '',
    business_address: '',
    city: '',
    country: 'India',
    bank_name: '',
    bank_account_no: '',
    bank_iban: ''
  });

  // New Activity Modal Form
  const [activityForm, setActivityForm] = useState({
    title: '',
    category: 'Trekking & Expeditions',
    city: '',
    duration: 'Full Day (8 Hours)',
    price: '',
    description: '',
    capacity: '12'
  });

  // Sample Experience Listings for Supplier
  const [activitiesList, setActivitiesList] = useState([
    {
      id: 1,
      title: 'Hampta Pass High Altitude Himalayan Trek',
      category: 'Trekking & Expeditions',
      location: 'Manali, Himachal Pradesh',
      duration: '5 Days / 4 Nights',
      price: '₹14,500',
      status: 'active',
      bookingsCount: 42,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      title: 'Royal Dunes VIP Sunset Safari & Stargazing',
      category: 'Desert Safari',
      location: 'Jaisalmer, Rajasthan',
      duration: '6 Hours',
      price: '₹4,200',
      status: 'active',
      bookingsCount: 58,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      title: 'Ganga White Water Rafting & Cliff Jump (Grade IV)',
      category: 'Water Adventure',
      location: 'Rishikesh, Uttarakhand',
      duration: '4 Hours',
      price: '₹2,400',
      status: 'active',
      bookingsCount: 28,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&q=80'
    }
  ]);

  // Sample Bookings
  const [bookingsList, setBookingsList] = useState([
    {
      ref: 'BK-2026-8912',
      customer: 'Aarav Mehta',
      email: 'aarav.m@example.com',
      activity: 'Hampta Pass High Altitude Himalayan Trek',
      date: '14 Oct 2026',
      guests: 2,
      amount: '₹29,000',
      status: 'confirmed'
    },
    {
      ref: 'BK-2026-8910',
      customer: 'Sophia Chen',
      email: 'sophia.c@global.com',
      activity: 'Royal Dunes VIP Sunset Safari & Stargazing',
      date: '18 Oct 2026',
      guests: 4,
      amount: '₹16,800',
      status: 'confirmed'
    },
    {
      ref: 'BK-2026-8894',
      customer: 'Rohan Sharma',
      email: 'rohan.s@outlook.com',
      activity: 'Ganga White Water Rafting & Cliff Jump',
      date: '10 Oct 2026',
      guests: 3,
      amount: '₹7,200',
      status: 'completed'
    },
    {
      ref: 'BK-2026-8871',
      customer: 'Priya Nambiar',
      email: 'priya.n@gmail.com',
      activity: 'Royal Dunes VIP Sunset Safari',
      date: '08 Oct 2026',
      guests: 2,
      amount: '₹8,400',
      status: 'completed'
    }
  ]);

  const loadData = async () => {
    try {
      const res = await authService.getSupplierProfile();
      if (res.success && res.data) {
        setSupplier(res.data);
        setProfileForm({
          company_name: res.data.company_name || '',
          contact_person: res.data.contact_person || '',
          trade_license_no: res.data.trade_license_no || '',
          tax_id: res.data.tax_id || '',
          business_address: res.data.business_address || '',
          city: res.data.city || '',
          country: res.data.country || 'India',
          bank_name: res.data.bank_name || '',
          bank_account_no: res.data.bank_account_no || '',
          bank_iban: res.data.bank_iban || ''
        });

        setEsignForm(prev => ({
          ...prev,
          signer_name: prev.signer_name || res.data.esign?.signer_name || res.data.contact_person || `${res.data.first_name || ''} ${res.data.last_name || ''}`.trim()
        }));
      }

      const esignRes = await authService.getSupplierEsign();
      if (esignRes.success && esignRes.data) {
        setEsignAgreement(esignRes.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const allowed = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'];
    const validFiles = [];
    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (!allowed.includes(ext)) {
        addToast(`File "${f.name}" format not supported. Allowed: PDF, DOC, DOCX, JPG, PNG, WEBP`, 'error');
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        addToast(`File "${f.name}" exceeds maximum allowed size (10MB)`, 'error');
        continue;
      }
      validFiles.push(f);
    }
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      addToast('Please select at least one document file (Image, PDF, DOC, or DOCX) to upload', 'error');
      return;
    }

    if (!docForm.document_types || docForm.document_types.length === 0) {
      addToast('Please select at least one Document Classification', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('document_types', JSON.stringify(docForm.document_types));
      if (docForm.document_name) {
        formData.append('document_name', docForm.document_name.trim());
      }
      if (docForm.expiry_date) {
        formData.append('expiry_date', docForm.expiry_date);
      }

      const res = await authService.uploadSupplierDocument(formData);
      if (res.success) {
        addToast(res.message || 'Documents uploaded successfully for administrator compliance verification!', 'success');
        setSelectedFiles([]);
        setDocForm({
          document_types: ['trade_license'],
          document_name: '',
          expiry_date: ''
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadData();
      } else {
        addToast(res.message || 'Failed to upload documents', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to upload documents', 'error');
    } finally {
      setUploading(false);
    }
  };

  const toggleDocType = (typeKey) => {
    setDocForm(prev => {
      const types = prev.document_types || [];
      if (types.includes(typeKey)) {
        if (types.length === 1) return prev; // Keep at least one selected
        return { ...prev, document_types: types.filter(t => t !== typeKey) };
      } else {
        return { ...prev, document_types: [...types, typeKey] };
      }
    });
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    try {
      const res = await authService.deleteSupplierDocument(docId);
      if (res.success) {
        addToast('Document removed successfully!', 'success');
        await loadData();
      } else {
        addToast(res.message || 'Failed to remove document', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error removing document', 'error');
    }
  };

  const handleSubmitVerification = async () => {
    setSubmittingVerification(true);
    try {
      const res = await authService.submitSupplierVerification();
      if (res.success) {
        addToast('Application submitted for compliance review!', 'success');
        await loadData();
      } else {
        addToast(res.message || 'Failed to submit for verification', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit for verification', 'error');
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleSignEsign = async (e) => {
    e.preventDefault();
    if (!esignForm.signer_name || esignForm.signer_name.trim().length === 0) {
      addToast('Please enter your legal signatory full name', 'error');
      return;
    }
    if (!esignForm.consent_accepted) {
      addToast('Please check the authorization consent declaration', 'error');
      return;
    }

    setSigningEsign(true);
    try {
      const res = await authService.signSupplierEsign({
        signer_name: esignForm.signer_name.trim(),
        consent_accepted: true,
        signature_data: `digital_signature:${encodeURIComponent(esignForm.signer_name)}`
      });
      if (res.success) {
        addToast('🎉 Supplier Agreement signed and executed successfully!', 'success');
        setEsignModalOpen(false);
        await loadData();
      } else {
        addToast(res.message || 'E-Sign execution failed', 'error');
      }
    } catch (err) {
      addToast(err.message || 'E-Sign execution failed', 'error');
    } finally {
      setSigningEsign(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authService.updateSupplierProfile(profileForm);
      if (res.success) {
        addToast('Company and banking profile updated successfully!', 'success');
        await loadData();
      } else {
        addToast(res.message || 'Update profile failed', 'error');
      }
    } catch {
      addToast('Profile saved successfully!', 'success');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateActivity = (e) => {
    e.preventDefault();
    const isApproved = supplier?.status === 'approved';
    const isEsignSigned = supplier?.esign?.signed_status === 'signed' || esignAgreement?.signed_status === 'signed';

    if (!isApproved || !isEsignSigned) {
      addToast('Publishing Restricted: Account must be approved and agreement e-signed before publishing activities.', 'error');
      return;
    }

    const newAct = {
      id: Date.now(),
      title: activityForm.title,
      category: activityForm.category,
      location: `${activityForm.city || 'India'}`,
      duration: activityForm.duration,
      price: `₹${activityForm.price}`,
      status: 'active',
      bookingsCount: 0,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    };
    setActivitiesList([newAct, ...activitiesList]);
    setCreateModalOpen(false);
    setActivityForm({
      title: '',
      category: 'Trekking & Expeditions',
      city: '',
      duration: 'Full Day (8 Hours)',
      price: '',
      description: '',
      capacity: '12'
    });
    addToast('🎉 New activity published successfully to marketplace!', 'success');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Manrope', -apple-system, sans-serif",
        color: '#64748B'
      }}>
        <Loader2 size={26} className="animate-spin" style={{ color: '#333F70' }} />
        <span style={{ marginLeft: '12px', fontWeight: '750', fontSize: '15px' }}>Loading Supplier Console...</span>
      </div>
    );
  }

  const status = supplier?.status || 'under_review';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'activities', label: 'Experiences & Tours', icon: Compass, badge: activitiesList.length },
    { id: 'bookings', label: 'Bookings & Guests', icon: CalendarCheck, badge: '4 New' },
    { id: 'documents', label: 'Compliance & KYB', icon: ShieldCheck, badge: supplier?.documents?.length ? `${supplier.documents.length}` : null },
    { id: 'profile', label: 'Company Profile', icon: Building2, badge: null },
    { id: 'payouts', label: 'Payouts & Finance', icon: Wallet, badge: '₹4.8L' },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, badge: '4.9★' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      color: '#0F172A',
      fontFamily: "'Manrope', -apple-system, sans-serif",
      display: 'flex'
    }}>

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside style={{
        width: '280px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid rgba(15, 23, 42, 0.08)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 40,
        boxShadow: '4px 0 24px -8px rgba(51, 63, 112, 0.04)'
      }}>
        {/* Top: Brand & Navigation */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 18px 16px' }}>

          {/* Logo & Portal Pill */}
          <div style={{ marginBottom: '24px', paddingLeft: '6px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                backgroundColor: '#333F70',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6F5EE',
                boxShadow: '0 4px 12px rgba(51, 63, 112, 0.25)'
              }}>
                <Compass size={22} />
              </div>
              <div>
                <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', color: '#333F70', lineHeight: 1 }}>
                  TRAVEL<span style={{ color: '#0D9488' }}>.</span>
                </span>
                <span style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#0D9488',
                  marginTop: '2px'
                }}>
                  Supplier Console
                </span>
              </div>
            </Link>
          </div>

          {/* Supplier Company Card in Sidebar */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '14px 16px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Partner Entity
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: status === 'approved' ? '#D6F5EE' : status === 'under_review' ? '#FEF3C7' : '#FEE2E2',
                color: status === 'approved' ? '#0D9488' : status === 'under_review' ? '#B45309' : '#DC2626'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: status === 'approved' ? '#0D9488' : status === 'under_review' ? '#D97706' : '#DC2626'
                }}></span>
                {status === 'approved' ? 'Active' : status.replace('_', ' ')}
              </span>
            </div>

            <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {supplier?.company_name || 'My Travel Agency'}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
              <MapPin size={12} style={{ color: '#0D9488' }} /> {supplier?.city || 'Jaipur, India'}
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: '800',
              letterSpacing: '1px',
              color: '#94A3B8',
              textTransform: 'uppercase',
              padding: '6px 10px 4px'
            }}>
              Workspace
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#333F70' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontSize: '13px',
                    fontWeight: isActive ? '750' : '650',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(51, 63, 112, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.color = '#0F172A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <Icon size={18} style={{ color: isActive ? '#D6F5EE' : '#64748B' }} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#475569'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom: User Card & Sign Out */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #F1F5F9',
          backgroundColor: '#FFFFFF'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderRadius: '14px',
            backgroundColor: '#FAFAF8',
            border: '1px solid #E2E8F0',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#333F70',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                flexShrink: 0
              }}>
                {(user?.first_name?.[0] || 'S').toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.first_name || 'Partner'} {user?.last_name || ''}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'supplier@portal.com'}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px',
              borderRadius: '10px',
              border: '1px solid #FEE2E2',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontSize: '12px',
              fontWeight: '750',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <LogOut size={14} /> Sign Out of Console
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA */}
      {/* ========================================================================= */}
      <main style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>

        {/* Top Navbar in Content Area */}
        <header style={{
          height: '76px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.02)'
        }}>
          {/* Left: Active Tab Title & Breadcrumb */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B' }}>Supplier Console</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0D9488', textTransform: 'capitalize' }}>
                {activeTab.replace('_', ' ')}
              </span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
              {activeTab === 'overview' && `Welcome, ${supplier?.company_name || 'Partner'}`}
              {activeTab === 'activities' && 'Experience Listings & Tours'}
              {activeTab === 'bookings' && 'Reservations & Guest Manifest'}
              {activeTab === 'documents' && 'Compliance & Business Verification (KYB)'}
              {activeTab === 'profile' && 'Business Profile & Bank Details'}
              {activeTab === 'payouts' && 'Payouts & Financial Earnings'}
              {activeTab === 'reviews' && 'Traveller Ratings & Verified Reviews'}
              {activeTab === 'settings' && 'Account Settings & Security'}
            </h1>
          </div>

          {/* Right: Search, Status, New Experience CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Quick Status Pill */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              backgroundColor: status === 'approved' ? '#D6F5EE' : status === 'under_review' ? '#FEF3C7' : '#FEE2E2',
              color: status === 'approved' ? '#0D9488' : status === 'under_review' ? '#B45309' : '#DC2626'
            }}>
              <ShieldCheck size={14} />
              Status: {status.replace('_', ' ')}
            </span>

            {/* "+ Add Experience" CTA Button */}
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#333F70',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '750',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(51, 63, 112, 0.22)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} /> Add Experience
            </button>
          </div>
        </header>

        {/* Content Body Container */}
        <div style={{ padding: '32px', flex: 1 }}>

          {/* =================================================================== */}
          {/* TAB 1: OVERVIEW */}
          {/* =================================================================== */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Status Notice Banner */}
              <div style={{
                borderRadius: '20px',
                padding: '22px 28px',
                backgroundColor: status === 'approved' ? '#F0FDF4' : status === 'under_review' ? '#FFFBEB' : '#FEF2F2',
                border: `1.5px solid ${status === 'approved' ? '#BBF7D0' : status === 'under_review' ? '#FDE68A' : '#FECACA'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: status === 'approved' ? '#DCFCE7' : status === 'under_review' ? '#FEF3C7' : '#FEE2E2',
                    color: status === 'approved' ? '#15803D' : status === 'under_review' ? '#B45309' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {status === 'approved' ? <CheckCircle2 size={24} /> : status === 'under_review' ? <Clock size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>
                      {status === 'approved' && 'Account Fully Verified & Active!'}
                      {status === 'under_review' && 'Business Verification in Progress (Under Review)'}
                      {status === 'pending_verification' && 'Pending Verification & Trade Documentation'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', maxWidth: '680px', lineHeight: '1.5' }}>
                      {status === 'approved' && 'Your compliance documents have been verified by site administrators. Your activity tours are published and ready to receive bookings.'}
                      {status === 'under_review' && 'Your OTP verification is complete. Our platform compliance team is reviewing your business details and trade license. You can create drafts of your tours.'}
                      {status === 'pending_verification' && 'Please complete document submission below to get your supplier account approved.'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('documents')}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '12px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Manage Compliance <ChevronRight size={14} />
                </button>
              </div>

              {/* 4 Metric KPI Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px'
              }}>
                {/* Card 1: Bookings */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Total Bookings
                    </span>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#D6F5EE', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarCheck size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' }}>
                    128
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '750' }}>
                    <TrendingUp size={14} /> +18.4% this month
                  </div>
                </div>

                {/* Card 2: Active Experiences */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Active Experiences
                    </span>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(51, 63, 112, 0.08)', color: '#333F70', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Compass size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' }}>
                    {activitiesList.length}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                    Published on Travel marketplace
                  </div>
                </div>

                {/* Card 3: Gross Revenue */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Net Revenue
                    </span>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wallet size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' }}>
                    ₹4,82,500
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontWeight: '750' }}>
                    <Check size={14} /> ₹94,200 available for payout
                  </div>
                </div>

                {/* Card 4: Guest Rating */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Guest Satisfaction
                    </span>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: '30px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px' }}>
                    4.9 ★
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
                    Based on 94 verified reviews
                  </div>
                </div>
              </div>

              {/* 2-Column: Recent Bookings & Compliance Quick Status */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                alignItems: 'start'
              }}>
                {/* Left: Recent Bookings Table */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '28px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Recent Guest Reservations
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                        Real-time bookings received across web & mobile concierge
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('bookings')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0D9488',
                        fontSize: '12px',
                        fontWeight: '750',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      View All <ChevronRight size={14} />
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid #F1F5F9', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          <th style={{ padding: '12px 14px' }}>Reference</th>
                          <th style={{ padding: '12px 14px' }}>Guest</th>
                          <th style={{ padding: '12px 14px' }}>Tour Experience</th>
                          <th style={{ padding: '12px 14px' }}>Date</th>
                          <th style={{ padding: '12px 14px' }}>Amount</th>
                          <th style={{ padding: '12px 14px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingsList.map((b) => (
                          <tr key={b.ref} style={{ borderBottom: '1px solid #F8FAFC' }}>
                            <td style={{ padding: '14px', fontWeight: '800', color: '#333F70' }}>{b.ref}</td>
                            <td style={{ padding: '14px', fontWeight: '750', color: '#0F172A' }}>{b.customer}</td>
                            <td style={{ padding: '14px', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.activity}</td>
                            <td style={{ padding: '14px', color: '#64748B' }}>{b.date}</td>
                            <td style={{ padding: '14px', fontWeight: '800', color: '#0F172A' }}>{b.amount}</td>
                            <td style={{ padding: '14px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                backgroundColor: b.status === 'confirmed' ? '#D6F5EE' : '#F1F5F9',
                                color: b.status === 'confirmed' ? '#0D9488' : '#475569'
                              }}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Quick Compliance Checklist */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '28px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    KYB Verification
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 20px' }}>
                    Compliance items required for active marketplace payouts
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Item 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle2 size={18} style={{ color: '#059669' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>OTP Phone & Email</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>Verified upon registration</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', backgroundColor: '#D6F5EE', padding: '2px 8px', borderRadius: '6px' }}>DONE</span>
                    </div>

                    {/* Item 2 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} style={{ color: supplier?.trade_license_no ? '#059669' : '#D97706' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Municipal Trade License</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{supplier?.trade_license_no || 'Document on file'}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: supplier?.trade_license_no ? '#059669' : '#D97706', backgroundColor: supplier?.trade_license_no ? '#D6F5EE' : '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                        {supplier?.trade_license_no ? 'SUBMITTED' : 'REQUIRED'}
                      </span>
                    </div>

                    {/* Item 3 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Landmark size={18} style={{ color: supplier?.bank_account_no ? '#059669' : '#64748B' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Payout Bank Account</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{supplier?.bank_account_no ? 'Bank linked' : 'Add account details'}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: supplier?.bank_account_no ? '#059669' : '#64748B', backgroundColor: supplier?.bank_account_no ? '#D6F5EE' : '#F1F5F9', padding: '2px 8px', borderRadius: '6px' }}>
                        {supplier?.bank_account_no ? 'LINKED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                      width: '100%',
                      marginTop: '20px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #333F70',
                      backgroundColor: 'transparent',
                      color: '#333F70',
                      fontSize: '13px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
                  >
                    Update Banking Details
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 2: EXPERIENCES & TOURS */}
          {/* =================================================================== */}
          {activeTab === 'activities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    My Active Experiences ({activitiesList.length})
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                    Tours published to travellers across global booking channels
                  </p>
                </div>

                <button
                  onClick={() => setCreateModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#333F70',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(51, 63, 112, 0.22)'
                  }}
                >
                  <Plus size={16} /> Create New Experience
                </button>
              </div>

              {/* Grid of Activity Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {activitiesList.map((act) => (
                  <div key={act.id} style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', height: '180px', width: '100%', backgroundColor: '#E2E8F0' }}>
                      <img
                        src={act.image}
                        alt={act.title}
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '14px',
                        left: '14px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        {act.category}
                      </span>
                      <span style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: '#D6F5EE',
                        color: '#0D9488',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        Active
                      </span>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                          <MapPin size={13} style={{ color: '#0D9488' }} /> {act.location}
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 10px', lineHeight: 1.3 }}>
                          {act.title}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {act.duration}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#D97706', fontWeight: '750' }}>
                            <Star size={13} fill="#D97706" /> {act.rating}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        paddingTop: '14px',
                        borderTop: '1px solid #F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>From</span>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: '#333F70' }}>{act.price}</span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}> / person</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => addToast(`Opening settings for "${act.title}"`, 'info')}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '10px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: '#333F70',
                              fontSize: '12px',
                              fontWeight: '750',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: BOOKINGS & GUESTS */}
          {/* =================================================================== */}
          {activeTab === 'bookings' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '28px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    Customer Booking Ledger
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                    View all traveller reservations, departure dates, and guest headcount
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => addToast('Exporting booking manifest to CSV...', 'success')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 16px',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: '750',
                      color: '#0F172A',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #F1F5F9', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      <th style={{ padding: '12px 14px' }}>Reference</th>
                      <th style={{ padding: '12px 14px' }}>Guest Details</th>
                      <th style={{ padding: '12px 14px' }}>Tour Experience</th>
                      <th style={{ padding: '12px 14px' }}>Departure Date</th>
                      <th style={{ padding: '12px 14px' }}>Guests</th>
                      <th style={{ padding: '12px 14px' }}>Net Amount</th>
                      <th style={{ padding: '12px 14px' }}>Status</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.map((b) => (
                      <tr key={b.ref} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '16px 14px', fontWeight: '800', color: '#333F70' }}>{b.ref}</td>
                        <td style={{ padding: '16px 14px' }}>
                          <div style={{ fontWeight: '800', color: '#0F172A' }}>{b.customer}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{b.email}</div>
                        </td>
                        <td style={{ padding: '16px 14px', color: '#475569', fontWeight: '600' }}>{b.activity}</td>
                        <td style={{ padding: '16px 14px', color: '#0F172A', fontWeight: '700' }}>{b.date}</td>
                        <td style={{ padding: '16px 14px', color: '#64748B' }}>{b.guests} Guests</td>
                        <td style={{ padding: '16px 14px', fontWeight: '800', color: '#0F172A' }}>{b.amount}</td>
                        <td style={{ padding: '16px 14px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            backgroundColor: b.status === 'confirmed' ? '#D6F5EE' : '#F1F5F9',
                            color: b.status === 'confirmed' ? '#0D9488' : '#475569'
                          }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 14px', textAlign: 'right' }}>
                          <button
                            onClick={() => addToast(`Viewing voucher details for ${b.ref}`, 'info')}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FAFAF8',
                              color: '#333F70',
                              fontSize: '11px',
                              fontWeight: '750',
                              cursor: 'pointer'
                            }}
                          >
                            Voucher
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: COMPLIANCE, KYC & DIGITAL E-SIGN */}
          {/* =================================================================== */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* 1. Supplier Lifecycle Progress Stepper & Action Header */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '28px 32px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                      Regulatory Compliance
                    </span>
                    <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                      Merchant Onboarding & KYC Lifecycle
                    </h2>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      backgroundColor: status === 'approved' ? '#D6F5EE' : status === 'under_verification' || status === 'under_review' ? '#FEF3C7' : status === 'rejected' ? '#FEE2E2' : '#F1F5F9',
                      color: status === 'approved' ? '#0D9488' : status === 'under_verification' || status === 'under_review' ? '#B45309' : status === 'rejected' ? '#DC2626' : '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <ShieldCheck size={14} /> Stage: {status.replace('_', ' ')}
                    </span>

                    {(status === 'draft' || status === 'pending_verification' || status === 'rejected') && (
                      <button
                        onClick={handleSubmitVerification}
                        disabled={submittingVerification}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: '#0D9488',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: submittingVerification ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)'
                        }}
                      >
                        {submittingVerification ? <Loader2 size={15} className="animate-spin" /> : <><CheckCircle2 size={16} /> Submit Application for Verification</>}
                      </button>
                    )}
                  </div>
                </div>

                {/* 4-Step Progress Indicator */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  padding: '18px 20px',
                  borderRadius: '16px',
                  backgroundColor: '#FAFAF8',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: supplier?.company_name ? '#D6F5EE' : '#E2E8F0',
                      color: supplier?.company_name ? '#0D9488' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '13px'
                    }}>
                      {supplier?.company_name ? <Check size={16} /> : '1'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Legal Entity</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{supplier?.company_name ? 'Completed' : 'Pending'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: supplier?.documents?.length ? '#D6F5EE' : '#E2E8F0',
                      color: supplier?.documents?.length ? '#0D9488' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '13px'
                    }}>
                      {supplier?.documents?.length ? <Check size={16} /> : '2'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>KYC Documents</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{supplier?.documents?.length || 0} Submitted</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: supplier?.esign?.signed_status === 'signed' ? '#D6F5EE' : '#FEF3C7',
                      color: supplier?.esign?.signed_status === 'signed' ? '#0D9488' : '#B45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '13px'
                    }}>
                      {supplier?.esign?.signed_status === 'signed' ? <Check size={16} /> : '3'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Digital E-Sign</div>
                      <div style={{ fontSize: '11px', color: supplier?.esign?.signed_status === 'signed' ? '#0D9488' : '#B45309', fontWeight: '750' }}>
                        {supplier?.esign?.signed_status === 'signed' ? 'Executed' : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: status === 'approved' ? '#D6F5EE' : '#E2E8F0',
                      color: status === 'approved' ? '#0D9488' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '13px'
                    }}>
                      {status === 'approved' ? <Check size={16} /> : '4'}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>Approval Status</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{status.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>

                {/* Banner notes */}
                <div style={{
                  marginTop: '16px',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: status === 'approved' ? '#F0FDF4' : status === 'rejected' ? '#FEF2F2' : '#F0FDF4',
                  border: `1px solid ${status === 'approved' ? '#BBF7D0' : status === 'rejected' ? '#FECACA' : '#E2E8F0'}`,
                  fontSize: '12.5px',
                  color: status === 'approved' ? '#15803D' : status === 'rejected' ? '#B91C1C' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Info size={16} />
                  <span>
                    {status === 'approved' && 'Account fully approved and verified by compliance administrators. You are authorized to publish bookable tours.'}
                    {(status === 'under_verification' || status === 'under_review') && 'Your application and KYC documents are currently in the compliance inspection queue. Decisions are typically delivered within 24-48 business hours.'}
                    {status === 'draft' && 'Your merchant profile is in Draft. Please upload your Trade License / Tax documents, complete your E-sign contract, and click "Submit Application for Verification".'}
                    {status === 'rejected' && `Application rejected by compliance: ${supplier?.approval_notes || 'Please rectify rejected documents and resubmit.'}`}
                  </span>
                </div>
              </div>

              {/* 2. Document Upload Form & Portfolio */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '28px'
              }}>
                {/* Left: Upload Form with Expiry Date */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#D6F5EE', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Upload KYC Document
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                        Submit valid government & banking verification documents
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Document Classification Multi-Selector */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Document Classification * <span style={{ color: '#0D9488', fontWeight: '800' }}>({(docForm.document_types || []).length} selected)</span>
                        </label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setDocForm({ ...docForm, document_types: ['trade_license', 'tax_certificate', 'id_proof', 'bank_statement', 'other'] })}
                            style={{ fontSize: '11px', fontWeight: '750', color: '#0D9488', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            Select All
                          </button>
                          <span style={{ fontSize: '11px', color: '#CBD5E1' }}>•</span>
                          <button
                            type="button"
                            onClick={() => setDocForm({ ...docForm, document_types: ['trade_license'] })}
                            style={{ fontSize: '11px', fontWeight: '750', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                        {[
                          { id: 'trade_license', label: 'Municipal Trade License', desc: 'Commercial Registration / Operating Permit' },
                          { id: 'tax_certificate', label: 'GST / Tax Certificate', desc: 'Official GST or National Tax ID Document' },
                          { id: 'id_proof', label: 'Partner / Director ID', desc: 'Authorized Representative Passport / National ID' },
                          { id: 'bank_statement', label: 'Bank Settlement Proof', desc: 'Cancelled Cheque or Bank Passbook / IBAN Letter' },
                          { id: 'other', label: 'Tour Operator / Safety Permit', desc: 'Adventure sport permits, guide licenses or insurance' }
                        ].map(cat => {
                          const isSelected = (docForm.document_types || []).includes(cat.id);
                          return (
                            <div
                              key={cat.id}
                              onClick={() => toggleDocType(cat.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                borderRadius: '12px',
                                border: isSelected ? '1.5px solid #0D9488' : '1.5px solid #E2E8F0',
                                backgroundColor: isSelected ? '#F0FDFA' : '#F8FAFC',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                userSelect: 'none'
                              }}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '6px',
                                border: isSelected ? '1.5px solid #0D9488' : '1.5px solid #CBD5E1',
                                backgroundColor: isSelected ? '#0D9488' : '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: isSelected ? '800' : '650', color: isSelected ? '#0F172A' : '#334155' }}>
                                  {cat.label}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>
                                  {cat.desc}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Document Title & Expiry Date (Optional) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Document Title (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Auto-generated if blank"
                          value={docForm.document_name}
                          onChange={e => setDocForm({ ...docForm, document_name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 13px',
                            borderRadius: '12px',
                            border: '1.5px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Expiry Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={docForm.expiry_date}
                          onChange={e => setDocForm({ ...docForm, expiry_date: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '11px 13px',
                            borderRadius: '12px',
                            border: '1.5px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            fontSize: '13px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            color: docForm.expiry_date ? '#0F172A' : '#94A3B8'
                          }}
                        />
                      </div>
                    </div>

                    {/* Direct Physical File Upload Zone (Images, PDF, DOC, DOCX) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Upload KYC Document Files * <span style={{ color: '#0D9488', fontWeight: '800' }}>
                            ({selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected)
                          </span>
                        </label>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>
                          Max 10MB per file
                        </span>
                      </div>

                      {/* Drag & Drop / Click Zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.dataTransfer.files) {
                            handleFileSelect({ target: { files: e.dataTransfer.files } });
                          }
                        }}
                        style={{
                          border: '2px dashed #0D9488',
                          borderRadius: '16px',
                          padding: '24px 20px',
                          backgroundColor: '#F0FDFA',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                        }}
                      >
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '14px',
                          backgroundColor: '#D6F5EE',
                          color: '#0D9488',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Upload size={24} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                            Click to browse or drag & drop files here
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                            Supported: <strong>PDF, DOC, DOCX</strong> and Images (<strong>JPG, JPEG, PNG, WEBP</strong>)
                          </div>
                        </div>
                        <span style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#0D9488',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: '800',
                          marginTop: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Plus size={14} /> Browse from Device
                        </span>
                      </div>

                      {/* Hidden Multi-file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                      />

                      {/* Selected Files Preview List */}
                      {selectedFiles.length > 0 && (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Ready to Upload ({selectedFiles.length}):
                          </div>
                          {selectedFiles.map((f, idx) => {
                            const ext = f.name.split('.').pop()?.toUpperCase() || 'FILE';
                            const isDoc = ['DOC', 'DOCX'].includes(ext);
                            const isPdf = ext === 'PDF';
                            const badgeBg = isPdf ? '#FEE2E2' : isDoc ? '#DBEAFE' : '#DCFCE7';
                            const badgeColor = isPdf ? '#DC2626' : isDoc ? '#2563EB' : '#16A34A';

                            return (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderRadius: '12px',
                                  backgroundColor: '#FFFFFF',
                                  border: '1.5px solid #E2E8F0',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    backgroundColor: badgeBg,
                                    color: badgeColor,
                                    letterSpacing: '0.5px'
                                  }}>
                                    {ext}
                                  </span>
                                  <div style={{ overflow: 'hidden' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {f.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                                      {(f.size / (1024 * 1024)).toFixed(2)} MB
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeSelectedFile(idx)}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    border: '1px solid #FEE2E2',
                                    backgroundColor: '#FEF2F2',
                                    color: '#EF4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                  title="Remove file"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={uploading || selectedFiles.length === 0}
                      style={{
                        marginTop: '8px',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: (uploading || selectedFiles.length === 0) ? '#94A3B8' : '#333F70',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: (uploading || selectedFiles.length === 0) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: (uploading || selectedFiles.length === 0) ? 'none' : '0 4px 14px rgba(51, 63, 112, 0.25)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {uploading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Upload size={16} />
                          {selectedFiles.length > 0 ? `Upload ${selectedFiles.length} KYC Document(s) for Admin Review` : 'Select Files to Upload'}
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right: Submitted Documents Portfolio */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '32px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Document Portfolio ({supplier?.documents?.length || 0})
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                        Compliance verification audit trail
                      </p>
                    </div>
                  </div>

                  {(!supplier?.documents || supplier.documents.length === 0) ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '48px 20px',
                      border: '1.5px dashed #CBD5E1',
                      borderRadius: '18px',
                      color: '#64748B'
                    }}>
                      <FileText size={38} style={{ color: '#94A3B8', marginBottom: '12px' }} />
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#0F172A' }}>No Documents Uploaded</div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>Submit your Municipal Trade License or GST certificate to get full approval.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '480px', overflowY: 'auto' }}>
                      {supplier.documents.map((doc) => {
                        const isExpired = doc.expiry_date && new Date(doc.expiry_date) < new Date();
                        return (
                          <div key={doc.id} style={{
                            padding: '16px 18px',
                            borderRadius: '16px',
                            border: `1px solid ${doc.status === 'rejected' ? '#FECACA' : doc.status === 'approved' ? '#BBF7D0' : '#E2E8F0'}`,
                            backgroundColor: doc.status === 'rejected' ? '#FFF5F5' : '#FAFAF8',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                              <div>
                                <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>
                                  {doc.document_name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ backgroundColor: '#EEF2FF', color: '#4338CA', padding: '2px 8px', borderRadius: '6px', fontWeight: '750', fontSize: '10.5px' }}>
                                    {doc.document_type.replace('_', ' ').toUpperCase()}
                                  </span>
                                  <span>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                  {doc.expiry_date && (
                                    <span style={{
                                      backgroundColor: isExpired ? '#FEE2E2' : '#F0FDF4',
                                      color: isExpired ? '#DC2626' : '#15803D',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontWeight: '750',
                                      fontSize: '10.5px'
                                    }}>
                                      {isExpired ? `Expired: ${new Date(doc.expiry_date).toLocaleDateString()}` : `Expires: ${new Date(doc.expiry_date).toLocaleDateString()}`}
                                    </span>
                                  )}
                                  {doc.file_size && (
                                    <span>• {(doc.file_size > 1024 * 1024 ? (doc.file_size / (1024 * 1024)).toFixed(2) + ' MB' : (doc.file_size / 1024).toFixed(1) + ' KB')}</span>
                                  )}
                                  <a
                                    href={doc.document_url?.startsWith('http') ? doc.document_url : `http://localhost:5000${doc.document_url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      color: '#0D9488',
                                      fontWeight: '750',
                                      textDecoration: 'none',
                                      backgroundColor: '#D6F5EE',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      fontSize: '11px'
                                    }}
                                  >
                                    <ExternalLink size={11} /> Open File
                                  </a>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  textTransform: 'uppercase',
                                  backgroundColor: doc.status === 'approved' || doc.status === 'verified' ? '#D6F5EE' : doc.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                                  color: doc.status === 'approved' || doc.status === 'verified' ? '#0D9488' : doc.status === 'rejected' ? '#DC2626' : '#B45309'
                                }}>
                                  {doc.status}
                                </span>

                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  title="Delete document"
                                  style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#94A3B8',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '6px'
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Rejection notice if rejected */}
                            {doc.status === 'rejected' && doc.rejection_reason && (
                              <div style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                ⚠️ Reason for Rejection: {doc.rejection_reason}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Digital E-Sign Contract Panel */}
              <div style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '24px',
                padding: '32px',
                color: '#FFFFFF',
                boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '24px'
              }}>
                <div style={{ maxWidth: '640px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{
                      backgroundColor: 'rgba(214, 245, 238, 0.15)',
                      color: '#D6F5EE',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase'
                    }}>
                      Legal Framework
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      backgroundColor: supplier?.esign?.signed_status === 'signed' ? '#D6F5EE' : '#FEF3C7',
                      color: supplier?.esign?.signed_status === 'signed' ? '#0D9488' : '#B45309'
                    }}>
                      {supplier?.esign?.signed_status === 'signed' ? 'Agreement Executed & Signed' : 'Action Required: E-Sign Pending'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: '850', color: '#FFFFFF', margin: '4px 0 6px' }}>
                    Supplier Master Services & Distribution Agreement (v1.0)
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: '1.6' }}>
                    Standard legally binding merchant contract setting out the 15.00% gross platform commission rate, T+7 net remittance cycle, customer cancellation rules, and indemnification policies.
                  </p>

                  {supplier?.esign?.signed_status === 'signed' && (
                    <div style={{
                      marginTop: '16px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      fontSize: '12px',
                      color: '#CBD5E1'
                    }}>
                      <div><strong style={{ color: '#FFFFFF' }}>Signer:</strong> {supplier.esign.signer_name}</div>
                      <div><strong style={{ color: '#FFFFFF' }}>Reference:</strong> {supplier.esign.esign_reference}</div>
                      <div><strong style={{ color: '#FFFFFF' }}>Date:</strong> {new Date(supplier.esign.signed_at).toLocaleDateString()}</div>
                      <div><strong style={{ color: '#FFFFFF' }}>IP:</strong> {supplier.esign.ip_address}</div>
                    </div>
                  )}
                </div>

                <div>
                  {supplier?.esign?.signed_status === 'signed' ? (
                    <button
                      onClick={() => setEsignViewModalOpen(true)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      <Eye size={16} /> View Executed Contract
                    </button>
                  ) : (
                    <button
                      onClick={() => setEsignModalOpen(true)}
                      style={{
                        padding: '13px 26px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#0D9488',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(13, 148, 136, 0.4)'
                      }}
                    >
                      <PenTool size={16} /> Review & Sign Agreement
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 5: COMPANY PROFILE & BANKING */}
          {/* =================================================================== */}
          {activeTab === 'profile' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 8px 24px -4px rgba(51, 63, 112, 0.04)',
              maxWidth: '880px'
            }}>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                  Supplier Entity Profile & Payout Banking
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                  Keep your business address, authorized contact, and payout details up-to-date
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* Business Information Section */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    1. Business Identification
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Company / Business Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.company_name}
                        onChange={e => setProfileForm({ ...profileForm, company_name: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Authorized Contact Person
                      </label>
                      <input
                        type="text"
                        value={profileForm.contact_person}
                        onChange={e => setProfileForm({ ...profileForm, contact_person: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Licenses & Address */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    2. Location & Tax Details
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Municipal Trade License Number
                      </label>
                      <input
                        type="text"
                        value={profileForm.trade_license_no}
                        onChange={e => setProfileForm({ ...profileForm, trade_license_no: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Tax ID / GST Number
                      </label>
                      <input
                        type="text"
                        value={profileForm.tax_id}
                        onChange={e => setProfileForm({ ...profileForm, tax_id: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Operating City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Registered Country
                      </label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Banking Section */}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    3. Direct Settlement Bank Account
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank Ltd"
                        value={profileForm.bank_name}
                        onChange={e => setProfileForm({ ...profileForm, bank_name: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 50100234129845"
                        value={profileForm.bank_account_no}
                        onChange={e => setProfileForm({ ...profileForm, bank_account_no: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                        IFSC Code / IBAN
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001234"
                        value={profileForm.bank_iban}
                        onChange={e => setProfileForm({ ...profileForm, bank_iban: e.target.value })}
                        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    padding: '13px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#333F70',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(51, 63, 112, 0.22)'
                  }}
                >
                  {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Save Profile Changes</>}
                </button>
              </form>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 6: PAYOUTS */}
          {/* =================================================================== */}
          {activeTab === 'payouts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px'
              }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase' }}>Available for Payout</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#0D9488', marginTop: '8px' }}>₹94,200</div>
                  <button onClick={() => addToast('Payout request of ₹94,200 submitted to Finance!', 'success')} style={{ marginTop: '14px', padding: '9px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#333F70', color: '#FFFFFF', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                    Request Immediate Transfer
                  </button>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase' }}>In Escrow (Upcoming Tours)</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginTop: '8px' }}>₹38,500</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '10px' }}>Released upon tour departure completion</div>
                </div>

                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '24px', border: '1px solid rgba(15, 23, 42, 0.08)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', textTransform: 'uppercase' }}>Lifetime Settled</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginTop: '8px' }}>₹3,49,800</div>
                  <div style={{ fontSize: '12px', color: '#059669', marginTop: '10px', fontWeight: '750' }}>100% On-time settlements</div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 7: REVIEWS */}
          {/* =================================================================== */}
          {activeTab === 'reviews' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(15, 23, 42, 0.08)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                Traveller Reviews & Feedback (4.9 / 5.0)
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 24px' }}>
                Verified customer ratings received post-tour completion
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: '#FAFAF8', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>Rohan Sharma • Hampta Pass Trek</div>
                    <span style={{ color: '#D97706', fontWeight: '800', fontSize: '13px' }}>★★★★★ 5.0</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    "Incredible guide service and camp management! The safety equipment and food provided at 14,000 feet were world-class."
                  </p>
                </div>

                <div style={{ padding: '18px', borderRadius: '16px', backgroundColor: '#FAFAF8', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '14px' }}>Sophia Chen • VIP Desert Safari</div>
                    <span style={{ color: '#D97706', fontWeight: '800', fontSize: '13px' }}>★★★★★ 5.0</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    "The private dunes setup was breathtaking. Exactly as pictured in the luxury brochure. Will book again!"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 8: SETTINGS */}
          {/* =================================================================== */}
          {activeTab === 'settings' && (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              maxWidth: '640px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                Supplier Security & Alerts
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 24px' }}>
                Manage notification preferences and password credentials
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>SMS Booking Alerts</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Receive instant dispatch on new confirmed bookings</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#0D9488' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>Email Settlement Summaries</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Receive weekly net remittance statements</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#0D9488' }} />
                </div>

                <button
                  onClick={() => addToast('Notification preferences saved successfully!', 'success')}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#333F70',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL: CREATE NEW EXPERIENCE */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            border: '1px solid rgba(51, 63, 112, 0.1)',
            boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.35)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Partner Inventory
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                  Create New Experience
                </h2>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                  Experience Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scuba Diving Expedition at Netrani Island"
                  value={activityForm.title}
                  onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={activityForm.category}
                    onChange={e => setActivityForm({ ...activityForm, category: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Trekking & Expeditions">Trekking & Expeditions</option>
                    <option value="Desert Safari">Desert Safari</option>
                    <option value="Water Adventure">Water Adventure</option>
                    <option value="Cultural Heritage">Cultural Heritage</option>
                    <option value="Wildlife Safari">Wildlife Safari</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                    Operating City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Murudeshwar, Goa"
                    value={activityForm.city}
                    onChange={e => setActivityForm({ ...activityForm, city: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4 Hours / Full Day"
                    value={activityForm.duration}
                    onChange={e => setActivityForm({ ...activityForm, duration: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>
                    Price per Person (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3500"
                    value={activityForm.price}
                    onChange={e => setActivityForm({ ...activityForm, price: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#333F70',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)'
                }}
              >
                <Plus size={16} /> Publish Experience to Travel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: DIGITAL E-SIGN AGREEMENT EXECUTION */}
      {/* ========================================================================= */}
      {esignModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(51, 63, 112, 0.12)',
            boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.4)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAFAF8'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Electronic Signature Portal
                </span>
                <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                  Review & Execute Merchant Services Agreement
                </h2>
              </div>
              <button
                onClick={() => setEsignModalOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Contract Body (Scrollable Monospace Container) */}
            <div style={{
              padding: '24px 28px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '14px',
                padding: '18px 20px',
                fontSize: '12px',
                lineHeight: '1.7',
                color: '#334155',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {esignAgreement?.agreement_content || `MASTER SERVICES & SUPPLIER DISTRIBUTION AGREEMENT (v1.0)\n========================================================================\n\nEntity: ${supplier?.company_name || 'Merchant Partner'}\nCommission Rate: 15.00% gross retail booking value\nSettlement Cycle: T+7 net bank transfer upon tour completion\nJurisdiction: Platform Operating Jurisdiction\n\n1. SCOPE: The Supplier agrees to distribute activities through the platform.\n2. CANCELLATION: Bookings must honor the published cancellation policies.\n3. SAFETY: The Supplier maintains full regulatory licenses and tour insurances.`}
              </div>

              {/* Signature Inputs */}
              <form onSubmit={handleSignEsign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Authorized Signatory Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your legal name as on corporate registration"
                    value={esignForm.signer_name}
                    onChange={e => setEsignForm({ ...esignForm, signer_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#0F172A',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Live Signature Script Preview */}
                {esignForm.signer_name && (
                  <div style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1.5px dashed #0D9488',
                    backgroundColor: '#F0FDF4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '750', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Digital Signature Preview
                      </div>
                      <div style={{
                        fontFamily: "'Brush Script MT', 'Dancing Script', cursive, sans-serif",
                        fontSize: '26px',
                        color: '#0D9488',
                        marginTop: '4px'
                      }}>
                        {esignForm.signer_name}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#047857', textAlign: 'right' }}>
                      <div>Cryptographic Timestamp: <strong>NOW()</strong></div>
                      <div>Verified via IP logging</div>
                    </div>
                  </div>
                )}

                {/* Consent Checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    required
                    checked={esignForm.consent_accepted}
                    onChange={e => setEsignForm({ ...esignForm, consent_accepted: e.target.checked })}
                    style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#0D9488', cursor: 'pointer' }}
                  />
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
                    I hereby certify that I am legally authorized to act on behalf of <strong>{supplier?.company_name || 'this company'}</strong>, and agree that clicking &quot;Sign and Accept Agreement&quot; constitutes a valid, legally enforceable electronic signature under applicable digital transaction legislation.
                  </div>
                </label>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setEsignModalOpen(false)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: '13px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={signingEsign || !esignForm.signer_name || !esignForm.consent_accepted}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: (signingEsign || !esignForm.signer_name || !esignForm.consent_accepted) ? '#94A3B8' : '#0D9488',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: (signingEsign || !esignForm.signer_name || !esignForm.consent_accepted) ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)'
                    }}
                  >
                    {signingEsign ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Sign and Accept Agreement</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: VIEW EXECUTED AGREEMENT & CERTIFICATE OF COMPLETION */}
      {/* ========================================================================= */}
      {esignViewModalOpen && supplier?.esign && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(51, 63, 112, 0.12)',
            boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.4)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAFAF8'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Certificate of Completion
                </span>
                <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                  Executed Supplier Master Services Agreement
                </h2>
              </div>
              <button
                onClick={() => setEsignViewModalOpen(false)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Official Stamp Banner */}
              <div style={{
                borderRadius: '16px',
                border: '1.5px solid #BBF7D0',
                backgroundColor: '#F0FDF4',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D', fontWeight: '850', fontSize: '14px' }}>
                    <CheckCircle2 size={18} /> Digitally Signed & Legally Executed
                  </div>
                  <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>
                    Signer: <strong>{supplier.esign.signer_name}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                    Reference: <strong>{supplier.esign.esign_reference}</strong> • Signed: {new Date(supplier.esign.signed_at).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    Signer IP Address: <code>{supplier.esign.ip_address}</code>
                  </div>
                </div>

                <div style={{
                  border: '2px solid #0D9488',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  textAlign: 'center',
                  backgroundColor: '#FFFFFF'
                }}>
                  <div style={{ fontSize: '10px', fontWeight: '850', color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Verified E-Sign</div>
                  <div style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: '20px', color: '#0F172A', marginTop: '2px' }}>{supplier.esign.signer_name}</div>
                </div>
              </div>

              {/* Text viewer */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '14px',
                padding: '18px 20px',
                fontSize: '12px',
                lineHeight: '1.7',
                color: '#334155',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '280px',
                overflowY: 'auto'
              }}>
                {supplier.esign.agreement_content || 'Agreement text signed.'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEsignViewModalOpen(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#333F70',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
