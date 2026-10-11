'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart3,
  ScrollText,
  Lock,
  Layers,
  ArrowRight,
  Loader2,
  Search,
  RefreshCw,
  Compass,
  LogOut,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Calendar,
  Sparkles,
  AlertCircle,
  Eye,
  Download,
  ExternalLink,
  Check,
  X,
  Tag,
  Briefcase,
  User,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  BadgeAlert
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, role, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom taxonomy state
  const [customTaxonomy, setCustomTaxonomy] = useState({ customSubcategories: [], customServices: [] });
  const [reviewingTaxId, setReviewingTaxId] = useState(null);

  // Supplier Lifecycle / Docs Required / Suspended state
  const [statusModalSupplier, setStatusModalSupplier] = useState(null);
  const [statusTarget, setStatusTarget] = useState('documents_required');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Suspended supplier affected bookings
  const [affectedModalSupplier, setAffectedModalSupplier] = useState(null);
  const [affectedData, setAffectedData] = useState({ bookings: [], replacementSuppliers: [] });
  const [loadingAffected, setLoadingAffected] = useState(false);
  const [reassignSupplierId, setReassignSupplierId] = useState({});
  const [reassignLoadingId, setReassignLoadingId] = useState(null);

  // Search filter
  const [userSearch, setUserSearch] = useState('');

  // Approval modal state
  const [actionSupplier, setActionSupplier] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'reject'
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // KYC Document Review Modal state
  const [docReviewSupplier, setDocReviewSupplier] = useState(null);
  const [verifyingDocId, setVerifyingDocId] = useState(null);
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState({ open: false, docId: null, reason: '' });

  const handleVerifyDocument = async (supplierId, docId, status, rejection_reason = null) => {
    setVerifyingDocId(docId);
    try {
      const res = await authService.verifyAdminSupplierDocument(supplierId, docId, {
        status,
        rejection_reason
      });
      if (res.success) {
        addToast(res.message || `Document marked as ${status}`, 'success');
        if (docReviewSupplier) {
          setDocReviewSupplier(prev => ({
            ...prev,
            documents: prev.documents.map(d => d.id === docId ? { ...d, status, rejection_reason } : d)
          }));
        }
        const suppRes = await authService.getAdminSuppliers();
        if (suppRes.success && suppRes.data?.suppliers) {
          setSuppliers(suppRes.data.suppliers);
        }
      } else {
        addToast(res.message || 'Failed to update document status', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error updating document status', 'error');
    } finally {
      setVerifyingDocId(null);
      setRejectReasonPrompt({ open: false, docId: null, reason: '' });
    }
  };

  const hasPermission = (perm) => {
    if (role === 'site_admin') return true;
    return user?.permissions?.includes(perm) || false;
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      if (hasPermission('report.revenue')) {
        const revRes = await authService.getRevenueReport();
        if (revRes.success && revRes.data) setStats(revRes.data);
      }

      if (hasPermission('supplier.view')) {
        const suppRes = await authService.getAdminSuppliers();
        if (suppRes.success && suppRes.data?.suppliers) setSuppliers(suppRes.data.suppliers);

        try {
          const taxRes = await authService.getAdminCustomTaxonomy();
          if (taxRes.success && taxRes.data) {
            setCustomTaxonomy(taxRes.data);
          }
        } catch (e) {
          console.warn('Failed to fetch custom taxonomy:', e);
        }
      }

      if (hasPermission('role.view')) {
        const [rolesRes, permsRes] = await Promise.all([
          authService.getAdminRoles(),
          authService.getAdminPermissions()
        ]);
        if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data);
        if (permsRes.success && permsRes.data?.permissions) setPermissions(permsRes.data.permissions);
      }

      if (hasPermission('user.view')) {
        const userRes = await authService.getAdminUsers();
        if (userRes.success && userRes.data?.users) setUsersList(userRes.data.users);
      }

      if (role === 'site_admin') {
        const logsRes = await authService.getAuditLogs();
        if (logsRes.success && logsRes.data?.logs) setAuditLogs(logsRes.data.logs);
      }
    } catch (e) {
      console.warn('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user]);

  const handleReviewCustomSubcategory = async (id, status, addToCatalog = false) => {
    setReviewingTaxId(id);
    try {
      const res = await authService.reviewAdminCustomSubcategory(id, {
        status,
        add_to_catalog: addToCatalog,
        admin_notes: addToCatalog ? 'Approved and integrated into global catalog' : `Marked as ${status}`
      });
      if (res.success) {
        addToast(res.message || 'Taxonomy item updated', 'success');
        const taxRes = await authService.getAdminCustomTaxonomy();
        if (taxRes.success && taxRes.data) setCustomTaxonomy(taxRes.data);
      } else {
        addToast(res.message || 'Failed to update taxonomy item', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Network error updating taxonomy', 'error');
    } finally {
      setReviewingTaxId(null);
    }
  };

  const handleUpdateSupplierStatus = async (e) => {
    e.preventDefault();
    if (!statusModalSupplier) return;
    setStatusLoading(true);
    try {
      const res = await authService.updateAdminSupplierStatus(statusModalSupplier.id, {
        status: statusTarget,
        notes: statusNotes,
        reason: statusNotes
      });
      if (res.success) {
        addToast(res.message || `Status updated to ${statusTarget}`, 'success');
        setStatusModalSupplier(null);
        setStatusNotes('');
        await loadAllData();
      } else {
        addToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Network error updating status', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleOpenAffectedBookings = async (supplier) => {
    setAffectedModalSupplier(supplier);
    setLoadingAffected(true);
    try {
      const res = await authService.getAdminSupplierAffectedBookings(supplier.id);
      if (res.success && res.data) {
        setAffectedData(res.data);
      } else {
        setAffectedData({ bookings: [], replacementSuppliers: [] });
      }
    } catch (err) {
      addToast(err.message || 'Failed to load affected bookings', 'error');
    } finally {
      setLoadingAffected(false);
    }
  };

  const handleReassignBooking = async (bookingId) => {
    const targetSupId = reassignSupplierId[bookingId];
    if (!targetSupId) {
      addToast('Please select a replacement supplier first', 'error');
      return;
    }
    setReassignLoadingId(bookingId);
    try {
      const res = await authService.reassignAdminSupplierBooking(affectedModalSupplier.id, {
        booking_id: bookingId,
        new_supplier_id: targetSupId,
        action_taken: 'assign_replacement',
        reason: 'Original supplier account suspended by admin'
      });
      if (res.success) {
        addToast(res.message || 'Booking reassigned successfully', 'success');
        // Refresh affected bookings
        const refRes = await authService.getAdminSupplierAffectedBookings(affectedModalSupplier.id);
        if (refRes.success && refRes.data) setAffectedData(refRes.data);
      } else {
        addToast(res.message || 'Failed to reassign booking', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error reassigning booking', 'error');
    } finally {
      setReassignLoadingId(null);
    }
  };

  const handleSupplierDecision = async (e) => {
    e.preventDefault();
    if (!actionSupplier) return;

    setActionLoading(true);
    try {
      let res;
      if (actionType === 'approve') {
        res = await authService.approveSupplier(actionSupplier.id, actionNote);
      } else {
        res = await authService.rejectSupplier(actionSupplier.id, actionNote);
      }

      if (res.success) {
        addToast(res.message, 'success');
        setActionSupplier(null);
        setActionNote('');
        await loadAllData();
      } else {
        addToast(res.message || 'Action failed', 'error');
      }
    } catch {
      addToast('Network error during decision', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRole = async (targetUserId, newRoleSlug) => {
    try {
      const res = await authService.assignUserRole(targetUserId, newRoleSlug);
      if (res.success) {
        addToast(res.message || `User role successfully changed to ${newRoleSlug}`, 'success');
        await loadAllData();
      } else {
        addToast(res.message || 'Failed to update role', 'error');
      }
    } catch {
      addToast('Network error assigning role', 'error');
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.first_name?.toLowerCase().includes(term) ||
      u.last_name?.toLowerCase().includes(term) ||
      u.role_slug?.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      color: '#0F172A',
      fontFamily: "'Manrope', -apple-system, sans-serif"
    }}>
      {/* Luxury Brand Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.03)'
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 24px',
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#333F70',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6F5EE'
              }}>
                <Compass size={22} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', color: '#333F70' }}>
                TRAVEL<span style={{ color: '#0D9488' }}>.</span>
              </span>
            </Link>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: '#D6F5EE',
              color: '#0D9488',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}>
              <ShieldCheck size={14} /> Site Administration
            </span>
          </div>

          {/* User profile & actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={loadAllData}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#333F70',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800'
              }}>
                {(user?.first_name?.[0] || 'A').toUpperCase()}
              </div>
              <div style={{ fontSize: '13px' }}>
                <span style={{ fontWeight: '800', color: '#0F172A' }}>{user?.first_name} {user?.last_name}</span>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>{role?.toUpperCase()}</span>
              </div>
            </div>

            <button
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                color: '#EF4444',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '36px 24px 80px' }}>
        
        {/* Security Rule Notice Banner */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 24px',
          border: '1px solid rgba(51, 63, 112, 0.12)',
          boxShadow: '0 4px 15px -2px rgba(51, 63, 112, 0.04)',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#D6F5EE',
              color: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                Admin Security Protocol Enforced
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Public registration for Site Administrators is permanently disabled. Only an existing Site Admin can assign or promote users to administrative roles via the User Accounts tab.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: '#333F70',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Manage User Roles →
          </button>
        </div>

        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '6px',
          background: '#E2E8F0',
          borderRadius: '14px',
          marginBottom: '28px',
          width: 'fit-content',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'overview' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'overview' ? '#333F70' : '#64748B',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'overview' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <BarChart3 size={15} /> Overview & Metrics
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'suppliers' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'suppliers' ? '#333F70' : '#64748B',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'suppliers' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Building2 size={15} /> Supplier Approvals
            {suppliers.filter(s => s.status !== 'approved').length > 0 && (
              <span style={{
                background: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '2px 7px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {suppliers.filter(s => s.status !== 'approved').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('taxonomy')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'taxonomy' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'taxonomy' ? '#333F70' : '#64748B',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'taxonomy' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Tag size={15} /> Custom Taxonomy
            {(customTaxonomy.customSubcategories?.filter(c => c.status === 'pending').length || 0) > 0 && (
              <span style={{
                background: '#F59E0B',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '2px 7px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {customTaxonomy.customSubcategories.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'users' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'users' ? '#333F70' : '#64748B',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'users' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Users size={15} /> User Accounts & Roles
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'roles' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'roles' ? '#333F70' : '#64748B',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'roles' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={15} /> RBAC Matrix
          </button>

          {role === 'site_admin' && (
            <button
              onClick={() => setActiveTab('audit')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'audit' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'audit' ? '#333F70' : '#64748B',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'audit' ? '0 2px 8px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <ScrollText size={15} /> Audit Trail ({auditLogs.length})
            </button>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & KEY METRICS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              {/* Stat 1 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Active Suppliers
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#D6F5EE', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginTop: '12px' }}>
                  {stats?.active_suppliers || suppliers.filter(s => s.status === 'approved').length}
                </div>
                <div style={{ fontSize: '13px', color: '#0D9488', marginTop: '6px', fontWeight: '700' }}>
                  {suppliers.filter(s => s.status === 'under_review').length} under compliance review
                </div>
              </div>

              {/* Stat 2 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Registered Customers
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(51, 63, 112, 0.1)', color: '#333F70', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginTop: '12px' }}>
                  {stats?.total_customers || usersList.filter(u => u.role_slug === 'customer').length}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                  Instant OTP mobile/email verified
                </div>
              </div>

              {/* Stat 3 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Total Bookings
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginTop: '12px' }}>
                  {stats?.total_bookings || 0}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                  Bookings engine active
                </div>
              </div>

              {/* Stat 4 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    Platform Volume
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginTop: '12px' }}>
                  ₹{parseFloat(stats?.total_revenue || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                  Financial oversight active
                </div>
              </div>
            </div>

            {/* Quick Permissions Summary Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                Your Granted Permissions ({role?.toUpperCase()})
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                Assigned capabilities governing supplier approvals, user role modifications, and system auditing:
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(user?.permissions || ['supplier.view', 'supplier.approve', 'user.view', 'role.assign', 'report.revenue']).map(p => (
                  <span key={p} style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#333F70',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓ {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 2: SUPPLIER COMPLIANCE & APPROVALS */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'suppliers' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                  Supplier Compliance & Approvals
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  Review supplier applications, verify trade licenses, and issue approvals
                </p>
              </div>
              {!hasPermission('supplier.approve') && (
                <span style={{ padding: '6px 14px', borderRadius: '8px', background: '#FEF3C7', color: '#B45309', fontSize: '12px', fontWeight: '700' }}>
                  <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> View-Only (Requires supplier.approve)
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <th style={{ padding: '14px 16px' }}>ID & Type</th>
                    <th style={{ padding: '14px 16px' }}>Business / Legal Identity</th>
                    <th style={{ padding: '14px 16px' }}>Contact Person</th>
                    <th style={{ padding: '14px 16px' }}>Email & Phone</th>
                    <th style={{ padding: '14px 16px' }}>Tax / Reg ID</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px' }}>Documents</th>
                    <th style={{ padding: '14px 16px' }}>Lifecycle Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map(s => {
                    const isInd = s.account_type === 'individual';
                    const statusColorMap = {
                      approved: { bg: '#D6F5EE', text: '#0D9488' },
                      under_review: { bg: '#FEF3C7', text: '#D97706' },
                      pending: { bg: '#E0E7FF', text: '#4338CA' },
                      documents_required: { bg: '#FFEDD5', text: '#C2410C' },
                      suspended: { bg: '#FEE2E2', text: '#DC2626' },
                      blocked: { bg: '#450A0A', text: '#F87171' },
                      rejected: { bg: '#FEE2E2', text: '#991B1B' }
                    };
                    const badge = statusColorMap[s.status] || { bg: '#F1F5F9', text: '#64748B' };

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '800', color: '#0F172A' }}>#{s.id}</div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            backgroundColor: isInd ? '#EEF2FF' : '#F0FDF4',
                            color: isInd ? '#4F46E5' : '#16A34A'
                          }}>
                            {isInd ? <User size={11} /> : <Building2 size={11} />}
                            {isInd ? 'Individual' : 'Corporate'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: '800', color: '#0F172A' }}>
                            {isInd ? (s.legal_name || s.display_name || s.company_name) : s.company_name}
                          </div>
                          {isInd && s.display_name && (
                            <div style={{ fontSize: '11px', color: '#4F46E5' }}>Display: {s.display_name}</div>
                          )}
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{s.city}, {s.country}</div>
                        </td>
                        <td style={{ padding: '16px', color: '#334155' }}>
                          {s.contact_person || `${s.first_name} ${s.last_name}`}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ color: '#0F172A', fontWeight: '600' }}>{s.email}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{s.phone}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                            {isInd ? (s.trade_license_no || 'PAN/Gov ID') : (s.tax_registration_no || s.trade_license_no || 'GST/Reg')}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            background: badge.bg,
                            color: badge.text
                          }}>
                            {s.status.replace('_', ' ')}
                          </span>
                          {s.approval_notes && (
                            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', maxWidth: '140px' }} title={s.approval_notes}>
                              {s.approval_notes.length > 25 ? s.approval_notes.substring(0, 25) + '...' : s.approval_notes}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => setDocReviewSupplier(s)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1.5px solid #0D9488',
                              backgroundColor: '#F0FDFA',
                              color: '#0D9488',
                              fontWeight: '800',
                              fontSize: '12px',
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(13, 148, 136, 0.1)'
                            }}
                          >
                            <FileText size={13} />
                            {s.documents?.length || 0} Docs
                            {(s.documents?.filter(d => d.status === 'pending') || []).length > 0 && (
                              <span style={{
                                backgroundColor: '#F59E0B',
                                color: '#FFFFFF',
                                borderRadius: '9999px',
                                padding: '1px 6px',
                                fontSize: '10px',
                                fontWeight: '900'
                              }}>
                                {(s.documents.filter(d => d.status === 'pending')).length} new
                              </span>
                            )}
                          </button>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setDocReviewSupplier(s)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: '#F1F5F9',
                                color: '#334155',
                                border: '1px solid #CBD5E1',
                                fontWeight: '700',
                                fontSize: '11px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={12} /> Inspect
                            </button>

                            {hasPermission('supplier.approve') && (
                              <>
                                {s.status !== 'approved' && (
                                  <button
                                    onClick={() => { setActionSupplier(s); setActionType('approve'); setActionNote('All business and KYC credentials verified'); }}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      background: '#D6F5EE',
                                      color: '#0D9488',
                                      border: 'none',
                                      fontWeight: '700',
                                      fontSize: '11px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Approve
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setStatusModalSupplier(s);
                                    setStatusTarget('documents_required');
                                    setStatusNotes('Additional identity/registration proof required');
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    background: '#FFEDD5',
                                    color: '#C2410C',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '11px',
                                    cursor: 'pointer'
                                  }}
                                  title="Request additional compliance documents"
                                >
                                  Docs Req
                                </button>

                                {s.status === 'approved' && (
                                  <button
                                    onClick={() => {
                                      setStatusModalSupplier(s);
                                      setStatusTarget('suspended');
                                      setStatusNotes('Account suspended pending compliance review');
                                    }}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      background: '#FEE2E2',
                                      color: '#DC2626',
                                      border: 'none',
                                      fontWeight: '700',
                                      fontSize: '11px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Suspend
                                  </button>
                                )}

                                {(s.status === 'suspended' || s.status === 'blocked') && (
                                  <button
                                    onClick={() => handleOpenAffectedBookings(s)}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      background: '#FEF3C7',
                                      color: '#B45309',
                                      border: '1px solid #FCD34D',
                                      fontWeight: '800',
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="View affected bookings and reassign"
                                  >
                                    <RotateCcw size={11} /> Reassign
                                  </button>
                                )}

                                {s.status !== 'rejected' && s.status !== 'approved' && (
                                  <button
                                    onClick={() => { setActionSupplier(s); setActionType('reject'); setActionNote('Incomplete registration or invalid credentials'); }}
                                    style={{
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      background: '#F1F5F9',
                                      color: '#DC2626',
                                      border: '1px solid #FECACA',
                                      fontWeight: '700',
                                      fontSize: '11px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Reject
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB: CUSTOM TAXONOMY & ADD-ONS (SECTIONS 3.1 - 3.4) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'taxonomy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Custom Sub-Categories */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                    Custom Sub-Categories (Moderation Queue)
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    Suppliers entered custom sub-categories via the "Other" option. Approve for supplier or elevate to the Platform Catalog.
                  </p>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', fontSize: '12px', fontWeight: '700' }}>
                  Total: {customTaxonomy.customSubcategories?.length || 0}
                </span>
              </div>

              {(!customTaxonomy.customSubcategories || customTaxonomy.customSubcategories.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B', border: '1px dashed #CBD5E1', borderRadius: '14px' }}>
                  No custom sub-categories submitted yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Main Category</th>
                        <th style={{ padding: '12px 16px' }}>Proposed Sub-Category</th>
                        <th style={{ padding: '12px 16px' }}>Submitted By</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Submitted At</th>
                        <th style={{ padding: '12px 16px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customTaxonomy.customSubcategories.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0F172A' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#333F70', fontSize: '12px' }}>
                              {item.main_category_name || `Cat #${item.main_category_id}`}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: '800', color: '#0D9488', fontSize: '14px' }}>
                            {item.name}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#334155' }}>
                            {item.company_name} (ID #{item.supplier_id})
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: '800',
                              textTransform: 'uppercase',
                              backgroundColor: item.status === 'approved' ? '#D6F5EE' : item.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                              color: item.status === 'approved' ? '#0D9488' : item.status === 'rejected' ? '#DC2626' : '#B45309'
                            }}>
                              {item.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px' }}>
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {item.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleReviewCustomSubcategory(item.id, 'approved', true)}
                                  disabled={reviewingTaxId === item.id}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#0D9488',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    cursor: 'pointer'
                                  }}
                                  title="Approve and make available platform-wide"
                                >
                                  + Add to Catalog
                                </button>
                                <button
                                  onClick={() => handleReviewCustomSubcategory(item.id, 'approved', false)}
                                  disabled={reviewingTaxId === item.id}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#E0E7FF',
                                    color: '#4338CA',
                                    border: 'none',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                  title="Approve for this supplier only"
                                >
                                  Approve Only
                                </button>
                                <button
                                  onClick={() => handleReviewCustomSubcategory(item.id, 'rejected', false)}
                                  disabled={reviewingTaxId === item.id}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FEE2E2',
                                    color: '#DC2626',
                                    border: 'none',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Reviewed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Custom Services & Add-ons */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                    Custom Services / Activity Offerings
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    Custom activity titles requested when predefined options were unavailable.
                  </p>
                </div>
                <span style={{ padding: '6px 12px', borderRadius: '8px', background: '#F1F5F9', color: '#334155', fontSize: '12px', fontWeight: '700' }}>
                  Total: {customTaxonomy.customServices?.length || 0}
                </span>
              </div>

              {(!customTaxonomy.customServices || customTaxonomy.customServices.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748B', border: '1px dashed #CBD5E1', borderRadius: '14px' }}>
                  No custom service titles submitted.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Service Name</th>
                        <th style={{ padding: '12px 16px' }}>Supplier</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px' }}>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customTaxonomy.customServices.map(srv => (
                        <tr key={srv.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0F172A' }}>{srv.name}</td>
                          <td style={{ padding: '12px 16px', color: '#334155' }}>{srv.company_name} (ID #{srv.supplier_id})</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: '800' }}>
                              {srv.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748B', fontSize: '12px' }}>
                            {new Date(srv.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 3: USER ACCOUNTS & ROLE ASSIGNMENT (ADMIN ROLE CONTROL) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>
                  Platform User Directory & Role Assignment
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                  Only authorized Site Admins can change user roles here. Promote users to Site Admin, Supplier, or Customer.
                </p>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Filter by name, email, or role..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#FAFAF8'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <th style={{ padding: '14px 16px' }}>User Details</th>
                    <th style={{ padding: '14px 16px' }}>Email</th>
                    <th style={{ padding: '14px 16px' }}>Account Type</th>
                    <th style={{ padding: '14px 16px' }}>Segment</th>
                    <th style={{ padding: '14px 16px' }}>Current Role</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px' }}>Admin Role Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A' }}>{u.first_name} {u.last_name}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>ID: #{u.id}</div>
                      </td>
                      <td style={{ padding: '16px', color: '#334155', fontWeight: '600' }}>{u.email}</td>
                      <td style={{ padding: '16px', textTransform: 'capitalize', color: '#64748B' }}>
                        {u.account_type || 'individual'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F1F5F9', fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                          {u.customer_segment || 'retail'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          background: u.role_slug === 'site_admin' ? '#D6F5EE' : u.role_slug === 'supplier' ? '#E0E7FF' : '#F1F5F9',
                          color: u.role_slug === 'site_admin' ? '#0D9488' : u.role_slug === 'supplier' ? '#4338CA' : '#475569'
                        }}>
                          {u.role_slug}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: u.status === 'active' ? '#059669' : '#D97706' }}>
                          ● {u.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {hasPermission('role.assign') ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select
                              value={u.role_slug}
                              onChange={(e) => handleAssignRole(u.id, e.target.value)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1.5px solid #CBD5E1',
                                background: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: '#0F172A',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="site_admin">Site Admin (Full Access)</option>
                              <option value="site_accountant">Site Accountant</option>
                              <option value="finance">Finance Specialist</option>
                              <option value="supplier">Supplier Partner</option>
                              <option value="customer">Customer</option>
                            </select>

                            {u.role_slug !== 'site_admin' && (
                              <button
                                onClick={() => handleAssignRole(u.id, 'site_admin')}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: '#333F70',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                                title="Promote this user directly to Site Admin"
                              >
                                Make Admin
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>No Role Authority</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 4: RBAC MATRIX */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'roles' && (
          <div>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)',
              marginBottom: '32px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                System Roles & Granted Capabilities Matrix
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
                Defined in relational <code>roles</code> and mapped through <code>role_permissions</code>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {roles.map(r => (
                  <div key={r.id} style={{
                    padding: '22px',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    background: '#FAFAF8'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>{r.name}</h4>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#E2E8F0', fontSize: '11px', fontWeight: '800', color: '#334155' }}>
                        {r.slug}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
                      {r.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {r.permissions?.map(p => (
                        <span key={p.id} style={{
                          fontSize: '11px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#333F70',
                          fontFamily: 'monospace',
                          fontWeight: '600'
                        }}>
                          {p.slug}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions list */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid rgba(15, 23, 42, 0.08)',
              boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                All System Permissions ({permissions.length})
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
                Defined in relational <code>permissions</code> table
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      <th style={{ padding: '12px 16px' }}>Module</th>
                      <th style={{ padding: '12px 16px' }}>Permission Name</th>
                      <th style={{ padding: '12px 16px' }}>Slug</th>
                      <th style={{ padding: '12px 16px' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#F1F5F9', fontSize: '11px', fontWeight: '700' }}>
                            {p.module}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A' }}>{p.name}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#333F70' }}>{p.slug}</td>
                        <td style={{ padding: '12px 16px', color: '#64748B' }}>{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TAB 5: AUDIT TRAIL */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 10px 30px -5px rgba(51, 63, 112, 0.05)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              System Activity & Audit Trail
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
              Captured securely from <code>activity_logs</code> table
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    <th style={{ padding: '12px 16px' }}>Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                    <th style={{ padding: '12px 16px' }}>User</th>
                    <th style={{ padding: '12px 16px' }}>Entity</th>
                    <th style={{ padding: '12px 16px' }}>Description</th>
                    <th style={{ padding: '12px 16px' }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#E0E7FF', color: '#4338CA', fontSize: '11px', fontWeight: '800' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0F172A' }}>
                        {log.user_email || 'System'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>
                        {log.entity_type} #{log.entity_id || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        {log.description}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Decision Modal */}
      {actionSupplier && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '36px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
          }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              {actionType === 'approve' ? 'Approve Supplier Application' : 'Reject Supplier Application'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              Company: <strong style={{ color: '#0F172A' }}>{actionSupplier.company_name}</strong>
            </p>

            <form onSubmit={handleSupplierDecision}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  {actionType === 'approve' ? 'Approval Notes / Verification Remarks' : 'Rejection Reason (Dispatched to Partner)'}
                </label>
                <textarea
                  required
                  value={actionNote}
                  onChange={e => setActionNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    minHeight: '100px',
                    outline: 'none',
                    background: '#FAFAF8'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: actionType === 'approve' ? '#0D9488' : '#EF4444',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : (actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection')}
                </button>
                <button
                  type="button"
                  onClick={() => setActionSupplier(null)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KYC Documents Inspection & Verification Modal */}
      {docReviewSupplier && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '860px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.3)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FAFAF8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Compliance & Verification Portal
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                  KYC Documents: {docReviewSupplier.company_name}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>Partner ID: <strong>#{docReviewSupplier.id}</strong></span>
                  <span>Contact: <strong>{docReviewSupplier.contact_person || `${docReviewSupplier.first_name} ${docReviewSupplier.last_name}`}</strong></span>
                  <span>Trade License: <strong>{docReviewSupplier.trade_license_no || 'N/A'}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setDocReviewSupplier(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(!docReviewSupplier.documents || docReviewSupplier.documents.length === 0) ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 20px',
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: '16px',
                  color: '#64748B'
                }}>
                  <FileText size={38} style={{ color: '#94A3B8', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '800', color: '#0F172A' }}>No Documents Uploaded Yet</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>This supplier has not submitted any KYC files.</div>
                </div>
              ) : (
                docReviewSupplier.documents.map((doc) => {
                  const ext = doc.document_url?.split('.').pop()?.toUpperCase() || 'FILE';
                  const isImg = ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext);
                  const isPdf = ext === 'PDF';
                  const isDoc = ['DOC', 'DOCX'].includes(ext);
                  const fullUrl = doc.document_url?.startsWith('http') ? doc.document_url : `http://localhost:5000${doc.document_url}`;

                  return (
                    <div
                      key={doc.id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '16px',
                        border: `1.5px solid ${doc.status === 'approved' ? '#BBF7D0' : doc.status === 'rejected' ? '#FECACA' : '#E2E8F0'}`,
                        backgroundColor: doc.status === 'approved' ? '#F0FDF4' : doc.status === 'rejected' ? '#FFF5F5' : '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '800',
                              backgroundColor: '#EEF2FF',
                              color: '#4338CA'
                            }}>
                              {doc.document_type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span style={{
                              padding: '2px 7px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '900',
                              backgroundColor: isPdf ? '#FEE2E2' : isDoc ? '#DBEAFE' : '#DCFCE7',
                              color: isPdf ? '#DC2626' : isDoc ? '#2563EB' : '#16A34A'
                            }}>
                              {ext}
                            </span>
                            {doc.file_size && (
                              <span style={{ fontSize: '11px', color: '#64748B' }}>
                                ({(doc.file_size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginTop: '6px' }}>
                            {doc.document_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            Uploaded on: {new Date(doc.uploaded_at).toLocaleString()}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '5px 12px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: '850',
                            textTransform: 'uppercase',
                            backgroundColor: doc.status === 'approved' ? '#D6F5EE' : doc.status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
                            color: doc.status === 'approved' ? '#0D9488' : doc.status === 'rejected' ? '#DC2626' : '#B45309'
                          }}>
                            {doc.status}
                          </span>
                        </div>
                      </div>

                      {/* Image Preview Thumbnail if Image */}
                      {isImg && (
                        <div style={{ marginTop: '4px' }}>
                          <a href={fullUrl} target="_blank" rel="noreferrer" title="Click to view full image">
                            <img
                              src={fullUrl}
                              alt={doc.document_name}
                              style={{
                                maxHeight: '140px',
                                maxWidth: '280px',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                border: '1px solid #CBD5E1',
                                display: 'block'
                              }}
                            />
                          </a>
                        </div>
                      )}

                      {/* Rejection Notice if rejected */}
                      {doc.status === 'rejected' && doc.rejection_reason && (
                        <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', fontWeight: '600' }}>
                          Reason: {doc.rejection_reason}
                        </div>
                      )}

                      {/* Document Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: '750',
                            textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={13} /> Open / Download File
                        </a>

                        {hasPermission('supplier.approve') && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {doc.status !== 'approved' && (
                              <button
                                onClick={() => handleVerifyDocument(docReviewSupplier.id, doc.id, 'approved')}
                                disabled={verifyingDocId === doc.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: '#0D9488',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                {verifyingDocId === doc.id ? <Loader2 size={13} className="animate-spin" /> : <><Check size={13} /> Approve Document</>}
                              </button>
                            )}

                            {doc.status !== 'rejected' && (
                              <button
                                onClick={() => {
                                  const reason = prompt('Please enter the reason for rejecting this document:');
                                  if (reason && reason.trim()) {
                                    handleVerifyDocument(docReviewSupplier.id, doc.id, 'rejected', reason.trim());
                                  }
                                }}
                                disabled={verifyingDocId === doc.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: '#FEE2E2',
                                  border: 'none',
                                  color: '#DC2626',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  cursor: 'pointer'
                                }}
                              >
                                <X size={13} /> Reject Document
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '18px 28px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FAFAF8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Total Documents: <strong>{docReviewSupplier.documents?.length || 0}</strong> •
                Approved: <strong style={{ color: '#0D9488' }}>{docReviewSupplier.documents?.filter(d => d.status === 'approved').length || 0}</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setDocReviewSupplier(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '750',
                    cursor: 'pointer'
                  }}
                >
                  Close Inspection
                </button>

                {hasPermission('supplier.approve') && docReviewSupplier.status !== 'approved' && (
                  <button
                    onClick={() => {
                      const supp = docReviewSupplier;
                      setDocReviewSupplier(null);
                      setActionSupplier(supp);
                      setActionType('approve');
                      setActionNote('All uploaded KYC files inspected and approved');
                    }}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#0D9488',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)'
                    }}
                  >
                    <CheckCircle2 size={15} /> Finalize Supplier Approval
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Lifecycle / Status Change Modal (Documents Required / Suspended) */}
      {statusModalSupplier && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Update Supplier Lifecycle Status
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              Supplier: <strong style={{ color: '#0F172A' }}>{statusModalSupplier.company_name || statusModalSupplier.legal_name}</strong> (#{statusModalSupplier.id})
            </p>

            <form onSubmit={handleUpdateSupplierStatus}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Target Lifecycle Status
                </label>
                <select
                  value={statusTarget}
                  onChange={e => setStatusTarget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: '700',
                    outline: 'none',
                    background: '#FAFAF8'
                  }}
                >
                  <option value="documents_required">Documents Required (Request Missing Proofs)</option>
                  <option value="suspended">Suspended (Temporarily Halt Bookings & Activities)</option>
                  <option value="blocked">Blocked (Permanently Terminate Account)</option>
                  <option value="under_review">Under Review (Compliance Verification In-Progress)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                  Admin Remarks / Instructions (Dispatched to Supplier)
                </label>
                <textarea
                  required
                  rows={4}
                  value={statusNotes}
                  onChange={e => setStatusNotes(e.target.value)}
                  placeholder="e.g. Please upload updated address proof and bank statement..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#FAFAF8'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={statusLoading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: statusTarget === 'suspended' || statusTarget === 'blocked' ? '#DC2626' : '#C2410C',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {statusLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Status Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setStatusModalSupplier(null)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Affected Bookings & Reassignment Modal (Section 26.1) */}
      {affectedModalSupplier && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.3)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FAFAF8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#DC2626', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Suspension Protocol • Section 26.1
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '2px 0 0' }}>
                  Affected Bookings: {affectedModalSupplier.company_name}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Total Active Bookings Affected: <strong>{affectedData.bookings?.length || 0}</strong>
                </div>
              </div>
              <button
                onClick={() => setAffectedModalSupplier(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
              {loadingAffected ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                  Loading affected reservations...
                </div>
              ) : (!affectedData.bookings || affectedData.bookings.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', border: '1.5px dashed #CBD5E1', borderRadius: '16px', color: '#64748B' }}>
                  <CheckCircle2 size={38} style={{ color: '#0D9488', marginBottom: '8px' }} />
                  <div style={{ fontWeight: '800', color: '#0F172A' }}>No Active Bookings Affected</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>This supplier does not have any pending or confirmed bookings requiring reassignment.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {affectedData.bookings.map(b => (
                    <div
                      key={b.id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '16px',
                        border: '1.5px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '15px' }}>
                            Ref #{b.booking_reference || b.id}
                          </span>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: '800' }}>
                            {b.booking_status?.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0D9488', marginTop: '4px' }}>
                          {b.activity_title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          Customer: <strong>{b.first_name} {b.last_name}</strong> ({b.email}) • Amount: <strong>₹{parseFloat(b.total_amount || 0).toLocaleString()}</strong>
                        </div>
                      </div>

                      {/* Reassign select & button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                          value={reassignSupplierId[b.id] || ''}
                          onChange={e => setReassignSupplierId({ ...reassignSupplierId, [b.id]: e.target.value })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1.5px solid #CBD5E1',
                            fontSize: '12px',
                            fontWeight: '700',
                            outline: 'none',
                            background: '#FFFFFF'
                          }}
                        >
                          <option value="">Select Replacement Supplier...</option>
                          {affectedData.replacementSuppliers?.map(rep => (
                            <option key={rep.id} value={rep.id}>
                              {rep.company_name} ({rep.city || 'Approved'})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleReassignBooking(b.id)}
                          disabled={reassignLoadingId === b.id || !reassignSupplierId[b.id]}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#333F70',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '800',
                            cursor: 'pointer'
                          }}
                        >
                          {reassignLoadingId === b.id ? <Loader2 size={13} className="animate-spin" /> : 'Reassign'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 28px', borderTop: '1px solid #E2E8F0', backgroundColor: '#FAFAF8', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAffectedModalSupplier(null)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '750',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
