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
  Tag
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
        setProfileForm({
          account_type: res.data.account_type || 'corporate',
          company_name: res.data.company_name || 'Adventure Tours Pvt. Ltd.',
          legal_name: res.data.legal_name || res.data.company_name || 'Rahul Sharma',
          display_name: res.data.display_name || '',
          owner_name: res.data.owner_name || res.data.contact_person || 'Rahul Sharma',
          contact_person: res.data.contact_person || 'Rahul Sharma',
          business_type: res.data.business_type || 'Private Limited',
          tax_id: res.data.tax_id || '27ABCDE1234F2Z5',
          pan_number: res.data.pan_number || 'ABCDE1234F',
          business_address: res.data.business_address || '123, MG Road, Andheri, Mumbai - 400001, Maharashtra, India',
          residential_address: res.data.residential_address || '',
          city: res.data.city || 'Mumbai',
          country: res.data.country || 'India',
          website: res.data.website || 'www.adventuretours.com',
          description: res.data.description || 'We provide guided trekking tours, camping experiences and nature exploration activities across India.',
          email: res.data.user_email || user?.email || 'rahul@adventuretours.com',
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

  const status = supplier?.status || 'under_review';
  const isPending = status === 'under_review' || status === 'pending_verification' || status === 'pending' || status === 'documents_required';

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
        { id: 'profile', label: 'My Profile', icon: Building2, badge: null },
        { id: 'activities', label: 'Activities', icon: Compass, badge: '12' },
        { id: 'bookings', label: 'Orders', icon: CalendarCheck, badge: '120' },
        { id: 'pricing', label: 'Pricing & Commission', icon: CreditCard, badge: null },
        { id: 'payouts', label: 'Earnings & Settlements', icon: Wallet, badge: '₹75,000' },
        { id: 'reviews', label: 'Reviews & Performance', icon: Star, badge: '4.6★' },
        { id: 'documents', label: 'Documents & Legal', icon: FileText, badge: null },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: '5' },
        { id: 'settings', label: 'Settings', icon: Settings, badge: null }
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
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 40,
        boxShadow: '2px 0 12px rgba(15, 23, 42, 0.02)'
      }}>
        {/* Brand & Nav */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 16px 16px' }}>

          {/* Logo matching Screenshots: "T TravelHub" */}
          <div style={{ marginBottom: '24px', paddingLeft: '8px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#333F70',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6F5EE',
                boxShadow: '0 2px 8px rgba(51, 63, 112, 0.2)'
              }}>
                <Compass size={20} />
              </div>
              <div>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#333F70', letterSpacing: '-0.5px', display: 'block', lineHeight: 1.1 }}>
                  TRAVEL<span style={{ color: '#0D9488' }}>.</span>
                </span>
                <span style={{ fontSize: '10px', fontWeight: '750', color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Supplier Console
                </span>
              </div>
            </Link>
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
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: isActive ? '#333F70' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#475569',
                    fontSize: '13px',
                    fontWeight: isActive ? '800' : '650',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={17} style={{ color: isActive ? '#FFFFFF' : '#64748B' }} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: isActive ? 'rgba(214, 245, 238, 0.22)' : '#D6F5EE',
                      color: isActive ? '#D6F5EE' : '#0D9488'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom User Area */}
        <div style={{ padding: '16px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#333F70',
                color: '#D6F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                flexShrink: 0
              }}>
                {(profileForm.owner_name?.[0] || 'R').toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profileForm.owner_name || 'Rahul Sharma'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profileForm.company_name || 'Adventure Tours'}
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
              gap: '6px',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #FEE2E2',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              fontSize: '11.5px',
              fontWeight: '750',
              cursor: 'pointer'
            }}
          >
            <LogOut size={13} /> Sign Out
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

        {/* Top Header Navbar */}
        <header style={{
          height: '68px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A' }}>
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'profile' && 'Supplier Profile'}
              {activeTab === 'activities' && (activityView === 'list' ? 'My Activities' : activityView === 'add_tag' ? 'Add / Tag Existing Activity' : 'Activity Detail')}
              {activeTab === 'bookings' && 'Orders'}
              {activeTab === 'pricing' && 'Pricing & Commission'}
              {activeTab === 'payouts' && 'Earnings & Settlements'}
              {activeTab === 'reviews' && 'Reviews & Performance'}
              {activeTab === 'documents' && 'Documents & Legal'}
              {activeTab === 'settings' && 'Account Settings'}
            </span>
          </div>

          {/* Right Header: Notification & Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => addToast('3 new notifications received', 'info')}
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '6px'
              }}
            >
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                backgroundColor: '#EF4444',
                borderRadius: '50%'
              }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#333F70',
                color: '#D6F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800'
              }}>
                {(profileForm.owner_name?.[0] || 'R').toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', lineHeight: 1.2 }}>
                  {profileForm.owner_name || 'Rahul Sharma'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {isPending ? 'Supplier (Pending)' : 'Adventure Tours Pvt. Ltd.'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div style={{ padding: '28px 32px', flex: 1 }}>

          {/* =================================================================== */}
          {/* TAB 1: OVERVIEW (SCREEN 5: PENDING APPROVAL OR SCREEN 6: APPROVED) */}
          {/* =================================================================== */}
          {(activeTab === 'overview' || activeTab === 'verification') && (
            isPending ? (
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
                      {[
                        { label: 'GST Certificate' },
                        { label: 'PAN Card' },
                        { label: 'Aadhaar Card' },
                        { label: 'Address Proof' }
                      ].map((item, idx) => (
                        <div key={idx} style={{
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
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>{item.label}</span>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
                            Uploaded
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SCREEN 6: SUPPLIER DASHBOARD (AFTER APPROVAL) - 4 STAT KPI CARDS + 6-MONTH CHART + IMPORTANT ALERTS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Dashboard Welcome Header with Approved Pill, Supplier ID & Date Filter */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                      Good Morning, {profileForm.owner_name?.split(' ')[0] || 'Rahul'}!
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
                      Here&apos;s an overview of your business performance.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 12px',
                      borderRadius: '100px',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      fontSize: '11.5px',
                      fontWeight: '800'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                      Approved
                    </span>

                    <span style={{ fontSize: '12px', fontWeight: '750', color: '#64748B' }}>
                      Supplier ID: SUP-1023
                    </span>

                    <div style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Calendar size={13} style={{ color: '#64748B' }} />
                      01 Oct 2026 - 31 Oct 2026
                    </div>
                  </div>
                </div>

                {/* 4 Stat KPI Cards (Screen 6) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '16px'
                }}>
                  {/* Card 1: Total Bookings */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CalendarCheck size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B' }}>Total Bookings</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>248</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#16A34A' }}>+10%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Total Revenue */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Wallet size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B' }}>Total Revenue</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>₹4,80,000</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#16A34A' }}>+22%</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Upcoming Bookings */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Clock size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B' }}>Upcoming Bookings</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>32</span>
                        <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#2563EB', cursor: 'pointer' }}>View →</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Cancelled Bookings */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '18px 20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748B' }}>Cancelled Bookings</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>8</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#DC2626' }}>-12%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two-Column: Bookings & Revenue Chart (60%) + Important Alerts (40%) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
                  {/* Left: Bookings & Revenue Visual Chart */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px 24px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                          Bookings & Revenue
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '11.5px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569' }}>
                            <span style={{ width: '10px', height: '10px', backgroundColor: '#38BDF8', borderRadius: '2px' }} />
                            Bookings
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569' }}>
                            <span style={{ width: '10px', height: '10px', backgroundColor: '#10B981', borderRadius: '50%' }} />
                            Revenue (₹)
                          </span>
                        </div>
                      </div>

                      <select
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#F8FAFC',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          color: '#334155',
                          cursor: 'pointer'
                        }}
                      >
                        <option>Last 6 Months</option>
                        <option>Last 12 Months</option>
                        <option>Year 2026</option>
                      </select>
                    </div>

                    {/* Interactive Graphic Simulation */}
                    <div style={{ height: '220px', width: '100%', position: 'relative', marginTop: '10px' }}>
                      <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Grid Lines */}
                        <line x1="40" y1="30" x2="480" y2="30" stroke="#F1F5F9" strokeDasharray="4 4" />
                        <line x1="40" y1="75" x2="480" y2="75" stroke="#F1F5F9" strokeDasharray="4 4" />
                        <line x1="40" y1="120" x2="480" y2="120" stroke="#F1F5F9" strokeDasharray="4 4" />
                        <line x1="40" y1="165" x2="480" y2="165" stroke="#E2E8F0" />

                        {/* Y-Axis Labels */}
                        <text x="25" y="34" fontSize="10" fill="#94A3B8" textAnchor="end">600</text>
                        <text x="25" y="79" fontSize="10" fill="#94A3B8" textAnchor="end">400</text>
                        <text x="25" y="124" fontSize="10" fill="#94A3B8" textAnchor="end">200</text>
                        <text x="25" y="169" fontSize="10" fill="#94A3B8" textAnchor="end">0</text>

                        {/* Bookings Bars (Apr, May, Jun, Jul, Aug, Sep) */}
                        <rect x="80" y="130" width="16" height="35" rx="3" fill="#67E8F9" />
                        <rect x="150" y="105" width="16" height="60" rx="3" fill="#38BDF8" />
                        <rect x="220" y="85" width="16" height="80" rx="3" fill="#38BDF8" />
                        <rect x="290" y="70" width="16" height="95" rx="3" fill="#0284C7" />
                        <rect x="360" y="55" width="16" height="110" rx="3" fill="#0284C7" />
                        <rect x="430" y="45" width="16" height="120" rx="3" fill="#0369A1" />

                        {/* Revenue Curve Line */}
                        <path
                          d="M 88 140 Q 158 115 228 92 T 368 60 T 438 48"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="3"
                        />

                        {/* Revenue Nodes */}
                        <circle cx="88" cy="140" r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                        <circle cx="158" cy="115" r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                        <circle cx="228" cy="92" r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                        <circle cx="298" cy="74" r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                        <circle cx="368" cy="60" r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                        <circle cx="438" cy="48" r="4" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />

                        {/* X-Axis Month Labels */}
                        <text x="88" y="185" fontSize="10.5" fill="#64748B" textAnchor="middle" fontWeight="600">Apr</text>
                        <text x="158" y="185" fontSize="10.5" fill="#64748B" textAnchor="middle" fontWeight="600">May</text>
                        <text x="228" y="185" fontSize="10.5" fill="#64748B" textAnchor="middle" fontWeight="600">Jun</text>
                        <text x="298" y="185" fontSize="10.5" fill="#64748B" textAnchor="middle" fontWeight="600">Jul</text>
                        <text x="368" y="185" fontSize="10.5" fill="#64748B" textAnchor="middle" fontWeight="600">Aug</text>
                        <text x="438" y="185" fontSize="10.5" fill="#64748B" textAnchor="middle" fontWeight="600">Sep</text>
                      </svg>
                    </div>
                  </div>

                  {/* Right: Important Alerts Feed (Screen 6) */}
                  <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', padding: '20px 24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                          Important Alerts
                        </h3>
                        <span style={{ fontSize: '11.5px', fontWeight: '750', color: '#2563EB', cursor: 'pointer' }}>
                          View All →
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Alert 1 */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FEF2F2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AlertTriangle size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>
                              3 bookings require your action
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                              These bookings were made before...
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>1 hour ago</span>
                        </div>

                        {/* Alert 2 */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AlertCircle size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>
                              GST Certificate expires in 30 days
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                              Please update your GST certificate.
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>5 hours ago</span>
                        </div>

                        {/* Alert 3 */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <TrendingUp size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>
                              Your performance score improved
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                              Keep up the good work!
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>2 days ago</span>
                        </div>

                        {/* Alert 4 */}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Star size={15} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '750', color: '#0F172A' }}>
                              New review received
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                              Customer left a 5-star review.
                            </div>
                          </div>
                          <span style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>2 days ago</span>
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
                  { id: 'business', label: 'Business Info' },
                  { id: 'contact', label: 'Contact Details' },
                  { id: 'categories', label: 'Categories & Services' },
                  { id: 'documents', label: 'Documents' }
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
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                      { label: 'GST Certificate', status: 'Uploaded', icon: FileCheck },
                      { label: 'PAN Card', status: 'Uploaded', icon: FileCheck },
                      { label: 'Aadhaar Card', status: 'Uploaded', icon: FileCheck },
                      { label: 'Address Proof', status: 'Uploaded', icon: FileCheck }
                    ].map((d, idx) => (
                      <div key={idx} style={{
                        padding: '18px',
                        borderRadius: '14px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '6px'
                      }}>
                        <d.icon size={26} style={{ color: '#16A34A' }} />
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{d.label}</span>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#16A34A', textTransform: 'uppercase' }}>{d.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: MANAGE ACTIVITIES (SCREENS 8, 9, 10) */}
          {/* =================================================================== */}
          {activeTab === 'activities' && (
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
          {activeTab === 'bookings' && (
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
          {/* TAB 5: PRICING & COMMISSION DIRECT TAB */}
          {/* =================================================================== */}
          {activeTab === 'pricing' && (
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
          {activeTab === 'payouts' && (
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
          {activeTab === 'reviews' && (
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

              {/* Submitted Documents Grid */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '850', color: '#0F172A', margin: '0 0 16px' }}>
                  Uploaded KYC Documents
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {[
                    { label: 'GST Certificate', status: 'Approved' },
                    { label: 'PAN Card', status: 'Approved' },
                    { label: 'Aadhaar Card', status: 'Approved' },
                    { label: 'Address Proof', status: 'Approved' }
                  ].map((doc, idx) => (
                    <div key={idx} style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #BBF7D0',
                      backgroundColor: '#F0FDF4',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{doc.label}</span>
                        <Check size={14} style={{ color: '#16A34A' }} />
                      </div>
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '750' }}>Status: {doc.status}</span>
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
