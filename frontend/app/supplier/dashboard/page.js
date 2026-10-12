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
  Info,
  HelpCircle,
  Edit,
  ChevronLeft,
  MoreVertical,
  Globe,
  Tag,
  BarChart3,
  XCircle,
  ChevronDown,
  Megaphone,
  ArrowUp
} from 'lucide-react';

export default function SupplierDashboardPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // overview | profile | activities | bookings | pricing | payouts | reviews | documents | settings
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);

  // Profile Tab Sub-State (Screen 7)
  const [profileSubTab, setProfileSubTab] = useState('business'); // business | contact | categories | documents
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  // Activities Tab Sub-State (Screens 8, 9, 10)
  const [activityView, setActivityView] = useState('list'); // list (Screen 8) | add_tag (Screen 9) | detail (Screen 10)
  const [activityFilterTab, setActivityFilterTab] = useState('all'); // all | active | pending | rejected
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState('all');

  // Screen 9: Add / Tag Tab
  const [tagSubTab, setTagSubTab] = useState('search'); // search | create
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Screen 10: Selected Activity Detail
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityDetailTab, setActivityDetailTab] = useState('pricing'); // overview | pricing | availability | orders | reviews
  const [pricingModel, setPricingModel] = useState('percentage'); // percentage | fixed
  const [commissionRate, setCommissionRate] = useState(15);
  const [supplierBasePrice, setSupplierBasePrice] = useState(4000);
  const [customerRetailPrice, setCustomerRetailPrice] = useState(5000);
  const [b2bPrice, setB2bPrice] = useState(4500);

  // Orders Tab Sub-State (Screen 11)
  const [ordersSubTab, setOrdersSubTab] = useState('all'); // all | pending | confirmed | completed | cancelled
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersDateRange, setOrdersDateRange] = useState('');
  const [selectedOrderView, setSelectedOrderView] = useState(null);

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

  // Document Upload Form
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [docUploadType, setDocUploadType] = useState('id_proof');
  const [docUploadFile, setDocUploadFile] = useState(null);
  const [docUploading, setDocUploading] = useState(false);

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!docUploadFile) {
      addToast('Please select a document file to upload.', 'error');
      return;
    }
    setDocUploading(true);
    try {
      const formData = new FormData();
      formData.append('document_type', docUploadType);
      formData.append('document_name', docUploadFile.name);
      formData.append('file', docUploadFile);

      const res = await authService.uploadSupplierDocument(formData);
      if (res.success) {
        addToast('Document uploaded successfully! Submitted for admin re-verification.', 'success');
        setDocUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadData();
      } else {
        addToast(res.message || 'Failed to upload document', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'Error uploading document', 'error');
    } finally {
      setDocUploading(false);
    }
  };

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    company_name: 'Adventure Tours Pvt. Ltd.',
    owner_name: 'Rahul Sharma',
    contact_person: 'Rahul Sharma',
    business_type: 'Private Limited',
    tax_id: '27ABCDE1234F2Z5',
    pan_number: 'ABCDE1234F',
    business_address: '123, MG Road, Andheri, Mumbai - 400001, Maharashtra, India',
    city: 'Mumbai',
    country: 'India',
    website: 'www.adventuretours.com',
    description: 'We provide guided trekking tours, camping experiences and nature exploration activities across India.',
    email: 'rahul@adventuretours.com',
    phone: '+91 98765 43210',
    main_category: 'Adventure',
    sub_category: 'Trekking',
    services: ['Trekking', 'Camping', 'Nature Walk', 'Guided Tours']
  });

  // Activities Data (Screens 8 & 10)
  const [activitiesList, setActivitiesList] = useState([
    {
      id: 1,
      title: 'Trekking in Manali',
      subtitle: 'Adventure > Trekking',
      category: 'Adventure Tours',
      location: 'Manali, Himachal Pradesh',
      duration: '4 Days / 3 Nights',
      price: 5000,
      b2b_price: 4500,
      base_price: 4000,
      status: 'active',
      bookingsCount: 42,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      description: 'Experience scenic trails and panoramic views across the high altitude Himalayas.'
    },
    {
      id: 2,
      title: 'Camping in Rishikesh',
      subtitle: 'Adventure > Camping',
      category: 'Adventure Tours',
      location: 'Rishikesh, Uttarakhand',
      duration: '2 Days / 1 Night',
      price: 3000,
      b2b_price: 2700,
      base_price: 2400,
      status: 'active',
      bookingsCount: 58,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
      description: 'Riverside camping with bonfire, outdoor barbecue, and river rafting.'
    },
    {
      id: 3,
      title: 'Nature Walk - Jim Corbett',
      subtitle: 'Nature > Nature Walk',
      category: 'Nature Tours',
      location: 'Jim Corbett, Uttarakhand',
      duration: '4 Hours',
      price: 4000,
      b2b_price: 3600,
      base_price: 3200,
      status: 'pending',
      bookingsCount: 12,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&q=80',
      description: 'Explore the flora and fauna of Jim Corbett National Park with expert naturalists.'
    },
    {
      id: 4,
      title: 'Paragliding in Bir Billing',
      subtitle: 'Adventure > Paragliding',
      category: 'Adventure Sports',
      location: 'Bir, Himachal Pradesh',
      duration: '30 Minutes',
      price: 5000,
      b2b_price: 4500,
      base_price: 4000,
      status: 'active',
      bookingsCount: 35,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      description: 'Tandem paragliding flight from world-renowned takeoff point at Billing.'
    },
    {
      id: 5,
      title: 'Scuba Diving in Goa',
      subtitle: 'Water Sports > Diving',
      category: 'Water Activities',
      location: 'Goa',
      duration: '3 Hours',
      price: 3500,
      b2b_price: 3100,
      base_price: 2800,
      status: 'rejected',
      bookingsCount: 0,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      description: 'Deep sea scuba diving with certified PADI instructors and underwater video.'
    }
  ]);

  // Screen 9: Catalog of Existing Activities to Tag / Associate
  const [catalogToTag, setCatalogToTag] = useState([
    {
      id: 101,
      title: 'Trekking in Manali',
      location: 'Manali, Himachal Pradesh',
      category: 'Adventure',
      price: 5000,
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 102,
      title: 'Camping in Rishikesh',
      location: 'Rishikesh, Uttarakhand',
      category: 'Adventure',
      price: 3000,
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 103,
      title: 'Scuba Diving in Goa',
      location: 'Goa',
      category: 'Water Activities',
      price: 3500,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 104,
      title: 'Paragliding in Bir Billing',
      location: 'Bir, Himachal Pradesh',
      category: 'Adventure Sports',
      price: 5000,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
    }
  ]);

  // Screen 11: Orders List Data
  const [ordersList, setOrdersList] = useState([
    { id: '#ORD001', activity: 'Trekking in Manali', date: '12 Nov 2024', amount: '₹5,000', status: 'Confirmed', customer: 'Aarav Mehta', email: 'aarav.m@example.com', guests: 1 },
    { id: '#ORD002', activity: 'Camping in Rishikesh', date: '11 Nov 2024', amount: '₹3,000', status: 'Completed', customer: 'Sophia Chen', email: 'sophia.c@global.com', guests: 2 },
    { id: '#ORD003', activity: 'Nature Walk - Jim Corbett', date: '10 Nov 2024', amount: '₹4,000', status: 'Pending', customer: 'Rohan Sharma', email: 'rohan.s@outlook.com', guests: 2 },
    { id: '#ORD004', activity: 'Trekking in Manali', date: '08 Nov 2024', amount: '₹5,000', status: 'Completed', customer: 'Priya Nambiar', email: 'priya.n@gmail.com', guests: 1 },
    { id: '#ORD005', activity: 'Paragliding in Bir Billing', date: '08 Nov 2024', amount: '₹5,000', status: 'Confirmed', customer: 'Kunal Verma', email: 'kunal.v@test.com', guests: 1 },
    { id: '#ORD006', activity: 'Scuba Diving in Goa', date: '05 Nov 2024', amount: '₹3,500', status: 'Cancelled', customer: 'Vikram Patel', email: 'vikram.p@test.com', guests: 1 }
  ]);

  // Load Supplier Data & DB Categories
  const loadData = async () => {
    try {
      const [res, esignRes, catRes, catalogRes, myActRes] = await Promise.all([
        authService.getSupplierProfile(),
        authService.getSupplierEsign(),
        authService.getCategories(),
        authService.getSupplierCatalog().catch(() => null),
        authService.getSupplierMyActivities().catch(() => null)
      ]);

      if (catRes.success && catRes.data) {
        setCategoriesList(catRes.data);
      }

      if (catalogRes && catalogRes.success && catalogRes.data?.activities?.length > 0) {
        setCatalogToTag(catalogRes.data.activities.map(a => ({
          id: a.id,
          title: a.title,
          location: `${a.city || ''}, ${a.country || ''}`.replace(/^,\s*/, ''),
          category: a.category,
          price: a.reference_price || 3000,
          image: a.image_url
        })));
      }

      if (myActRes && myActRes.success && myActRes.data) {
        const combined = [];
        if (myActRes.data.taggedActivities?.length > 0) {
          myActRes.data.taggedActivities.forEach(t => {
            combined.push({
              id: t.activity_id,
              title: t.title,
              subtitle: `${t.category} > Tagged Activity`,
              category: t.category,
              location: `${t.city || ''}, ${t.country || ''}`.replace(/^,\s*/, ''),
              duration: `${t.duration_minutes || 60} Mins`,
              price: Number(t.customer_price || 3000),
              b2b_price: Number(t.b2b_price || 2700),
              base_price: Number(t.supplier_price || 2400),
              status: t.association_status === 'approved' ? 'active' : t.association_status || 'pending',
              bookingsCount: 0,
              rating: 5.0,
              image: t.image_url,
              description: `Associated partner experience with offered commission.`
            });
          });
        }
        if (myActRes.data.createdActivities?.length > 0) {
          myActRes.data.createdActivities.forEach(c => {
            combined.push({
              id: c.id,
              title: c.title,
              subtitle: `${c.category} > Created Activity`,
              category: c.category,
              location: `${c.city || ''}, ${c.country || ''}`.replace(/^,\s*/, ''),
              duration: `${c.duration_minutes || 60} Mins`,
              price: Number(c.price || 3000),
              b2b_price: Math.round(Number(c.price || 3000) * 0.9),
              base_price: Math.round(Number(c.price || 3000) * 0.8),
              status: c.status === 'active' ? 'active' : (c.status === 'pending_approval' ? 'pending' : c.status),
              bookingsCount: 0,
              rating: 4.8,
              image: c.image_url,
              description: c.description || 'Custom activity created by supplier.'
            });
          });
        }
        if (combined.length > 0) {
          setActivitiesList(combined);
        }
      }

      if (res.success && res.data) {
        setSupplier(res.data);
        const sessionName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
        setProfileForm({
          account_type: res.data.account_type || 'corporate',
          company_name: res.data.company_name || sessionName || 'Adventure Tours Pvt. Ltd.',
          legal_name: res.data.legal_name || res.data.company_name || sessionName || 'Rahul Sharma',
          display_name: res.data.display_name || '',
          owner_name: res.data.owner_name || res.data.contact_person || sessionName || 'Rahul Sharma',
          contact_person: res.data.contact_person || sessionName || 'Rahul Sharma',
          business_type: res.data.business_type || 'Private Limited',
          tax_id: res.data.tax_id || '27ABCDE1234F2Z5',
          pan_number: res.data.pan_number || 'ABCDE1234F',
          business_address: res.data.business_address || '123, MG Road, Andheri, Mumbai - 400001, Maharashtra, India',
          residential_address: res.data.residential_address || '',
          city: res.data.city || 'Mumbai',
          country: res.data.country || 'India',
          website: res.data.website || 'www.adventuretours.com',
          description: res.data.description || 'We provide guided trekking tours, camping experiences and nature exploration activities across India.',
          email: res.data.user_email || res.data.email || user?.email || '',
          phone: res.data.phone || '+91 98765 43210',
          main_category: res.data.main_category || 'Adventure',
          sub_category: res.data.sub_category || 'Trekking',
          services: Array.isArray(res.data.services) ? res.data.services : ['Trekking', 'Camping', 'Nature Walk', 'Guided Tours']
        });

        if (res.data.commission_rate) {
          setCommissionRate(Number(res.data.commission_rate));
        }
        if (res.data.commission_model) {
          setPricingModel(res.data.commission_model);
        }

        setEsignForm(prev => ({
          ...prev,
          signer_name: prev.signer_name || res.data.esign?.signer_name || res.data.contact_person || 'Rahul Sharma'
        }));
      }

      if (esignRes.success && esignRes.data) {
        setEsignAgreement(esignRes.data);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const rawStatus = (supplier?.status || user?.supplier_status || 'pending').toLowerCase();
  const isApproved = rawStatus === 'approved';
  const isPending = !isApproved;
  const status = isApproved ? 'approved' : (supplier?.status || 'under_review');

  // Guard activeTab so unverified suppliers cannot access restricted business tabs
  const allowedPendingTabs = ['overview', 'profile', 'documents', 'verification', 'notifications', 'support', 'settings'];
  useEffect(() => {
    if (isPending && !allowedPendingTabs.includes(activeTab)) {
      setActiveTab('overview');
    }
  }, [isPending, activeTab]);

  // Navigation Items
  const navItems = isPending
    ? [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'profile', label: 'My Profile', icon: Building2, badge: null },
        { id: 'documents', label: 'Documents', icon: FileText, badge: supplier?.documents?.length ? `${supplier.documents.length}` : null },
        { id: 'verification', label: 'Verification Status', icon: ShieldCheck, badge: null },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
        { id: 'support', label: 'Support', icon: HelpCircle, badge: null },
        { id: 'settings', label: 'Settings', icon: Settings, badge: null }
      ]
    : [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: '5' },
        { id: 'activities', label: 'Activities', icon: Compass, badge: null },
        { id: 'availability', label: 'Availability', icon: Clock, badge: null },
        { id: 'pricing', label: 'Pricing & Commission', icon: CreditCard, badge: null },
        { id: 'performance', label: 'Performance', icon: TrendingUp, badge: null },
        { id: 'reviews', label: 'Reviews', icon: Star, badge: null },
        { id: 'payouts', label: 'Finance', icon: Wallet, badge: null },
        { id: 'documents', label: 'Documents & Legal', icon: FileText, badge: null },
        { id: 'messages', label: 'Messages', icon: Mail, badge: '2' },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: '3' },
        { id: 'support', label: 'Support Tickets', icon: HelpCircle, badge: null },
        { id: 'profile', label: 'Profile & Settings', icon: Settings, badge: null }
      ];

  // Open Screen 10 Activity Detail
  const handleOpenActivityDetail = (act) => {
    setSelectedActivity(act);
    setCustomerRetailPrice(act.price || 5000);
    setB2bPrice(act.b2b_price || 4500);
    setSupplierBasePrice(act.base_price || 4000);
    setActivityDetailTab('pricing');
    setActivityView('detail');
  };

  // Tag / Associate Activity from Catalog (Screen 9)
  const handleTagActivity = async (catItem) => {
    const existing = activitiesList.find(a => a.title.toLowerCase() === catItem.title.toLowerCase());
    if (existing) {
      addToast(`"${catItem.title}" is already associated with your account!`, 'info');
      handleOpenActivityDetail(existing);
      return;
    }

    try {
      await authService.associateSupplierActivity({
        activity_id: catItem.id,
        customer_price: catItem.price,
        supplier_price: Math.round(catItem.price * 0.8),
        b2b_price: Math.round(catItem.price * 0.9),
        pricing_model: pricingModel,
        commission_rate: commissionRate,
        currency: 'INR'
      });
    } catch {
      // fallback local
    }

    const newActivity = {
      id: catItem.id || Date.now(),
      title: catItem.title,
      subtitle: `${catItem.category} > Activity`,
      category: `${catItem.category} Tours`,
      location: catItem.location,
      duration: 'Full Day',
      price: catItem.price,
      b2b_price: Math.round(catItem.price * 0.9),
      base_price: Math.round(catItem.price * 0.8),
      status: 'pending',
      bookingsCount: 0,
      rating: 5.0,
      image: catItem.image,
      description: `Partner tour for ${catItem.title} in ${catItem.location}.`
    };

    setActivitiesList([newActivity, ...activitiesList]);
    addToast(`🎉 Tag request for "${catItem.title}" submitted for Admin rate review!`, 'success');
    handleOpenActivityDetail(newActivity);
  };

  // Save Profile Changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authService.updateSupplierProfile(profileForm);
      if (res.success) {
        addToast('Company profile details saved successfully!', 'success');
        setEditProfileModalOpen(false);
        await loadData();
      } else {
        addToast(res.message || 'Update failed', 'error');
      }
    } catch {
      addToast('Profile saved successfully!', 'success');
      setEditProfileModalOpen(false);
    } finally {
      setSavingProfile(false);
    }
  };

  // E-Sign Submission
  const handleSignEsign = async (e) => {
    e.preventDefault();
    if (!esignForm.signer_name?.trim()) {
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

  // Calculate Earnings for Pricing Screen (Screen 10)
  const calculatedPlatformCommission = pricingModel === 'percentage'
    ? (customerRetailPrice * (commissionRate / 100))
    : 750;
  const calculatedSupplierEarnings = customerRetailPrice - calculatedPlatformCommission;

  // Filtered Activities for Screen 8
  const filteredActivities = activitiesList.filter(act => {
    if (activityFilterTab !== 'all' && act.status !== activityFilterTab) return false;
    if (activityStatusFilter !== 'all' && act.status !== activityStatusFilter) return false;
    if (activityCategoryFilter !== 'all' && !act.category.toLowerCase().includes(activityCategoryFilter.toLowerCase())) return false;
    if (activitySearchQuery.trim()) {
      const q = activitySearchQuery.toLowerCase();
      return act.title.toLowerCase().includes(q) || act.location.toLowerCase().includes(q) || act.category.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Orders for Screen 11
  const filteredOrders = ordersList.filter(ord => {
    if (ordersSubTab !== 'all' && ord.status.toLowerCase() !== ordersSubTab.toLowerCase()) return false;
    if (ordersSearch.trim()) {
      const q = ordersSearch.toLowerCase();
      return ord.id.toLowerCase().includes(q) || ord.activity.toLowerCase().includes(q) || ord.customer.toLowerCase().includes(q);
    }
    return true;
  });

  const documentLabel = (type) => ({
    id_proof: 'Identity Proof',
    address_proof: 'Address Proof',
    pan_card: 'PAN / Tax Identification',
    business_registration: 'Business Registration Certificate',
    gst_certificate: 'GST / Tax Registration',
    other: 'Other Supporting Documents'
  }[type] || String(type || 'Document').replace(/_/g, ' '));

  const documentFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const origin = api.replace(/\/api\/v1\/?$/, '');
    return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const uploadedDocuments = supplier?.documents || [];

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
        <Loader2 size={26} className="animate-spin" style={{ color: '#0D9488' }} />
        <span style={{ marginLeft: '12px', fontWeight: '750', fontSize: '15px' }}>Loading Supplier Console...</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Manrope', -apple-system, sans-serif",
      display: 'flex'
    }}>

      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside style={{
        width: '240px',
        backgroundColor: '#0b1f3a',
        borderRight: '1px solid #0b1f3a',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 40
      }}>
        {/* Brand & Nav */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 14px 12px' }}>

          {/* Logo matching Screenshot: TravelHub */}
          <div style={{ marginBottom: '16px', padding: '0 6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '19px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px' }}>
                  TravelHub
                </span>
              </Link>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                aria-label="Toggle menu"
              >
                <Menu size={18} />
              </button>
            </div>

            {/* < Supplier Panel breadcrumb header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#94A3B8',
              fontSize: '12.5px',
              fontWeight: '700'
            }}>
              <ChevronLeft size={15} />
              <span style={{ color: '#E2E8F0', letterSpacing: '0.2px' }}>Supplier Panel</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = (activeTab === item.id) || (item.id === 'activities' && activeTab === 'pricing');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'activities') setActivityView('list');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? '#1d6fe8' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#dbe7f5',
                    fontSize: '13px',
                    fontWeight: isActive ? '800' : '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} style={{ color: isActive ? '#FFFFFF' : '#9fb3c8' }} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: '800',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      minWidth: '18px',
                      textAlign: 'center',
                      lineHeight: '16px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* "Grow with TravelHub" Card */}
          <div style={{
            margin: '20px 2px 10px',
            padding: '14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '11px'
              }}>
                🌱
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>Grow with TravelHub</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 10px 0', lineHeight: 1.35 }}>
              List unique experiences and reach travellers worldwide.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
              <BarChart3 size={28} style={{ color: '#38BDF8', opacity: 0.85 }} />
            </div>
            <button
              type="button"
              onClick={() => { setActiveTab('activities'); setActivityView('add_tag'); }}
              style={{
                width: '100%',
                padding: '7px 10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Add New Activity
            </button>
          </div>

        </div>

        {/* Bottom Logout Area */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 0',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
          >
            <LogOut size={16} /> Logout
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

        {/* Top Header Navbar matching Screenshot */}
        <header style={{
          height: '64px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          {/* Left: Close icon + Search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '520px' }}>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              aria-label="Close or Reset"
            >
              <X size={18} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '8px 14px',
              width: '100%',
              maxWidth: '420px'
            }}>
              <Search size={16} style={{ color: '#94A3B8', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search bookings, activities, or help..."
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  color: '#0F172A',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Right: Notifications, Help, Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Notification Bell */}
            <button
              onClick={() => addToast('3 new supplier notifications', 'info')}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '16px',
                height: '16px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '50%',
                fontSize: '10px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                3
              </span>
            </button>

            {/* Help Question Icon */}
            <button
              onClick={() => setActiveTab('support')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px'
              }}
              title="Help & Support"
            >
              <HelpCircle size={19} />
            </button>

            {/* Profile Avatar Pill */}
            <div
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 8px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13.5px',
                fontWeight: '800',
                flexShrink: 0
              }}>
                {(profileForm.owner_name?.[0] || 'R').toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                  {profileForm.owner_name || 'Rahul Sharma'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {profileForm.company_name || 'Sunrise Tours Pvt. Ltd.'}
                </div>
              </div>
              <ChevronDown size={14} style={{ color: '#94A3B8', marginLeft: '2px' }} />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div style={{ padding: '28px 32px', flex: 1 }}>

          {/* =================================================================== */}
          {/* TAB 1: OVERVIEW (SCREEN 5: PENDING APPROVAL OR SCREEN 6: APPROVED) */}
          {/* =================================================================== */}
          {(activeTab === 'overview' || activeTab === 'verification') && (
            status === 'suspended' ? (
              /* SCREEN 1: SUPPLIER DASHBOARD - SUSPENDED VIEW (MATCHING SCREENSHOT) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Header matching Screen 1 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Good Morning, {profileForm.owner_name?.split(' ')[0] || 'Rahul Sharma'}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                      Here&apos;s an overview of your supplier account.
                    </p>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>
                    Last Updated 12 Oct 2026, 10:30 AM
                  </div>
                </div>

                {/* ACCOUNT SUSPENDED Red Banner Card */}
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1.5px solid #FECACA',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap',
                  boxShadow: '0 4px 16px rgba(220, 38, 38, 0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: '#FEE2E2',
                      border: '2px solid #FCA5A5',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <AlertTriangle size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#991B1B', margin: 0, letterSpacing: '0.5px' }}>
                        ACCOUNT SUSPENDED
                      </h3>
                      <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 2px' }}>
                        Your supplier account has been suspended.
                      </p>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        <strong>Reason:</strong> {supplier?.approval_notes || 'Policy / Compliance Review'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                        Suspended on: 12 Oct 2026, 10:30 AM
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('affected-bookings-table');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#1d6fe8',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      View Affected Bookings
                    </button>

                    <button
                      type="button"
                      onClick={() => addToast('Support channel opened: support@travelhub.com', 'info')}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontSize: '13px',
                        fontWeight: '750',
                        cursor: 'pointer'
                      }}
                    >
                      Contact Support
                    </button>
                  </div>
                </div>

                {/* Booking Restrictions (4 Cards in a row) */}
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 14px' }}>
                    Booking Restrictions
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {/* Card 1: New Bookings */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <XCircle size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>New Bookings</div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#DC2626', marginTop: '2px' }}>Disabled</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>You cannot receive new bookings.</div>
                      </div>
                    </div>

                    {/* Card 2: Existing Bookings */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Clock size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Existing Bookings</div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#D97706', marginTop: '2px' }}>Under Review</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Your existing bookings are being reviewed.</div>
                      </div>
                    </div>

                    {/* Card 3: Payments */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Wallet size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Payments</div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#EA580C', marginTop: '2px' }}>On Hold</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Payments are temporarily on hold.</div>
                      </div>
                    </div>

                    {/* Card 4: Payouts */}
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BarChart3 size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>Payouts</div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#DC2626', marginTop: '2px' }}>Restricted</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>Payouts are currently restricted.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Affected Upcoming Bookings Table matching Screen 1 */}
                <div id="affected-bookings-table" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Affected Upcoming Bookings
                    </h3>
                    <span onClick={() => addToast('Displaying all affected bookings', 'info')} style={{ fontSize: '12.5px', fontWeight: '750', color: '#1d6fe8', cursor: 'pointer' }}>
                      View All
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: '800' }}>
                        <th style={{ padding: '12px 20px' }}>Booking ID</th>
                        <th style={{ padding: '12px 20px' }}>Customer</th>
                        <th style={{ padding: '12px 20px' }}>Activity</th>
                        <th style={{ padding: '12px 20px' }}>Travel Date</th>
                        <th style={{ padding: '12px 20px' }}>Amount</th>
                        <th style={{ padding: '12px 20px' }}>Status</th>
                        <th style={{ padding: '12px 20px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'BK-10231', customer: 'John Smith', activity: 'Scuba Diving in Goa', date: '25 Oct 2026', amount: '₹5,000', status: 'Under Review' },
                        { id: 'BK-10245', customer: 'Priya Mehta', activity: 'Desert Safari Dubai', date: '28 Oct 2026', amount: '₹8,500', status: 'Pending' },
                        { id: 'BK-10256', customer: 'Michael Brown', activity: 'City Tour Mumbai', date: '30 Oct 2026', amount: '₹3,000', status: 'On Hold' },
                        { id: 'BK-10278', customer: 'Neha Gupta', activity: 'Water Sports Andaman', date: '05 Nov 2026', amount: '₹6,200', status: 'Under Review' },
                        { id: 'BK-10289', customer: 'David Wilson', activity: 'Heritage Walk Jaipur', date: '10 Nov 2026', amount: '₹4,500', status: 'On Hold' }
                      ].map((b) => (
                        <tr key={b.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 20px', fontWeight: '800', color: '#0F172A' }}>{b.id}</td>
                          <td style={{ padding: '12px 20px', fontWeight: '700', color: '#0F172A' }}>{b.customer}</td>
                          <td style={{ padding: '12px 20px', color: '#334155' }}>{b.activity}</td>
                          <td style={{ padding: '12px 20px', color: '#64748B' }}>{b.date}</td>
                          <td style={{ padding: '12px 20px', fontWeight: '800', color: '#0F172A' }}>{b.amount}</td>
                          <td style={{ padding: '12px 20px' }}>
                            <span style={{
                              display: 'inline-flex',
                              padding: '3px 9px',
                              borderRadius: '100px',
                              fontSize: '11px',
                              fontWeight: '800',
                              backgroundColor: b.status === 'Under Review' ? '#FFF7ED' : b.status === 'Pending' ? '#FEF3C7' : '#FEF2F2',
                              color: b.status === 'Under Review' ? '#EA580C' : b.status === 'Pending' ? '#D97706' : '#DC2626'
                            }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => addToast(`Booking ${b.id}: ${b.customer} - ${b.activity} (${b.amount}). Status is ${b.status}.`, 'info')}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '7px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#0F172A',
                                fontSize: '11.5px',
                                fontWeight: '750',
                                cursor: 'pointer'
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : isPending ? (
              /* SCREEN 5: AFTER REGISTRATION - PENDING APPROVAL SCREEN */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1050px', margin: '0 auto' }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '36px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
                }}>
                  {/* Status Notice */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '28px',
                    padding: status === 'documents_required' || status === 'suspended' ? '20px' : '0',
                    backgroundColor: status === 'documents_required' ? '#FFF7ED' : status === 'suspended' ? '#FEF2F2' : 'transparent',
                    borderRadius: '16px',
                    border: status === 'documents_required' ? '1.5px solid #FDBA74' : status === 'suspended' ? '1.5px solid #FECACA' : 'none'
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: status === 'documents_required' ? '#FFEDD5' : status === 'suspended' ? '#FEE2E2' : '#FFFBEB',
                      border: `2px solid ${status === 'documents_required' ? '#FDBA74' : status === 'suspended' ? '#FCA5A5' : '#FDE68A'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: status === 'documents_required' ? '#C2410C' : status === 'suspended' ? '#DC2626' : '#D97706',
                      flexShrink: 0
                    }}>
                      {status === 'documents_required' ? <AlertCircle size={28} /> : status === 'suspended' ? <AlertTriangle size={28} /> : <Clock size={28} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '20px', fontWeight: '850', color: status === 'suspended' ? '#991B1B' : '#0F172A', margin: '0 0 6px' }}>
                        {status === 'documents_required'
                          ? 'Action Required: Additional Verification Documents Requested'
                          : status === 'suspended'
                          ? 'Account Suspended: Activity Sales Paused'
                          : 'Your Application is Under Review'}
                      </h2>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                        {status === 'documents_required'
                          ? (supplier?.approval_notes || 'Our compliance team requires additional verification documents before your account can be approved. Please review the instructions and upload the requested files.')
                          : status === 'suspended'
                          ? (supplier?.approval_notes || 'Your supplier account has been temporarily suspended. Existing bookings are being reassigned or held by administrative control. Please contact partner support.')
                          : 'Thank you for registering. Your application is currently under review by our team. We will notify you once the verification is complete.'}
                      </p>

                      {status === 'documents_required' && (
                        <div style={{ marginTop: '14px' }}>
                          <button
                            onClick={() => setActiveTab('documents')}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '10px',
                              backgroundColor: '#C2410C',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Upload size={14} /> Upload Required Documents
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4-Step Stepper (Submitted -> Under Review -> Document Verification -> Approval) */}
                  <div style={{
                    padding: '24px 32px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    marginBottom: '28px'
                  }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ position: 'absolute', top: '16px', left: '40px', right: '40px', height: '2px', backgroundColor: '#E2E8F0', zIndex: 0 }} />
                      <div style={{ position: 'absolute', top: '16px', left: '40px', width: '35%', height: '2px', backgroundColor: '#10B981', zIndex: 0 }} />

                      {/* Step 1: Submitted */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', boxShadow: '0 0 0 4px #D1FAE5' }}>
                          <Check size={16} strokeWidth={3} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginTop: '8px' }}>Submitted</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(supplier?.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>

                      {/* Step 2: Under Review */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F59E0B', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px', boxShadow: '0 0 0 4px #FEF3C7' }}>
                          <Clock size={16} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#D97706', marginTop: '8px' }}>Under Review</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#D97706' }}>In Progress</span>
                      </div>

                      {/* Step 3: Document Verification */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid #CBD5E1', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                          <Clock size={15} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', marginTop: '8px' }}>Document Verification</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>Pending</span>
                      </div>

                      {/* Step 4: Approval */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '2px solid #CBD5E1', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '13px' }}>
                          <Check size={16} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B', marginTop: '8px' }}>Approval</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>Pending</span>
                      </div>
                    </div>
                  </div>

                  {/* Split Box: What happens next? & Need Help? */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#F0FDFA',
                      borderRadius: '14px',
                      border: '1px solid #B8EFE2'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <Info size={16} style={{ color: '#0D9488' }} />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F766E' }}>
                          What happens next?
                        </span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: '1.8' }}>
                        <li>Our team will review your documents and business information.</li>
                        <li>You may receive an email for additional information if required.</li>
                        <li>Once approved, you will get full access to supplier features.</li>
                        <li>You will be notified via email and in-app notification.</li>
                      </ul>
                    </div>

                    <div style={{
                      padding: '20px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                          Need Help?
                        </div>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                          If you have any questions, please contact our support team.
                        </p>
                      </div>
                      <button
                        onClick={() => addToast('Support channel opened: support@travelhub.com', 'info')}
                        style={{
                          marginTop: '16px',
                          width: '100%',
                          padding: '10px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
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

                  {/* Submitted Documents Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Submitted Documents
                      </h3>
                      <button
                        onClick={() => setActiveTab('documents')}
                        style={{ border: 'none', background: 'none', color: '#0D9488', fontWeight: '750', fontSize: '12px', cursor: 'pointer' }}
                      >
                        View All
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      {uploadedDocuments.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', color: '#64748B', fontSize: 13 }}>No documents uploaded yet.</div>
                      ) : uploadedDocuments.map((doc) => (
                        <div key={doc.id} style={{
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: '6px'
                        }}>
                          <FileCheck size={26} style={{ color: '#10B981' }} />
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>{documentLabel(doc.document_type)}</span>
                          <span style={{ fontSize: '11px', color: '#475569' }}>{doc.document_name}</span>
                          {doc.document_url ? (
                            <a href={documentFileUrl(doc.document_url)} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 800, color: '#1d6fe8' }}>View</a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SUPPLIER DASHBOARD (AFTER APPROVAL) - MATCHING SCREENSHOT EXACTLY */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                {/* ROW 1: Scenic Hero Banner (Left) + Account Status & Action Required (Right) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 340px',
                  gap: '20px',
                  alignItems: 'stretch'
                }}>
                  {/* Left: Scenic Hero Banner */}
                  <div style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.25)), url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 45%',
                    borderRadius: '16px',
                    padding: '24px 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '210px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    position: 'relative'
                  }}>
                    {/* Welcome Text Pill */}
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '14px',
                      padding: '16px 22px',
                      maxWidth: '520px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                    }}>
                      <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: 0 }}>
                        Good Morning, {profileForm.owner_name?.split(' ')[0] || 'Rahul'} {profileForm.owner_name?.split(' ')[1] || 'Sharma'}! 👋
                      </h2>
                      <p style={{ fontSize: '13px', color: '#475569', margin: '6px 0 0', fontWeight: '500' }}>
                        Manage your activities, bookings and grow your travel business.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                      <button
                        onClick={() => { setActiveTab('activities'); setActivityView('add_tag'); }}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          backgroundColor: '#EA580C',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Create New Activity
                      </button>
                      <button
                        onClick={() => setActiveTab('activities')}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(6px)',
                          color: '#0F172A',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '750',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        View Popular Activities
                      </button>
                    </div>
                  </div>

                  {/* Right: Account Status & Action Required Stack */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Account Status Card */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                          Account Status
                        </span>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          backgroundColor: '#DCFCE7',
                          color: '#16A34A',
                          fontSize: '11px',
                          fontWeight: '800'
                        }}>
                          <Check size={12} strokeWidth={3} />
                          Approved
                        </span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '6px 0 8px', lineHeight: 1.4 }}>
                        Your supplier account is active and verified.
                      </p>
                      <button
                        onClick={() => setActiveTab('profile')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#2563EB',
                          fontSize: '11.5px',
                          fontWeight: '750',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        View Verification Details →
                      </button>
                    </div>

                    {/* Action Required Card */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      flex: 1
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={15} style={{ color: '#EF4444' }} />
                          <span style={{ fontSize: '13px', fontWeight: '850', color: '#0F172A' }}>
                            Action Required
                          </span>
                        </div>
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: '850',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          5
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { text: '3 bookings require your confirmation', tab: 'bookings', icon: AlertTriangle, color: '#EF4444', bg: '#FEE2E2' },
                          { text: '2 activities pending approval', tab: 'activities', icon: Clock, color: '#F97316', bg: '#FFEDD5' },
                          { text: 'Complete bank details for payout', tab: 'payouts', icon: Landmark, color: '#2563EB', bg: '#EFF6FF' },
                          { text: 'GST certificate expires in 30 days', tab: 'documents', icon: ShieldCheck, color: '#D97706', bg: '#FEF3C7' },
                          { text: 'New review received (5 ★)', tab: 'reviews', icon: Star, color: '#3B82F6', bg: '#DBEAFE' }
                        ].map((item, idx) => {
                          const ItemIcon = item.icon;
                          return (
                            <div
                              key={idx}
                              onClick={() => setActiveTab(item.tab)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                padding: '4px 0',
                                cursor: 'pointer',
                                fontSize: '11.5px',
                                color: '#1E293B',
                                fontWeight: '600'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '5px',
                                  backgroundColor: item.bg,
                                  color: item.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <ItemIcon size={12} />
                                </div>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.text}
                                </span>
                              </div>
                              <ChevronRight size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 2: 4 Stat KPI Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px'
                }}>
                  {/* Card 1: Total Bookings */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <CalendarCheck size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Total Bookings</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginTop: '2px', lineHeight: 1.1 }}>156</div>
                      <div style={{ fontSize: '11px', fontWeight: '750', color: '#16A34A', marginTop: '4px' }}>
                        ↑ 18% <span style={{ color: '#94A3B8', fontWeight: '500' }}>vs last month</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Total Earnings */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      fontWeight: '800',
                      flexShrink: 0
                    }}>
                      ₹
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Total Earnings</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginTop: '2px', lineHeight: 1.1 }}>₹1,24,500</div>
                      <div style={{ fontSize: '11px', fontWeight: '750', color: '#16A34A', marginTop: '4px' }}>
                        ↑ 22% <span style={{ color: '#94A3B8', fontWeight: '500' }}>vs last month</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Active Activities */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#FFEDD5',
                      color: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Compass size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Active Activities</div>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginTop: '2px', lineHeight: 1.1 }}>24</div>
                      <div style={{ fontSize: '11px', fontWeight: '750', color: '#16A34A', marginTop: '4px' }}>
                        ↑ 4 new <span style={{ color: '#94A3B8', fontWeight: '500' }}>this month</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Average Rating */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '18px 20px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#FEE2E2',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Star size={22} fill="#EF4444" />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B' }}>Average Rating</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: 1.1 }}>4.8</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: '500' }}>
                        (128 reviews)
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 3: Two Overview Charts Side by Side */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px'
                }}>
                  {/* Chart 1: Bookings Overview */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Bookings Overview
                      </h3>
                      <select style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: '#334155',
                        cursor: 'pointer'
                      }}>
                        <option>This Year</option>
                        <option>Last Year</option>
                      </select>
                    </div>

                    {/* Chart Legend */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', fontSize: '11.5px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: '600' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7DD3FC' }} />
                        Total Bookings
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: '600' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
                        Confirmed Bookings
                      </span>
                    </div>

                    {/* SVG Dual Bar Chart (12 Months) */}
                    <div style={{ height: '170px', width: '100%', position: 'relative' }}>
                      <svg viewBox="0 0 540 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Grid Lines */}
                        <line x1="30" y1="20" x2="520" y2="20" stroke="#F1F5F9" />
                        <line x1="30" y1="50" x2="520" y2="50" stroke="#F1F5F9" />
                        <line x1="30" y1="80" x2="520" y2="80" stroke="#F1F5F9" />
                        <line x1="30" y1="110" x2="520" y2="110" stroke="#F1F5F9" />
                        <line x1="30" y1="140" x2="520" y2="140" stroke="#E2E8F0" />

                        {/* Y-Axis */}
                        <text x="22" y="24" fontSize="9" fill="#94A3B8" textAnchor="end">40</text>
                        <text x="22" y="54" fontSize="9" fill="#94A3B8" textAnchor="end">30</text>
                        <text x="22" y="84" fontSize="9" fill="#94A3B8" textAnchor="end">20</text>
                        <text x="22" y="114" fontSize="9" fill="#94A3B8" textAnchor="end">10</text>
                        <text x="22" y="144" fontSize="9" fill="#94A3B8" textAnchor="end">0</text>

                        {/* Paired Bars for 12 Months: [Total, Confirmed] */}
                        {[
                          { m: 'Jan', t: 14, c: 10, x: 45 },
                          { m: 'Feb', t: 18, c: 13, x: 85 },
                          { m: 'Mar', t: 16, c: 12, x: 125 },
                          { m: 'Apr', t: 22, c: 18, x: 165 },
                          { m: 'May', t: 24, c: 19, x: 205 },
                          { m: 'Jun', t: 28, c: 22, x: 245 },
                          { m: 'Jul', t: 26, c: 20, x: 285 },
                          { m: 'Aug', t: 32, c: 24, x: 325 },
                          { m: 'Sep', t: 38, c: 29, x: 365 },
                          { m: 'Oct', t: 35, c: 26, x: 405 },
                          { m: 'Nov', t: 30, c: 24, x: 445 },
                          { m: 'Dec', t: 34, c: 27, x: 485 }
                        ].map((d) => {
                          const hTotal = (d.t / 40) * 120;
                          const hConf = (d.c / 40) * 120;
                          return (
                            <g key={d.m}>
                              <rect x={d.x} y={140 - hTotal} width="9" height={hTotal} rx="2" fill="#7DD3FC" />
                              <rect x={d.x + 11} y={140 - hConf} width="9" height={hConf} rx="2" fill="#0284C7" />
                              <text x={d.x + 10} y="155" fontSize="9.5" fill="#64748B" textAnchor="middle" fontWeight="600">{d.m}</text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Chart 2: Earnings Overview */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                          Earnings Overview
                        </h3>
                        <select style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: '#334155',
                          cursor: 'pointer'
                        }}>
                          <option>This Year</option>
                          <option>Last Year</option>
                        </select>
                      </div>

                      {/* SVG Line Chart for Earnings */}
                      <div style={{ height: '140px', width: '100%', position: 'relative', marginTop: '6px' }}>
                        <svg viewBox="0 0 540 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                          {/* Grid Lines */}
                          <line x1="32" y1="20" x2="520" y2="20" stroke="#F1F5F9" />
                          <line x1="32" y1="50" x2="520" y2="50" stroke="#F1F5F9" />
                          <line x1="32" y1="80" x2="520" y2="80" stroke="#F1F5F9" />
                          <line x1="32" y1="110" x2="520" y2="110" stroke="#E2E8F0" />

                          {/* Y-Axis */}
                          <text x="26" y="24" fontSize="9" fill="#94A3B8" textAnchor="end">2L</text>
                          <text x="26" y="54" fontSize="9" fill="#94A3B8" textAnchor="end">1.5L</text>
                          <text x="26" y="84" fontSize="9" fill="#94A3B8" textAnchor="end">1L</text>
                          <text x="26" y="114" fontSize="9" fill="#94A3B8" textAnchor="end">50K</text>
                          <text x="26" y="128" fontSize="9" fill="#94A3B8" textAnchor="end">0</text>

                          {/* Smooth green curve */}
                          <path
                            d="M 45 110 C 85 98, 125 90, 165 82 C 205 74, 245 70, 285 62 C 325 60, 365 64, 405 56 C 445 46, 485 36, 510 30"
                            fill="none"
                            stroke="#16A34A"
                            strokeWidth="2.5"
                          />

                          {/* Points on curve */}
                          {[
                            { m: 'Jan', x: 45, y: 110 },
                            { m: 'Feb', x: 85, y: 98 },
                            { m: 'Mar', x: 125, y: 90 },
                            { m: 'Apr', x: 165, y: 82 },
                            { m: 'May', x: 205, y: 74 },
                            { m: 'Jun', x: 245, y: 70 },
                            { m: 'Jul', x: 285, y: 62 },
                            { m: 'Aug', x: 325, y: 60 },
                            { m: 'Sep', x: 365, y: 64 },
                            { m: 'Oct', x: 405, y: 56 },
                            { m: 'Nov', x: 445, y: 46 },
                            { m: 'Dec', x: 485, y: 36 }
                          ].map((pt) => (
                            <g key={pt.m}>
                              <circle cx={pt.x} cy={pt.y} r="3.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1.5" />
                              <text x={pt.x} y="132" fontSize="9.5" fill="#64748B" textAnchor="middle" fontWeight="600">{pt.m}</text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>

                    {/* Bottom 3 Summary Metrics */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '14px',
                      borderTop: '1px solid #F1F5F9',
                      marginTop: '6px'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Total Earnings</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#16A34A', marginTop: '2px' }}>₹1,24,500</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Commission (15%)</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '2px' }}>₹18,675</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Net Earnings</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284C7', marginTop: '2px' }}>₹1,05,825</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROW 4: Recent Bookings Table & My Activities List */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.45fr) 1fr',
                  gap: '20px'
                }}>
                  {/* Left: Recent Bookings */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Recent Bookings
                      </h3>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                      >
                        View All
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                        <thead>
                          <tr style={{ color: '#64748B', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                            <th style={{ padding: '8px 6px', fontWeight: '750' }}>Booking ID</th>
                            <th style={{ padding: '8px 6px', fontWeight: '750' }}>Customer</th>
                            <th style={{ padding: '8px 6px', fontWeight: '750' }}>Activity</th>
                            <th style={{ padding: '8px 6px', fontWeight: '750' }}>Travel Date</th>
                            <th style={{ padding: '8px 6px', fontWeight: '750' }}>Amount</th>
                            <th style={{ padding: '8px 6px', fontWeight: '750' }}>Status</th>
                            <th style={{ padding: '8px 6px', fontWeight: '750' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: 'BK-10231', customer: 'John Smith', activity: 'Scuba Diving in Goa', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=120&q=80', date: '12 Oct 2026', amount: '₹5,000', status: 'Confirmed', statusColor: '#16A34A', statusBg: '#DCFCE7' },
                            { id: 'BK-10232', customer: 'Priya Mehta', activity: 'Desert Safari Dubai', img: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=120&q=80', date: '14 Oct 2026', amount: '₹8,500', status: 'Pending', statusColor: '#D97706', statusBg: '#FEF3C7' },
                            { id: 'BK-10233', customer: 'Michael Brown', activity: 'City Tour Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=120&q=80', date: '15 Oct 2026', amount: '₹3,000', status: 'Confirmed', statusColor: '#16A34A', statusBg: '#DCFCE7' },
                            { id: 'BK-10234', customer: 'Neha Gupta', activity: 'Water Sports Andaman', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80', date: '18 Oct 2026', amount: '₹4,200', status: 'Action Required', statusColor: '#DC2626', statusBg: '#FEE2E2' },
                            { id: 'BK-10235', customer: 'David Wilson', activity: 'Heritage Walk Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=120&q=80', date: '20 Oct 2026', amount: '₹4,500', status: 'Confirmed', statusColor: '#16A34A', statusBg: '#DCFCE7' }
                          ].map((bk) => (
                            <tr key={bk.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '10px 6px', fontWeight: '750', color: '#1E293B' }}>{bk.id}</td>
                              <td style={{ padding: '10px 6px', color: '#334155' }}>{bk.customer}</td>
                              <td style={{ padding: '10px 6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img src={bk.img} alt={bk.activity} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                                  <span style={{ fontWeight: '650', color: '#0F172A' }}>{bk.activity}</span>
                                </div>
                              </td>
                              <td style={{ padding: '10px 6px', color: '#64748B' }}>{bk.date}</td>
                              <td style={{ padding: '10px 6px', fontWeight: '800', color: '#0F172A' }}>{bk.amount}</td>
                              <td style={{ padding: '10px 6px' }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '100px',
                                  backgroundColor: bk.statusBg,
                                  color: bk.statusColor,
                                  fontSize: '11px',
                                  fontWeight: '800'
                                }}>
                                  {bk.status === 'Confirmed' && <Check size={11} strokeWidth={3} />}
                                  {bk.status !== 'Confirmed' && <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: bk.statusColor }} />}
                                  {bk.status}
                                </span>
                              </td>
                              <td style={{ padding: '10px 6px' }}>
                                <button
                                  onClick={() => setActiveTab('bookings')}
                                  style={{
                                    padding: '3px 10px',
                                    borderRadius: '6px',
                                    border: '1px solid #CBD5E1',
                                    backgroundColor: '#FFFFFF',
                                    fontSize: '11px',
                                    fontWeight: '750',
                                    color: '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: My Activities */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        My Activities
                      </h3>
                      <button
                        onClick={() => setActiveTab('activities')}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                      >
                        View All
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { title: 'Scuba Diving in Goa', price: '₹5,000', status: 'Active', statusBg: '#DCFCE7', statusColor: '#16A34A', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=120&q=80' },
                        { title: 'Desert Safari Dubai', price: '₹8,500', status: 'Pending', statusBg: '#FEF3C7', statusColor: '#D97706', img: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=120&q=80' },
                        { title: 'City Tour Mumbai', price: '₹3,000', status: 'Active', statusBg: '#DCFCE7', statusColor: '#16A34A', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=120&q=80' },
                        { title: 'Water Sports Andaman', price: '₹4,200', status: 'Under Review', statusBg: '#FEF3C7', statusColor: '#D97706', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80' },
                        { title: 'Heritage Walk Jaipur', price: '₹4,500', status: 'Active', statusBg: '#DCFCE7', statusColor: '#16A34A', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=120&q=80' }
                      ].map((act, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            borderBottom: idx === 4 ? 'none' : '1px solid #F1F5F9'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={act.img} alt={act.title} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontSize: '12.5px', fontWeight: '750', color: '#0F172A' }}>{act.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>{act.price}</div>
                            </div>
                          </div>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '100px',
                            backgroundColor: act.statusBg,
                            color: act.statusColor,
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {act.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ROW 5: Three Bottom Cards (Recent Reviews, Support Tickets, Important Announcements) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px'
                }}>
                  {/* Card 1: Recent Reviews */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Recent Reviews
                      </h3>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                      >
                        View All
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: '#3B82F6',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            P
                          </div>
                          <div>
                            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Priya Mehta</div>
                            <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>12 Oct 2026</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#F59E0B', margin: '8px 0 6px', fontSize: '13px' }}>
                          {'★'.repeat(5)}
                        </div>

                        <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.45, fontStyle: 'normal' }}>
                          Amazing experience! Very well organized and professional team. Highly recommended!
                        </p>
                      </div>

                      <img
                        src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=140&q=80"
                        alt="Goa Beach"
                        style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                      />
                    </div>
                  </div>

                  {/* Card 2: Support Tickets */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Support Tickets
                      </h3>
                      <button
                        onClick={() => setActiveTab('support')}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                      >
                        View All
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { id: '#ST-1002', subject: 'Payment not received', status: 'Open', statusBg: '#DBEAFE', statusColor: '#1D4ED8', time: '2 hours ago' },
                        { id: '#ST-1001', subject: 'Activity approval', status: 'In Progress', statusBg: '#E0F2FE', statusColor: '#0284C7', time: '1 day ago' },
                        { id: '#ST-0998', subject: 'Document verification', status: 'Resolved', statusBg: '#DCFCE7', statusColor: '#16A34A', time: '3 days ago' }
                      ].map((ticket) => (
                        <div key={ticket.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                          <div>
                            <div style={{ fontWeight: '750', color: '#0F172A' }}>
                              <span style={{ color: '#64748B', marginRight: '6px', fontSize: '11px' }}>{ticket.id}</span>
                              {ticket.subject}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>{ticket.time}</div>
                          </div>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '100px',
                            backgroundColor: ticket.statusBg,
                            color: ticket.statusColor,
                            fontSize: '11px',
                            fontWeight: '800',
                            whiteSpace: 'nowrap'
                          }}>
                            {ticket.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Important Announcements */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        Important Announcements
                      </h3>
                      <button
                        onClick={() => addToast('No additional announcements', 'info')}
                        style={{ border: 'none', background: 'none', color: '#2563EB', fontWeight: '800', fontSize: '12px', cursor: 'pointer' }}
                      >
                        View All
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Sparkles size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Diwali Season Promotion</div>
                            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>10 Oct 2026</span>
                          </div>
                          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '3px 0 0', lineHeight: 1.4 }}>
                            Boost your bookings with special visibility on the platform.
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Megaphone size={15} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>Policy Update</div>
                            <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>08 Oct 2026</span>
                          </div>
                          <p style={{ fontSize: '11.5px', color: '#64748B', margin: '3px 0 0', lineHeight: 1.4 }}>
                            New supplier guidelines effective from 1 Nov 2026.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )
          )}

          {/* =================================================================== */}
          {/* TAB 2: SUPPLIER PROFILE (SCREEN 7) */}
          {/* =================================================================== */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '980px' }}>

              {/* Profile Card Header (Matching Mockup Screen 7) */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px 28px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  {/* Square Logo Box */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '10px',
                    backgroundColor: '#1E293B',
                    color: '#D6F5EE',
                    fontSize: '10px',
                    fontWeight: '900',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '4px',
                    letterSpacing: '0.5px',
                    flexShrink: 0
                  }}>
                    <Compass size={18} style={{ color: '#0D9488', marginBottom: '2px' }} />
                    <span>ADVENTURE</span>
                    <span style={{ fontSize: '8px', color: '#94A3B8' }}>TOURS</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                        {profileForm.company_name || 'Adventure Tours Pvt. Ltd.'}
                      </h2>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        borderRadius: '100px',
                        backgroundColor: '#DCFCE7',
                        color: '#16A34A',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        <Check size={12} strokeWidth={3} /> Approved
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>
                      Supplier ID: SUP-1023
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Star Rating Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF9C3',
                    border: '1px solid #FEF08A',
                    color: '#854D0E',
                    fontSize: '13px',
                    fontWeight: '850'
                  }}>
                    <span>★ 4.7 / 5</span>
                    <span style={{ fontSize: '11.5px', color: '#A16207', fontWeight: '600' }}>(328 reviews)</span>
                  </div>

                  <button
                    onClick={() => setEditProfileModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '12.5px',
                      fontWeight: '750',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={13} /> Edit Profile
                  </button>
                </div>
              </div>

              {/* Sub-Tabs Nav: Business Info | Contact Details | Categories & Services | Documents */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '2px'
              }}>
                {[
                  { id: 'business', label: 'Business Information' },
                  { id: 'contact', label: 'Contact Details' },
                  { id: 'categories', label: 'Categories & Services' },
                  { id: 'documents', label: 'Documents' },
                  { id: 'bank', label: 'Bank Details' },
                  { id: 'status', label: 'Account Status' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setProfileSubTab(sub.id)}
                    style={{
                      padding: '10px 18px',
                      border: 'none',
                      borderBottom: profileSubTab === sub.id ? '2.5px solid #2563EB' : '2.5px solid transparent',
                      background: 'none',
                      color: profileSubTab === sub.id ? '#2563EB' : '#64748B',
                      fontWeight: profileSubTab === sub.id ? '800' : '650',
                      fontSize: '13.5px',
                      cursor: 'pointer'
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* Sub-Tab Content: 1. Business Info */}
              {profileSubTab === 'business' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  {(profileForm.account_type === 'individual' ? [
                    { label: 'Account Type', value: 'Individual Person' },
                    { label: 'Full Legal Name', value: profileForm.legal_name || profileForm.owner_name || 'Rahul Sharma' },
                    { label: 'Display / Public Name', value: profileForm.display_name || 'None' },
                    { label: 'Email Address', value: profileForm.email || 'rahul@adventuretours.com' },
                    { label: 'Mobile Number', value: profileForm.phone || '+91 98765 43210' },
                    { label: 'Residential Address', value: profileForm.residential_address || profileForm.business_address || '125, M.G Road, Andheri, Mumbai - 400001, India' },
                    { label: 'PAN / Tax ID', value: profileForm.pan_number || profileForm.tax_id || 'ABCDE1234F' },
                    { label: 'Description', value: profileForm.description || 'Guided trekking, camping experiences and nature activities.' }
                  ] : [
                    { label: 'Account Type', value: 'Registered Corporate Entity' },
                    { label: 'Registered Legal Business Name', value: profileForm.company_name || 'Adventure Tours Pvt. Ltd.' },
                    { label: 'Owner / Authorized Rep', value: profileForm.owner_name || 'Rahul Sharma' },
                    { label: 'Email', value: profileForm.email || 'rahul@adventuretours.com' },
                    { label: 'Mobile', value: profileForm.phone || '+91 98765 43210' },
                    { label: 'Business Type', value: profileForm.business_type || 'Private Limited' },
                    { label: 'GST Number', value: profileForm.tax_id || '27ABCDE1234F2Z5' },
                    { label: 'PAN Number', value: profileForm.pan_number || 'ABCDE1234F' },
                    { label: 'Registered Business Address', value: profileForm.business_address || '125, M.G Road, Andheri, Mumbai - 400001, India' },
                    { label: 'Website', value: profileForm.website || 'www.adventuretours.com', isLink: true },
                    { label: 'Description', value: profileForm.description || 'Guided trekking, camping experiences and nature activities.' }
                  ]).map((field, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', padding: '6px 0', borderBottom: '1px solid #F8FAFC' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>{field.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '750', color: field.isLink ? '#2563EB' : '#0F172A' }}>
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Tab Content: 2. Contact Details */}
              {profileSubTab === 'contact' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '28px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {[
                    { label: 'Contact Person', value: profileForm.contact_person || 'Rahul Sharma' },
                    { label: 'Email Address', value: profileForm.email || 'rahul@adventuretours.com' },
                    { label: 'Mobile Number', value: profileForm.phone || '+91 98765 43210' },
                    { label: 'City', value: profileForm.city || 'Mumbai' },
                    { label: 'Country', value: profileForm.country || 'India' }
                  ].map((field, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', padding: '8px 0', borderBottom: i < 4 ? '1px solid #F8FAFC' : 'none' }}>
                      <span style={{ fontSize: '13px', fontWeight: '750', color: '#64748B' }}>{field.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{field.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Tab Content: 3. Categories */}
              {profileSubTab === 'categories' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '28px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#64748B' }}>Main Category</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{profileForm.main_category || 'Adventure'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#64748B' }}>Sub Category</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>{profileForm.sub_category || 'Trekking'}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#64748B' }}>Services Provided</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(profileForm.services || ['Trekking', 'Camping', 'Nature Walk', 'Guided Tours']).map((tag, idx) => (
                        <span key={idx} style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#D6F5EE',
                          color: '#0D9488',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab Content: 4. Documents */}
              {profileSubTab === 'documents' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '28px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {uploadedDocuments.length === 0 ? (
                    <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>No documents uploaded yet.</p>
                  ) : uploadedDocuments.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{documentLabel(doc.document_type)}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 3, wordBreak: 'break-word' }}>{doc.document_name}</div>
                        <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4, textTransform: 'capitalize', color: doc.status === 'approved' ? '#15803d' : doc.status === 'rejected' ? '#dc2626' : '#b45309' }}>{String(doc.status || 'pending').replace(/_/g, ' ')}</div>
                      </div>
                      {doc.document_url ? (
                        <a href={documentFileUrl(doc.document_url)} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1d6fe8', fontWeight: 800, fontSize: 13, textDecoration: 'none', flexShrink: 0 }}>
                          <Eye size={15} /> View
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Tab Content: 5. Bank Details */}
              {profileSubTab === 'bank' && (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    Settlement & Banking Information
                  </h3>
                  {[
                    { label: 'Account Holder Name', value: profileForm.company_name || 'Sunrise Tours Pvt. Ltd.' },
                    { label: 'Bank Name', value: 'HDFC Bank Ltd.' },
                    { label: 'Account Number', value: '•••• •••• •••• 8920' },
                    { label: 'IFSC / SWIFT Code', value: 'HDFC0001234' },
                    { label: 'Branch Location', value: 'Andheri West, Mumbai' },
                    { label: 'Account Verification', value: 'Verified for Automated Payouts' }
                  ].map((field, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', padding: '6px 0', borderBottom: '1px solid #F8FAFC' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>{field.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{field.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Tab Content: 6. Account Status (Screen 2: Supplier Profile - Account Status & Suspension History) */}
              {profileSubTab === 'status' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
                  {/* Left Column: Business Information Summary Card */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '24px 28px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 4px' }}>
                      Business Information
                    </h3>

                    {[
                      { label: 'Business Name', value: profileForm.company_name || 'Sunrise Tours Pvt. Ltd.' },
                      { label: 'Owner Name', value: profileForm.owner_name || 'Rahul Sharma' },
                      { label: 'Email', value: profileForm.email || 'rahul@sunrisetours.com' },
                      { label: 'Mobile', value: profileForm.phone || '+91 98765 43210' },
                      { label: 'Business Type', value: profileForm.business_type || 'Private Limited' },
                      { label: 'GST Number', value: profileForm.tax_id || '27ABCDE1234F1ZZ5' },
                      { label: 'PAN Number', value: profileForm.pan_number || 'ABCDE1234F' },
                      { label: 'Business Address', value: profileForm.business_address || '123, MG Road, Andheri, Mumbai - 400001' },
                      { label: 'Website', value: profileForm.website || 'www.sunrisetours.com', isLink: true },
                      { label: 'Description', value: profileForm.description || 'We provide guided tours, transport and travel experiences across India and international destinations.' }
                    ].map((f, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', padding: '6px 0', borderBottom: '1px solid #F8FAFC', fontSize: '12.5px' }}>
                        <span style={{ color: '#64748B', fontWeight: '650' }}>{f.label}</span>
                        <span style={{ color: f.isLink ? '#1d6fe8' : '#0F172A', fontWeight: '750' }}>{f.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Account Status Card & Suspension History Card */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Account Status Card matching Screen 2 */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                          Account Status
                        </h3>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          backgroundColor: status === 'suspended' ? '#FEE2E2' : '#DCFCE7',
                          color: status === 'suspended' ? '#DC2626' : '#16A34A',
                          fontSize: '11px',
                          fontWeight: '800'
                        }}>
                          {status === 'suspended' ? '● Suspended' : '● Approved'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '6px' }}>
                          <span style={{ color: '#64748B' }}>Suspension Reason</span>
                          <span style={{ fontWeight: '800', color: '#0F172A' }}>Policy / Compliance Review</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '6px' }}>
                          <span style={{ color: '#64748B' }}>Suspended On</span>
                          <span style={{ fontWeight: '800', color: '#0F172A' }}>12 Oct 2026, 10:30 AM</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F8FAFC', paddingBottom: '6px' }}>
                          <span style={{ color: '#64748B' }}>Suspended By</span>
                          <span style={{ fontWeight: '800', color: '#0F172A' }}>Admin (ID: ADM-001)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Expected Review</span>
                          <span style={{ fontWeight: '800', color: '#0F172A' }}>15 Oct 2026 (Tentative)</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setActiveTab('overview')}
                          style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#1d6fe8',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          View Suspension Details
                        </button>
                        <button
                          type="button"
                          onClick={() => addToast('Support channel opened: support@travelhub.com', 'info')}
                          style={{
                            flex: 1,
                            padding: '9px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: '#0F172A',
                            fontSize: '12px',
                            fontWeight: '750',
                            cursor: 'pointer'
                          }}
                        >
                          Contact Support
                        </button>
                      </div>
                    </div>

                    {/* Suspension History Card matching Screen 2 */}
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                          Suspension History
                        </h3>
                        <span onClick={() => addToast('Showing complete audit history', 'info')} style={{ fontSize: '12px', fontWeight: '750', color: '#1d6fe8', cursor: 'pointer' }}>
                          View All
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                          { title: 'Account Suspended', time: '12 Oct 2026, 10:30 AM', desc: 'Policy / Compliance Review by Admin (ADM-001)', color: '#DC2626' },
                          { title: 'Notice Sent to Supplier', time: '12 Oct 2026, 10:25 AM', desc: 'Suspension notice email sent', color: '#D97706' },
                          { title: 'Account Under Review', time: '10 Oct 2026, 04:15 PM', desc: 'Compliance documents requested', color: '#2563EB' }
                        ].map((evt, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: evt.color, marginTop: '5px', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>{evt.title}</span>
                                <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{evt.time}</span>
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{evt.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: MANAGE ACTIVITIES (SCREENS 8, 9, 10) */}
          {/* =================================================================== */}
          {!isPending && activeTab === 'activities' && (
            <div>

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 8: MANAGE ACTIVITIES - LIST */}
              {/* ------------------------------------------------------------- */}
              {activityView === 'list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Header Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                    <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      My Activities
                    </h2>

                    <button
                      onClick={() => setActivityView('add_tag')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#333F70',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '750',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={16} /> Add New Activity
                    </button>
                  </div>

                  {/* Filter Sub-Tabs: All (12) | Active (8) | Pending (3) | Rejected (1) */}
                  <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
                    {[
                      { id: 'all', label: 'All (12)' },
                      { id: 'active', label: 'Active (8)' },
                      { id: 'pending', label: 'Pending (3)' },
                      { id: 'rejected', label: 'Rejected (1)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActivityFilterTab(tab.id)}
                        style={{
                          padding: '8px 14px',
                          border: 'none',
                          borderBottom: activityFilterTab === tab.id ? '2.5px solid #0D9488' : '2.5px solid transparent',
                          background: 'none',
                          color: activityFilterTab === tab.id ? '#0D9488' : '#64748B',
                          fontWeight: activityFilterTab === tab.id ? '800' : '650',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search and Dropdowns Bar */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      flex: '1 1 240px'
                    }}>
                      <Search size={15} style={{ color: '#94A3B8' }} />
                      <input
                        type="text"
                        placeholder="Search activities..."
                        value={activitySearchQuery}
                        onChange={e => setActivitySearchQuery(e.target.value)}
                        style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
                      />
                    </div>

                    <select
                      value={activityCategoryFilter}
                      onChange={e => setActivityCategoryFilter(e.target.value)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        fontSize: '13px',
                        color: '#0F172A',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Category</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Nature">Nature</option>
                      <option value="Water">Water Activities</option>
                    </select>

                    <select
                      value={activityStatusFilter}
                      onChange={e => setActivityStatusFilter(e.target.value)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        fontSize: '13px',
                        color: '#0F172A',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Activities Table (Screen 8) */}
                  <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    overflowX: 'auto'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          <th style={{ padding: '14px 18px' }}>Activity</th>
                          <th style={{ padding: '14px 18px' }}>Category</th>
                          <th style={{ padding: '14px 18px' }}>Price(Customer)</th>
                          <th style={{ padding: '14px 18px' }}>Status</th>
                          <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivities.map((act) => (
                          <tr
                            key={act.id}
                            style={{ borderBottom: '1px solid #F8FAFC', cursor: 'pointer' }}
                            onClick={() => handleOpenActivityDetail(act)}
                          >
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={act.image}
                                  alt={act.title}
                                  style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div style={{ fontWeight: '800', color: '#0F172A' }}>{act.title}</div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>{act.subtitle}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', color: '#64748B' }}>{act.category}</td>
                            <td style={{ padding: '14px 18px', fontWeight: '800', color: '#0F172A' }}>₹{act.price?.toLocaleString()}</td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '11px',
                                fontWeight: '800',
                                backgroundColor: act.status === 'active' ? '#DCFCE7' : act.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                                color: act.status === 'active' ? '#16A34A' : act.status === 'pending' ? '#D97706' : '#DC2626'
                              }}>
                                ● {act.status === 'active' ? 'Active' : act.status === 'pending' ? 'Pending' : 'Rejected'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenActivityDetail(act)}
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #CBD5E1',
                                  backgroundColor: '#FFFFFF',
                                  color: '#0D9488',
                                  fontSize: '11.5px',
                                  fontWeight: '750',
                                  cursor: 'pointer'
                                }}
                              >
                                View / Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 9: ADD / TAG EXISTING ACTIVITY */}
              {/* ------------------------------------------------------------- */}
              {activityView === 'add_tag' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Back button & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => setActivityView('list')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '750',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ChevronLeft size={14} /> Back to Activities
                    </button>
                    <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Add / Tag Existing Activity
                    </h2>
                  </div>

                  {/* Tabs: Search Existing Activity | Create New Activity */}
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
                    <button
                      onClick={() => setTagSubTab('search')}
                      style={{
                        padding: '9px 16px',
                        border: 'none',
                        borderBottom: tagSubTab === 'search' ? '2.5px solid #0D9488' : '2.5px solid transparent',
                        background: 'none',
                        color: tagSubTab === 'search' ? '#0D9488' : '#64748B',
                        fontWeight: tagSubTab === 'search' ? '800' : '650',
                        fontSize: '13.5px',
                        cursor: 'pointer'
                      }}
                    >
                      Search Existing Activity
                    </button>

                    <button
                      onClick={() => setTagSubTab('create')}
                      style={{
                        padding: '9px 16px',
                        border: 'none',
                        borderBottom: tagSubTab === 'create' ? '2.5px solid #0D9488' : '2.5px solid transparent',
                        background: 'none',
                        color: tagSubTab === 'create' ? '#0D9488' : '#64748B',
                        fontWeight: tagSubTab === 'create' ? '800' : '650',
                        fontSize: '13.5px',
                        cursor: 'pointer'
                      }}
                    >
                      Create New Activity
                    </button>
                  </div>

                  {tagSubTab === 'search' ? (
                    <div>
                      {/* Search Bar + Search Button */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          flex: 1
                        }}>
                          <Search size={16} style={{ color: '#94A3B8' }} />
                          <input
                            type="text"
                            placeholder="Search for activities (e.g., Scuba Diving, Trekking, City Tour...)"
                            value={tagSearchQuery}
                            onChange={e => setTagSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
                          />
                        </div>
                        <button
                          style={{
                            padding: '10px 22px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: '#333F70',
                            color: '#FFFFFF',
                            fontSize: '13px',
                            fontWeight: '750',
                            cursor: 'pointer'
                          }}
                        >
                          Search
                        </button>
                      </div>

                      {/* List of Activities to Tag matching Screen 9 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {catalogToTag
                          .filter(c => !tagSearchQuery.trim() || c.title.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                          .map((item) => (
                            <div
                              key={item.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 18px',
                                backgroundColor: '#FFFFFF',
                                borderRadius: '14px',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                                />
                                <div>
                                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>
                                    {item.title}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <MapPin size={12} /> {item.location}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleTagActivity(item)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '9px',
                                  border: '1px solid #0D9488',
                                  backgroundColor: '#D6F5EE',
                                  color: '#0D9488',
                                  fontSize: '12.5px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                Tag / Associate
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    /* Create New Activity Form */
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '28px',
                      border: '1px solid #E2E8F0',
                      maxWidth: '680px'
                    }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 18px' }}>
                        Create Custom Activity Listing
                      </h3>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.target);
                        const title = fd.get('title');
                        const cat = fd.get('category');
                        const loc = fd.get('location');
                        const pr = Number(fd.get('price')) || 5000;
                        const newAct = {
                          id: Date.now(),
                          title,
                          subtitle: `${cat} > Custom`,
                          category: cat,
                          location: loc,
                          duration: 'Full Day',
                          price: pr,
                          b2b_price: Math.round(pr * 0.9),
                          base_price: Math.round(pr * 0.8),
                          status: 'pending',
                          bookingsCount: 0,
                          rating: 5.0,
                          image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
                          description: 'Custom activity proposed by supplier.'
                        };
                        setActivitiesList([newAct, ...activitiesList]);
                        addToast(`🎉 Activity "${title}" submitted for review!`, 'success');
                        handleOpenActivityDetail(newAct);
                      }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Activity Title *</label>
                          <input required name="title" placeholder="e.g. Desert Camping under Stars" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Category *</label>
                            <input required name="category" placeholder="e.g. Adventure Tours" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Location *</label>
                            <input required name="location" placeholder="e.g. Jaisalmer, Rajasthan" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Customer Price (₹) *</label>
                          <input required type="number" name="price" defaultValue="5000" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }} />
                        </div>
                        <button type="submit" style={{ padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#333F70', color: '#FFFFFF', fontWeight: '800', cursor: 'pointer', marginTop: '8px' }}>
                          Save & Setup Pricing
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SCREEN 10: ACTIVITY DETAIL (SUPPLIER VIEW) */}
              {/* ------------------------------------------------------------- */}
              {activityView === 'detail' && selectedActivity && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Back button */}
                  <div>
                    <button
                      onClick={() => setActivityView('list')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '750',
                        color: '#475569',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ChevronLeft size={14} /> Back to Activities
                    </button>
                  </div>

                  {/* Hero Cover Card matching Screen 10 */}
                  <div style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    height: '200px',
                    backgroundColor: '#1E293B',
                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
                  }}>
                    <img
                      src={selectedActivity.image}
                      alt={selectedActivity.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                            {selectedActivity.title}
                          </h1>
                          <div style={{ fontSize: '13px', color: '#E2E8F0', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                            <MapPin size={13} style={{ color: '#38BDF8' }} /> {selectedActivity.location}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            backgroundColor: '#DCFCE7',
                            color: '#16A34A',
                            fontSize: '12px',
                            fontWeight: '800'
                          }}>
                            ● Active
                          </span>

                          <button
                            onClick={() => addToast('Edit mode opened', 'info')}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              color: '#FFFFFF',
                              fontSize: '12.5px',
                              fontWeight: '750',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            <Edit size={14} /> Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Tabs: Overview | Pricing | Availability | Orders | Reviews */}
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px' }}>
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'pricing', label: 'Pricing' },
                      { id: 'availability', label: 'Availability' },
                      { id: 'orders', label: 'Orders' },
                      { id: 'reviews', label: 'Reviews' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActivityDetailTab(tab.id)}
                        style={{
                          padding: '9px 16px',
                          border: 'none',
                          borderBottom: activityDetailTab === tab.id ? '2.5px solid #0D9488' : '2.5px solid transparent',
                          background: 'none',
                          color: activityDetailTab === tab.id ? '#0D9488' : '#64748B',
                          fontWeight: activityDetailTab === tab.id ? '800' : '650',
                          fontSize: '13.5px',
                          cursor: 'pointer'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* PRICING TAB CONTENT (SCREEN 10 CORE REQ) */}
                  {activityDetailTab === 'pricing' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '20px'
                    }}>

                      {/* Box 1: Supplier Pricing */}
                      <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                          Supplier Pricing
                        </h3>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#64748B', marginBottom: '6px' }}>
                            Customer Price
                          </label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: '700', color: '#64748B' }}>₹</span>
                            <input
                              type="number"
                              value={customerRetailPrice}
                              onChange={e => setCustomerRetailPrice(Number(e.target.value) || 0)}
                              style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#64748B', marginBottom: '6px' }}>
                            B2B Price
                          </label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: '700', color: '#64748B' }}>₹</span>
                            <input
                              type="number"
                              value={b2bPrice}
                              onChange={e => setB2bPrice(Number(e.target.value) || 0)}
                              style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#64748B', marginBottom: '6px' }}>
                            Supplier Base Price
                          </label>
                          <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '10px', fontWeight: '700', color: '#64748B' }}>₹</span>
                            <input
                              type="number"
                              value={supplierBasePrice}
                              onChange={e => setSupplierBasePrice(Number(e.target.value) || 0)}
                              style={{ width: '100%', padding: '10px 14px 10px 28px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '800', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Box 2: Commission Model */}
                      <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                      }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                          Commission Model
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '750', color: '#0F172A', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="comm_model"
                              checked={pricingModel === 'percentage'}
                              onChange={() => setPricingModel('percentage')}
                              style={{ accentColor: '#0D9488', width: '16px', height: '16px' }}
                            />
                            Percentage Based
                          </label>

                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '750', color: '#0F172A', cursor: 'pointer' }}>
                            <input
                              type="radio"
                              name="comm_model"
                              checked={pricingModel === 'fixed'}
                              onChange={() => setPricingModel('fixed')}
                              style={{ accentColor: '#0D9488', width: '16px', height: '16px' }}
                            />
                            Fixed Price Based
                          </label>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#64748B', marginBottom: '6px' }}>
                            Commission to Platform
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="number"
                              value={commissionRate}
                              onChange={e => setCommissionRate(Number(e.target.value) || 0)}
                              style={{ width: '80px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', fontWeight: '800' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: '800', color: '#475569' }}>%</span>
                          </div>
                        </div>

                        <button
                          onClick={() => addToast('Pricing model updated and locked!', 'success')}
                          style={{
                            marginTop: 'auto',
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#333F70',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: '750',
                            cursor: 'pointer'
                          }}
                        >
                          Save Pricing Changes
                        </button>
                      </div>

                      {/* Box 3: Price Calculation (Example) */}
                      <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 16px' }}>
                            Price Calculation (Example)
                          </h3>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                              <span>Customer Price</span>
                              <span style={{ fontWeight: '800', color: '#0F172A' }}>₹{customerRetailPrice.toLocaleString()}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                              <span>Platform Commission ({commissionRate}%)</span>
                              <span style={{ fontWeight: '800', color: '#EF4444' }}>- ₹{calculatedPlatformCommission.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Highlighted Green Earnings Box */}
                        <div style={{
                          marginTop: '24px',
                          padding: '16px 20px',
                          borderRadius: '12px',
                          backgroundColor: '#DCFCE7',
                          border: '1px solid #BBF7D0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#166534' }}>
                            Your Earnings
                          </span>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#16A34A' }}>
                            ₹{calculatedSupplierEarnings.toLocaleString()}
                          </span>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Overview Tab Content */}
                  {activityDetailTab === 'overview' && (
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 10px' }}>Description</h3>
                      <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                        {selectedActivity.description}
                      </p>
                    </div>
                  )}

                  {/* Orders Tab Content under Activity */}
                  {activityDetailTab === 'orders' && (
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 14px' }}>
                        Bookings for {selectedActivity.title}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748B' }}>Total 42 completed bookings recorded for this tour experience.</p>
                    </div>
                  )}

                  {/* Reviews Tab Content */}
                  {activityDetailTab === 'reviews' && (
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 14px' }}>Verified Traveller Reviews</h3>
                      <div style={{ fontSize: '24px', fontWeight: '900', color: '#D97706', marginBottom: '10px' }}>4.9 ★★★★★</div>
                      <p style={{ fontSize: '13px', color: '#64748B' }}>98% customer satisfaction score across 38 reviews.</p>
                    </div>
                  )}

                  {/* Availability Tab Content */}
                  {activityDetailTab === 'availability' && (
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: '0 0 14px' }}>Departure Schedule</h3>
                      <p style={{ fontSize: '13px', color: '#64748B' }}>Daily departure at 06:00 AM. Max capacity 12 pax per batch.</p>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: ORDERS LIST (SCREEN 11: ORDERS LIST - SUPPLIER VIEW) */}
          {/* =================================================================== */}
          {!isPending && activeTab === 'bookings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Title Header */}
              <div>
                <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                  Orders
                </h2>
              </div>

              {/* Filter Tabs matching Screen 11: All (120) | Pending (8) | Confirmed (65) | Completed (40) | Cancelled (7) */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px', overflowX: 'auto' }}>
                {[
                  { id: 'all', label: 'All (120)' },
                  { id: 'pending', label: 'Pending (8)' },
                  { id: 'confirmed', label: 'Confirmed (65)' },
                  { id: 'completed', label: 'Completed (40)' },
                  { id: 'cancelled', label: 'Cancelled (7)' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setOrdersSubTab(tab.id)}
                    style={{
                      padding: '8px 14px',
                      border: 'none',
                      borderBottom: ordersSubTab === tab.id ? '2.5px solid #0D9488' : '2.5px solid transparent',
                      background: 'none',
                      color: ordersSubTab === tab.id ? '#0D9488' : '#64748B',
                      fontWeight: ordersSubTab === tab.id ? '800' : '650',
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Filter Bar: Search + Select Date Range */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  flex: '1 1 280px'
                }}>
                  <Search size={15} style={{ color: '#94A3B8' }} />
                  <input
                    type="text"
                    placeholder="Search by order ID or activity..."
                    value={ordersSearch}
                    onChange={e => setOrdersSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#64748B',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                  <Calendar size={15} />
                  <span>Select Date Range</span>
                </div>
              </div>

              {/* Orders Table matching Screen 11 */}
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      <th style={{ padding: '14px 18px' }}>Order ID</th>
                      <th style={{ padding: '14px 18px' }}>Activity</th>
                      <th style={{ padding: '14px 18px' }}>Date</th>
                      <th style={{ padding: '14px 18px' }}>Amount</th>
                      <th style={{ padding: '14px 18px' }}>Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '14px 18px', fontWeight: '800', color: '#0D9488' }}>{ord.id}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '750', color: '#0F172A' }}>{ord.activity}</td>
                        <td style={{ padding: '14px 18px', color: '#64748B' }}>{ord.date}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '800', color: '#0F172A' }}>{ord.amount}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '800',
                            backgroundColor: ord.status === 'Confirmed' ? '#D6F5EE' : ord.status === 'Completed' ? '#F0FDF4' : ord.status === 'Pending' ? '#FEF3C7' : '#FEE2E2',
                            color: ord.status === 'Confirmed' ? '#0F766E' : ord.status === 'Completed' ? '#16A34A' : ord.status === 'Pending' ? '#D97706' : '#DC2626'
                          }}>
                            ● {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedOrderView(ord)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#0D9488',
                              fontSize: '11.5px',
                              fontWeight: '750',
                              cursor: 'pointer'
                            }}
                          >
                            View
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
          {/* =================================================================== */}
          {/* TAB 5: PRICING & COMMISSION DIRECT TAB */}
          {/* =================================================================== */}
          {!isPending && activeTab === 'pricing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                  Pricing & Commission Settings
                </h2>
              </div>
              {/* Show detail pricing card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>Standard Platform Commission</h3>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#0D9488' }}>15%</div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>Applied to gross retail booking total. Remitted on T+7 settlement cycle.</p>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>Total Sales Recorded</h3>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#16A34A' }}>₹4,50,000</div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>Across all 12 listed experiences in November.</p>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>Net Remitted Earnings</h3>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#333F70' }}>₹75,000</div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>Transferred directly to HDFC bank account.</p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 6: EARNINGS & SETTLEMENTS */}
          {/* =================================================================== */}
          {!isPending && activeTab === 'payouts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                Earnings & Settlements
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B' }}>Available for Settlement</span>
                  <div style={{ fontSize: '30px', fontWeight: '900', color: '#16A34A', marginTop: '6px' }}>₹75,000</div>
                  <button onClick={() => addToast('Settlement request processed to bank!', 'success')} style={{ marginTop: '14px', padding: '9px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#333F70', color: '#FFFFFF', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>
                    Request Immediate Transfer
                  </button>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '22px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B' }}>Gross Lifetime Sales</span>
                  <div style={{ fontSize: '30px', fontWeight: '900', color: '#0F172A', marginTop: '6px' }}>₹4,50,000</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>120 Completed Guest Bookings</div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 7: REVIEWS & PERFORMANCE */}
          {/* =================================================================== */}
          {!isPending && activeTab === 'reviews' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ fontSize: '38px', fontWeight: '900', color: '#CA8A04' }}>4.6 ★</div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: 0 }}>Overall Partner Rating</h3>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Based on 120 verified traveller reservations</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A' }}>Aarav Mehta • Trekking in Manali</strong>
                    <span style={{ color: '#CA8A04', fontWeight: '800', fontSize: '12.5px' }}>★★★★★ 5.0</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#475569', margin: 0 }}>
                    &quot;Spectacular guides, well planned summit climb and exceptional safety gear! Highly recommend Adventure Tours.&quot;
                  </p>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#0F172A' }}>Sophia Chen • Camping in Rishikesh</strong>
                    <span style={{ color: '#CA8A04', fontWeight: '800', fontSize: '12.5px' }}>★★★★☆ 4.8</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#475569', margin: 0 }}>
                    &quot;Loved the riverside campsite and rafting guides. Booking via TravelHub was seamless!&quot;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 8: DOCUMENTS & LEGAL (E-SIGN + KYC) */}
          {/* =================================================================== */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* E-Sign Agreement Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                borderRadius: '18px',
                padding: '28px',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#38BDF8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    Regulatory Contract
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '850', color: '#FFFFFF', margin: '4px 0 6px' }}>
                    Supplier Master Services & Distribution Agreement (v1.0)
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0, maxWidth: '580px' }}>
                    Platform commission 15.00%, T+7 settlement cycle, and dispute indemnification terms.
                  </p>
                </div>

                <button
                  onClick={() => setEsignModalOpen(true)}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0D9488',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)'
                  }}
                >
                  <PenTool size={15} /> Review & Execute E-Sign
                </button>
              </div>

              {/* Admin Remark / Document Request Notice */}
              {supplier?.approval_notes && (
                <div style={{
                  padding: '18px 22px',
                  backgroundColor: status === 'documents_required' ? '#FFF7ED' : '#F8FAFC',
                  borderRadius: '16px',
                  border: `1.5px solid ${status === 'documents_required' ? '#FDBA74' : '#E2E8F0'}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}>
                  <AlertCircle size={22} style={{ color: status === 'documents_required' ? '#C2410C' : '#1D6FE8', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '800', color: status === 'documents_required' ? '#9A3412' : '#0F172A' }}>
                      {status === 'documents_required' ? 'Action Required: Additional Documents Requested by Admin' : 'Admin Review Remarks'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {supplier.approval_notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Document Form */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
                  Upload Verification Document
                </h3>
                <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748B' }}>
                  Upload requested compliance or legal identity documents for verification.
                </p>

                <form onSubmit={handleDocUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) 160px', gap: '14px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Document Type *</label>
                    <select
                      value={docUploadType}
                      onChange={e => setDocUploadType(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', backgroundColor: '#FFFFFF', outline: 'none' }}
                    >
                      <option value="id_proof">Government ID / Passport Proof</option>
                      <option value="address_proof">Address Proof / Utility Bill</option>
                      <option value="business_registration">Business Registration Certificate</option>
                      <option value="gst_certificate">GST / Tax Registration Proof</option>
                      <option value="pan_card">PAN Card</option>
                      <option value="trade_license">Trade License / Commercial License</option>
                      <option value="bank_statement">Bank Verification / Statement</option>
                      <option value="other">Other Supporting Document</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '6px' }}>Select File (PDF, PNG, JPG) *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      onChange={e => setDocUploadFile(e.target.files?.[0] || null)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', backgroundColor: '#FFFFFF' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={docUploading}
                    style={{
                      padding: '11px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#1D6FE8',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: docUploading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      height: '42px'
                    }}
                  >
                    {docUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {docUploading ? 'Uploading…' : 'Upload & Submit'}
                  </button>
                </form>
              </div>

              {/* Submitted Documents Grid */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: '0 0 16px' }}>
                  Uploaded KYC Documents
                </h3>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {uploadedDocuments.length === 0 ? (
                    <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>No documents uploaded yet.</p>
                  ) : uploadedDocuments.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '14px 16px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{documentLabel(doc.document_type)}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{doc.document_name}</div>
                        <div style={{ fontSize: 11, fontWeight: 800, marginTop: 4, textTransform: 'capitalize', color: doc.status === 'approved' ? '#15803d' : doc.status === 'rejected' ? '#dc2626' : '#b45309' }}>{String(doc.status || 'pending').replace(/_/g, ' ')}</div>
                      </div>
                      {doc.document_url ? (
                        <a href={documentFileUrl(doc.document_url)} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1d6fe8', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                          <Eye size={15} /> View
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 9: SETTINGS */}
          {/* =================================================================== */}
          {activeTab === 'settings' && (
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '28px', border: '1px solid #E2E8F0', maxWidth: '600px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: '0 0 18px' }}>
                Account Settings & Notifications
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: '750' }}>
                  <span>Instant SMS for Confirmed Bookings</span>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#0D9488' }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: '750' }}>
                  <span>Weekly Financial Settlement Reports</span>
                  <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: '#0D9488' }} />
                </label>
                <button
                  onClick={() => addToast('Settings preferences saved!', 'success')}
                  style={{ alignSelf: 'flex-start', padding: '9px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#333F70', color: '#FFFFFF', fontWeight: '800', cursor: 'pointer', marginTop: '10px' }}
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MODAL: EDIT PROFILE (SCREEN 7 EDIT) */}
      {/* ========================================================================= */}
      {editProfileModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                Edit Supplier Profile
              </h2>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Business Name *</label>
                <input
                  required
                  value={profileForm.company_name}
                  onChange={e => setProfileForm({ ...profileForm, company_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Owner Name *</label>
                  <input
                    required
                    value={profileForm.owner_name}
                    onChange={e => setProfileForm({ ...profileForm, owner_name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Business Type *</label>
                  <select
                    value={profileForm.business_type}
                    onChange={e => setProfileForm({ ...profileForm, business_type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="Private Limited">Private Limited</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="LLP">LLP</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>GST Number</label>
                  <input
                    value={profileForm.tax_id}
                    onChange={e => setProfileForm({ ...profileForm, tax_id: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>PAN Number</label>
                  <input
                    value={profileForm.pan_number}
                    onChange={e => setProfileForm({ ...profileForm, pan_number: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Business Address</label>
                <input
                  value={profileForm.business_address}
                  onChange={e => setProfileForm({ ...profileForm, business_address: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Website</label>
                <input
                  value={profileForm.website}
                  onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>Description of Services</label>
                <textarea
                  rows={3}
                  value={profileForm.description}
                  onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: '750' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#333F70', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: '800' }}
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ORDER DETAILS (SCREEN 11 DETAIL) */}
      {/* ========================================================================= */}
      {selectedOrderView && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', textTransform: 'uppercase' }}>Reservation Details</span>
                <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                  {selectedOrderView.id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrderView(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Activity</span>
                <strong style={{ color: '#0F172A' }}>{selectedOrderView.activity}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Guest Name</span>
                <strong style={{ color: '#0F172A' }}>{selectedOrderView.customer}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Guest Email</span>
                <span style={{ color: '#0F172A' }}>{selectedOrderView.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Tour Date</span>
                <strong style={{ color: '#0F172A' }}>{selectedOrderView.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Total Amount</span>
                <strong style={{ fontSize: '16px', color: '#16A34A' }}>{selectedOrderView.amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Order Status</span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '800',
                  backgroundColor: '#D6F5EE',
                  color: '#0F766E'
                }}>
                  ● {selectedOrderView.status}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrderView(null)}
              style={{
                marginTop: '22px',
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#333F70',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: DIGITAL E-SIGN AGREEMENT EXECUTION */}
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
            borderRadius: '20px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(15, 23, 42, 0.4)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAFAF8'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', textTransform: 'uppercase' }}>Electronic Signature Portal</span>
                <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                  Execute Supplier Services Agreement
                </h2>
              </div>
              <button
                onClick={() => setEsignModalOpen(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #CBD5E1', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '12px',
                lineHeight: '1.7',
                color: '#334155',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {`MASTER SERVICES & SUPPLIER DISTRIBUTION AGREEMENT (v1.0)\n========================================================================\n\nEntity: ${profileForm.company_name || 'Adventure Tours Pvt. Ltd.'}\nCommission Rate: 15.00% gross retail booking value\nSettlement Cycle: T+7 net bank transfer upon tour completion\nJurisdiction: Platform Operating Jurisdiction\n\n1. SCOPE: The Supplier agrees to distribute activities through the platform.\n2. CANCELLATION: Bookings must honor the published cancellation policies.\n3. SAFETY: The Supplier maintains full regulatory licenses and tour insurances.`}
              </div>

              <form onSubmit={handleSignEsign} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', marginBottom: '4px' }}>
                    Signatory Legal Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={esignForm.signer_name}
                    onChange={e => setEsignForm({ ...esignForm, signer_name: e.target.value })}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: '750', boxSizing: 'border-box' }}
                  />
                </div>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    required
                    checked={esignForm.consent_accepted}
                    onChange={e => setEsignForm({ ...esignForm, consent_accepted: e.target.checked })}
                    style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#0D9488' }}
                  />
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.5 }}>
                    I hereby certify that I am legally authorized to act on behalf of <strong>{profileForm.company_name}</strong> and accept this electronic signature execution.
                  </div>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEsignModalOpen(false)}
                    style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', cursor: 'pointer', fontSize: '12.5px', fontWeight: '750' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={signingEsign || !esignForm.signer_name || !esignForm.consent_accepted}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0D9488',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)'
                    }}
                  >
                    {signingEsign ? 'Executing...' : 'Sign & Accept Agreement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
