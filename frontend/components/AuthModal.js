'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { useToast } from './Toast';
import {
  X,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  FileText,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function AuthModal({ isOpen = true, onClose, initialRole = 'customer', initialMode = 'signin', isPage = false }) {
  const router = useRouter();
  const { updateUserState } = useAuth();
  const { addToast } = useToast();

  const [activeRole, setActiveRole] = useState(initialRole); // 'customer' | 'supplier'
  const [activeMode, setActiveMode] = useState(initialMode); // 'signin' | 'signup' | 'otp_verify'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockSeconds, setBlockSeconds] = useState(0);

  // Customer Signup Form State
  const [customerForm, setCustomerForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  });

  // Supplier Signup Form State
  const [supplierForm, setSupplierForm] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    city: '',
    country: 'India',
    trade_license: '',
    password: ''
  });

  // Signin Form State (Common)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  // OTP State
  const [otpData, setOtpData] = useState({
    email: '',
    phone: '',
    code: '',
    demo_otp: null
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (isPage) {
      router.push('/');
    }
  };

  // Countdown timer for 10-minute block
  useEffect(() => {
    if (!isBlocked || blockSeconds <= 0) return;
    const interval = setInterval(() => {
      setBlockSeconds((prev) => {
        if (prev <= 1) {
          setIsBlocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBlocked, blockSeconds]);

  // Sync initial props whenever modal opens
  useEffect(() => {
    if (isOpen || isPage) {
      setActiveRole(initialRole);
      setActiveMode(initialMode);
      setErrorMsg('');
    }
  }, [isOpen, isPage, initialRole, initialMode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (isOpen || isPage)) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPage, onClose]);

  if (!isOpen && !isPage) return null;

  // --------------------------------------------------------------------------
  // Handlers: Sign In
  // --------------------------------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let res;
      if (activeRole === 'customer') {
        res = await authService.customerLogin(loginForm);
      } else {
        res = await authService.supplierLogin(loginForm);
      }

      if (res.success) {
        updateUserState(res.data.user);
        addToast(`Welcome back, ${res.data.user.first_name || res.data.user.email}!`, 'success');
        if (onClose) onClose();
        router.push(activeRole === 'customer' ? '/customer/profile' : '/supplier/dashboard');
      } else if (res.requires_verification) {
        addToast(res.message || 'Please complete OTP verification to log in.', 'info');
        if (activeRole === 'customer') {
          setOtpData({
            email: res.email || loginForm.email,
            phone: res.phone || '',
            code: ''
          });
          setActiveMode('otp_verify');
        } else {
          if (onClose) onClose();
          router.push(`/supplier/verify-otp?email=${encodeURIComponent(res.email || loginForm.email)}&phone=${encodeURIComponent(res.phone || '')}`);
        }
      } else {
        setErrorMsg(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Handlers: Customer Signup & OTP Verification
  // --------------------------------------------------------------------------
  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authService.customerSignup(customerForm);
      if (res.success) {
        addToast('Verification code dispatched to both Mobile & Email!', 'success');
        setOtpData({
          email: customerForm.email,
          phone: customerForm.phone,
          code: ''
        });
        setActiveMode('otp_verify');
      } else {
        setErrorMsg(res.message || 'Signup failed. Check details.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCustomerOtp = async (e) => {
    e.preventDefault();
    if (isBlocked) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await authService.customerVerifyOtp({
        email: otpData.email,
        phone: otpData.phone,
        code: otpData.code
      });

      if (res.success) {
        updateUserState(res.data.user);
        addToast('Account verified successfully! Welcome to Travel.', 'success');
        if (onClose) onClose();
        router.push('/customer/profile');
      } else {
        if (res.is_blocked || res.status === 429) {
          setIsBlocked(true);
          setBlockSeconds(600);
        }
        setErrorMsg(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCustomerOtp = async () => {
    if (isBlocked) return;
    try {
      const res = await authService.customerResendOtp({
        email: otpData.email,
        phone: otpData.phone
      });
      if (res.success) {
        addToast('New OTP dispatched to Mobile & Email!', 'info');
      } else {
        if (res.is_blocked || res.status === 429) {
          setIsBlocked(true);
          setBlockSeconds(600);
        }
        addToast(res.message || 'Failed to resend OTP', 'error');
      }
    } catch (err) {
      addToast('Error resending OTP', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Handlers: Supplier Signup
  // --------------------------------------------------------------------------
  const handleSupplierSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const names = supplierForm.contact_name.trim().split(' ');
      const first_name = names[0] || 'Supplier';
      const last_name = names.slice(1).join(' ') || 'Admin';

      const res = await authService.supplierSignup({
        company_name: supplierForm.company_name,
        contact_name: supplierForm.contact_name,
        first_name,
        last_name,
        email: supplierForm.email,
        phone: supplierForm.phone,
        city: supplierForm.city,
        country: supplierForm.country,
        trade_license_number: supplierForm.trade_license,
        password: supplierForm.password
      });

      if (res.success) {
        addToast('Supplier registration submitted! Please verify OTP.', 'success');
        if (onClose) onClose();
        router.push(`/supplier/verify-otp?email=${encodeURIComponent(supplierForm.email)}&phone=${encodeURIComponent(supplierForm.phone)}`);
      } else {
        setErrorMsg(res.message || 'Supplier registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={isPage ? {
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      fontFamily: "'Manrope', sans-serif"
    } : {
      position: 'fixed',
      inset: 0,
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '24px',
        width: '100%',
        maxWidth: activeMode === 'signup' && activeRole === 'supplier' ? '600px' : '480px',
        maxHeight: isPage ? 'none' : '90vh',
        overflowY: isPage ? 'visible' : 'auto',
        boxShadow: isPage ? '0 20px 45px -12px rgba(51, 63, 112, 0.12)' : '0 25px 60px -10px rgba(15, 23, 42, 0.35)',
        border: '1.5px solid rgba(51, 63, 112, 0.1)',
        fontFamily: "'Manrope', sans-serif",
        position: 'relative',
        animation: isPage ? 'none' : 'modalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #F1F5F9'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', color: '#0D9488', textTransform: 'uppercase' }}>
              Authentication Portal
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: '2px 0 0' }}>
              {activeMode === 'otp_verify' ? 'Verify Account' : activeMode === 'signin' ? 'Sign In to Your Account' : 'Create an Account'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div style={{
            margin: '16px 24px 0',
            padding: '12px 14px',
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FEE2E2',
            color: '#B91C1C',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode & Role Switcher (Hidden during OTP step) */}
        {activeMode !== 'otp_verify' && (
          <div style={{ padding: '18px 24px 0' }}>
            {/* Primary Role Switcher Pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: '#F1F5F9',
              borderRadius: '14px',
              padding: '4px',
              marginBottom: '14px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveRole('customer'); setErrorMsg(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '11px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeRole === 'customer' ? '#FFFFFF' : 'transparent',
                  color: activeRole === 'customer' ? '#333F70' : '#64748B',
                  boxShadow: activeRole === 'customer' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                <User size={15} /> Customer
              </button>

              <button
                type="button"
                onClick={() => { setActiveRole('supplier'); setErrorMsg(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '11px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: activeRole === 'supplier' ? '#333F70' : 'transparent',
                  color: activeRole === 'supplier' ? '#FFFFFF' : '#64748B',
                  boxShadow: activeRole === 'supplier' ? '0 2px 8px rgba(51,63,112,0.2)' : 'none'
                }}
              >
                <Building2 size={15} /> Supplier / Vendor
              </button>
            </div>

            {/* Sub Tabs: Sign In vs Sign Up */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #F1F5F9',
              marginBottom: '18px'
            }}>
              <button
                type="button"
                onClick={() => { setActiveMode('signin'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: activeMode === 'signin' ? '#333F70' : '#94A3B8',
                  borderBottom: activeMode === 'signin' ? '2.5px solid #333F70' : '2.5px solid transparent',
                  marginBottom: '-2px',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveMode('signup'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  color: activeMode === 'signup' ? '#333F70' : '#94A3B8',
                  borderBottom: activeMode === 'signup' ? '2.5px solid #333F70' : '2.5px solid transparent',
                  marginBottom: '-2px',
                  transition: 'all 0.2s ease'
                }}
              >
                {activeRole === 'customer' ? 'Create Customer Account' : 'Become a Supplier'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Body Contents */}
        <div style={{ padding: activeMode === 'otp_verify' ? '24px' : '0 24px 24px' }}>

          {/* ========================================================= */}
          {/* 1. SIGN IN FORM (CUSTOMER OR SUPPLIER) */}
          {/* ========================================================= */}
          {activeMode === 'signin' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder={activeRole === 'customer' ? 'ananya@demo.com' : 'supplier@demo.com'}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '14px',
                      color: '#1E293B',
                      background: '#F8FAFC',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '12px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '14px',
                      color: '#1E293B',
                      background: '#F8FAFC',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#333F70',
                  color: '#FFFFFF',
                  fontWeight: '750',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)',
                  transition: 'all 0.2s ease',
                  marginTop: '4px'
                }}
              >
                {loading ? 'Authenticating...' : `Sign In as ${activeRole === 'customer' ? 'Customer' : 'Supplier'}`}
                <ArrowRight size={16} />
              </button>

            </form>
          )}

          {/* ========================================================= */}
          {/* 2. CUSTOMER SIGN UP FORM */}
          {/* ========================================================= */}
          {activeMode === 'signup' && activeRole === 'customer' && (
            <form onSubmit={handleCustomerSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya"
                    value={customerForm.first_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma"
                    value={customerForm.last_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
                  <input
                    type="email"
                    required
                    placeholder="ananya@example.com"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Mobile Number (SMS verification)
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Create Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={customerForm.password}
                    onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#333F70',
                  color: '#FFFFFF',
                  fontWeight: '750',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)',
                  marginTop: '4px'
                }}
              >
                {loading ? 'Dispatching OTP...' : 'Register & Get Single OTP'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 3. SUPPLIER REGISTRATION FORM */}
          {/* ========================================================= */}
          {activeMode === 'signup' && activeRole === 'supplier' && (
            <form onSubmit={handleSupplierSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>


              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Company / Entity Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Desert Safaris LLC"
                    value={supplierForm.company_name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Authorized Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={supplierForm.contact_name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, contact_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Business Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@safariadventures.com"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+919876543210"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Operating City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaisalmer / Dubai"
                    value={supplierForm.city}
                    onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                    Trade License / Tax Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TL-2026-98124"
                    value={supplierForm.trade_license}
                    onChange={(e) => setSupplierForm({ ...supplierForm, trade_license: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #E2E8F0',
                      fontSize: '13px',
                      background: '#F8FAFC',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Portal Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Set strong management password"
                  value={supplierForm.password}
                  onChange={(e) => setSupplierForm({ ...supplierForm, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #E2E8F0',
                    fontSize: '13px',
                    background: '#F8FAFC',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#0D9488',
                  color: '#FFFFFF',
                  fontWeight: '750',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                  marginTop: '4px'
                }}
              >
                {loading ? 'Submitting Application...' : 'Register Company & Verify Contact'}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* 4. CUSTOMER SINGLE OTP VERIFICATION STEP */}
          {/* ========================================================= */}
          {activeMode === 'otp_verify' && (
            <form onSubmit={handleVerifyCustomerOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '16px',
                  background: '#D6F5EE',
                  color: '#0D9488',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', margin: '0 0 6px' }}>
                  Single Code Dispatched
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                  Enter the 6-digit verification code sent to <strong>{otpData.phone}</strong> and <strong>{otpData.email}</strong>.
                </p>
              </div>


              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#475569', textTransform: 'uppercase', textAlign: 'center', marginBottom: '8px' }}>
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="• • • • • •"
                  value={otpData.code}
                  onChange={(e) => setOtpData({ ...otpData, code: e.target.value.trim() })}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: '2px solid #CBD5E1',
                    fontSize: '24px',
                    fontWeight: '800',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    letterSpacing: '0.4em',
                    color: '#1E293B',
                    background: '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpData.code.length < 6 || isBlocked}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isBlocked ? '#94A3B8' : '#333F70',
                  color: '#FFFFFF',
                  fontWeight: '750',
                  fontSize: '14px',
                  cursor: loading || otpData.code.length < 6 || isBlocked ? 'not-allowed' : 'pointer',
                  opacity: loading || otpData.code.length < 6 || isBlocked ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isBlocked ? 'none' : '0 4px 14px rgba(51, 63, 112, 0.25)'
                }}
              >
                {loading ? (
                  'Verifying Code...'
                ) : isBlocked ? (
                  `Account Blocked (${Math.floor(blockSeconds / 60)}:${(blockSeconds % 60).toString().padStart(2, '0')})`
                ) : (
                  <>Verify OTP & Activate Account <CheckCircle2 size={16} /></>
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <button
                  type="button"
                  onClick={handleResendCustomerOtp}
                  style={{ background: 'none', border: 'none', color: '#0D9488', fontWeight: '750', cursor: 'pointer' }}
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('signup')}
                  style={{ background: 'none', border: 'none', color: '#64748B', fontWeight: '600', cursor: 'pointer' }}
                >
                  Change Details
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
