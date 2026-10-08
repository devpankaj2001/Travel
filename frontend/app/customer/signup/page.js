'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import {
  Compass,
  User,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Check
} from 'lucide-react';

export default function CustomerSignupPage() {
  const router = useRouter();
  const { updateUserState } = useAuth();
  const { addToast } = useToast();

  // Mode: 'form' | 'otp_verify'
  const [mode, setMode] = useState('form');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    terms_accepted: true
  });

  // OTP Verification State
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);

  // Resend OTP countdown timer
  useEffect(() => {
    if (mode !== 'otp_verify' || resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, resendCooldown]);

  // Handle Form Submission (Step 1)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!form.first_name.trim() || !form.last_name.trim()) {
      addToast('Please enter your full first and last name', 'error');
      return;
    }
    if (!form.email.trim() || !form.phone.trim()) {
      addToast('Please enter your email address and mobile number', 'error');
      return;
    }
    if (form.password.length < 8) {
      addToast('Password must be at least 8 characters long', 'error');
      return;
    }
    if (form.password !== form.confirm_password) {
      addToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }
    if (!form.terms_accepted) {
      addToast('Please accept the Terms of Service to continue', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.customerSignup({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        account_type: 'individual',
        customer_segment: 'retail'
      });

      if (res.success) {
        addToast('Verification code dispatched to both Mobile & Email!', 'success');
        if (res.data?.demo_otp || res.data?.verification?.otpCode) {
          setDemoOtp(res.data.demo_otp || res.data.verification.otpCode);
        }
        setResendCooldown(60);
        setMode('otp_verify');
      } else {
        addToast(res.message || 'Signup failed. Please check your details.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification (Step 2)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      addToast('Please enter the 6-digit OTP code', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.customerVerifyOtp({
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        code: otpCode.trim()
      });

      if (res.success && res.data) {
        updateUserState(res.data.user);
        addToast(`🎉 Account verified successfully! Welcome to Travel, ${res.data.user.first_name}!`, 'success');
        setTimeout(() => {
          router.push('/customer/profile');
        }, 300);
      } else {
        addToast(res.message || 'Invalid verification OTP code.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to verify OTP code.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await authService.customerResendOtp({
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim()
      });
      if (res.success) {
        addToast('New 6-digit verification code dispatched!', 'info');
        if (res.data?.otpCode) {
          setDemoOtp(res.data.otpCode);
        }
        setResendCooldown(60);
      } else {
        addToast(res.message || 'Failed to resend code', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Failed to resend OTP', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#FFFFFF',
      fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>

      {/* ========================================================================= */}
      {/* 1. LEFT COLUMN: LUXURY SCENIC TRAVEL BANNER (40% WIDTH) */}
      {/* ========================================================================= */}
      <div style={{
        flex: '0 0 40%',
        width: '40%',
        minHeight: '100vh',
        position: 'relative',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '44px 38px',
        color: '#FFFFFF',
        backgroundImage: "url('/assets/images/login_bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden'
      }}
      className="signup-left-banner"
      >
        {/* Scenic Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(30, 37, 72, 0.40) 35%, rgba(13, 148, 136, 0.35) 65%, rgba(17, 24, 39, 0.92) 100%)',
          zIndex: 1
        }} />

        {/* Top Brand Logo */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#333F70',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D6F5EE',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(214, 245, 238, 0.3)'
            }}>
              <Compass size={24} />
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                TRAVEL<span style={{ color: '#0D9488' }}>.</span>
              </span>
              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: '800', color: '#D6F5EE', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Traveler Club
              </span>
            </div>
          </Link>
        </div>

        {/* Center Content & Value Badges */}
        <div style={{ position: 'relative', zIndex: 2, margin: 'auto 0 40px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(214, 245, 238, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(214, 245, 238, 0.35)',
            color: '#D6F5EE',
            fontSize: '12px',
            fontWeight: '800',
            marginBottom: '18px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            <Sparkles size={13} /> Member Benefits
          </span>

          <h1 style={{
            fontSize: '36px',
            fontWeight: '900',
            lineHeight: 1.15,
            color: '#FFFFFF',
            letterSpacing: '-0.8px',
            margin: '0 0 16px',
            textShadow: '0 4px 18px rgba(0, 0, 0, 0.5)'
          }}>
            Explore The World<br />With Travel
          </h1>

          <p style={{
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '420px',
            margin: '0 0 32px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
          }}>
            Create your personal traveler account to unlock exclusive member discounts, instant vouchers, and curated activities worldwide.
          </p>

          {/* 4 Feature Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '380px' }}>
            {[
              { icon: Sparkles, text: 'Member-only discounts up to 30%' },
              { icon: Compass, text: 'Instant confirmed booking vouchers' },
              { icon: ShieldCheck, text: '100% verified authentic activities' },
              { icon: CheckCircle2, text: 'Free cancellation on eligible tours' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.35)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#0D9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.4)'
                  }}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: '750', color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
          &copy; {new Date().getFullYear()} TRAVEL Inc. Safe &amp; Verified Traveler Onboarding.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT COLUMN: SPACIOUS SIGNUP / OTP FORM (60% WIDTH) */}
      {/* ========================================================================= */}
      <div style={{
        flex: '0 0 60%',
        width: '60%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        backgroundColor: '#FAFAF8',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '44px 44px',
          boxShadow: '0 20px 48px -12px rgba(51, 63, 112, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
          border: '1px solid #E2E8F0'
        }}>

          {/* ------------------------------------------------------------- */}
          {/* STEP 1: CUSTOMER REGISTRATION FORM */}
          {/* ------------------------------------------------------------- */}
          {mode === 'form' && (
            <>
              {/* Header */}
              <div style={{ marginBottom: '26px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#0D9488',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px'
                }}>
                  Join as a Traveler
                </span>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '900',
                  color: '#0F172A',
                  letterSpacing: '-0.5px',
                  margin: '4px 0 6px'
                }}>
                  Create Your Account
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#64748B',
                  margin: 0,
                  fontWeight: '550'
                }}>
                  Enter your details to register and get immediate booking access
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* 2-Column: First Name + Last Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      First Name *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '14px', color: '#94A3B8' }}>
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya"
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 40px',
                          borderRadius: '12px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sharma"
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '14px', color: '#94A3B8' }}>
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="ananya@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '12px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '750', color: '#334155' }}>
                      Mobile Number *
                    </label>
                    <span style={{ fontSize: '11px', fontWeight: '750', color: '#0D9488' }}>
                      Instant OTP Verification
                    </span>
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '14px', color: '#94A3B8' }}>
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '12px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0F172A',
                        backgroundColor: '#FFFFFF',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* 2-Column: Password + Confirm Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Password *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '14px', color: '#94A3B8' }}>
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 8 chars"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 38px 12px 40px',
                          borderRadius: '12px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8',
                          padding: '4px'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                      Confirm Password *
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '14px', color: '#94A3B8' }}>
                        <Lock size={16} />
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-type password"
                        value={form.confirm_password}
                        onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 38px 12px 40px',
                          borderRadius: '12px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#0F172A',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8',
                          padding: '4px'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '12.5px',
                  color: '#475569',
                  cursor: 'pointer',
                  marginTop: '2px'
                }}>
                  <input
                    type="checkbox"
                    checked={form.terms_accepted}
                    onChange={(e) => setForm({ ...form, terms_accepted: e.target.checked })}
                    style={{
                      width: '17px',
                      height: '17px',
                      marginTop: '2px',
                      accentColor: '#0D9488',
                      cursor: 'pointer'
                    }}
                  />
                  <span>
                    I agree to the <strong style={{ color: '#0F172A' }}>Terms of Service</strong> and <strong style={{ color: '#0F172A' }}>Privacy Policy</strong>.
                  </span>
                </label>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#0D9488',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '850',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(13, 148, 136, 0.3)',
                    transition: 'all 0.2s ease',
                    marginTop: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#047857';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(13, 148, 136, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0D9488';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 148, 136, 0.3)';
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Register &amp; Get Single OTP</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div style={{
                marginTop: '26px',
                textAlign: 'center',
                fontSize: '13px',
                color: '#64748B'
              }}>
                <span>Already have an account? </span>
                <Link
                  href="/login"
                  style={{
                    color: '#0D9488',
                    fontWeight: '800',
                    textDecoration: 'none'
                  }}
                >
                  Log In
                </Link>
                <span style={{ margin: '0 8px', color: '#CBD5E1' }}>•</span>
                <Link
                  href="/supplier/signup"
                  style={{
                    color: '#333F70',
                    fontWeight: '750',
                    textDecoration: 'none'
                  }}
                >
                  Become a Supplier
                </Link>
              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STEP 2: SINGLE OTP VERIFICATION */}
          {/* ------------------------------------------------------------- */}
          {mode === 'otp_verify' && (
            <div>
              {/* Back button */}
              <button
                type="button"
                onClick={() => setMode('form')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '12.5px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  padding: 0
                }}
              >
                <ArrowLeft size={15} /> Back to Edit Details
              </button>

              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: '#D6F5EE',
                  color: '#0D9488',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
                }}>
                  <ShieldCheck size={28} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', margin: '0 0 6px' }}>
                  Verify Your Account
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  We sent a 6-digit verification code to <strong>{form.phone}</strong> and <strong>{form.email}</strong>.
                </p>
              </div>


              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#334155', marginBottom: '8px', textAlign: 'center' }}>
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '12px',
                      border: '2px solid #CBD5E1',
                      fontSize: '24px',
                      fontWeight: '900',
                      textAlign: 'center',
                      letterSpacing: '8px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0D9488';
                      e.target.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#CBD5E1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: otpCode.length === 6 ? '#0D9488' : '#94A3B8',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: '850',
                    cursor: loading || otpCode.length < 6 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: otpCode.length === 6 ? '0 4px 16px rgba(13, 148, 136, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Activate Account</span>
                      <Check size={18} strokeWidth={3} />
                    </>
                  )}
                </button>
              </form>

              {/* Resend OTP */}
              <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                <span>Didn't receive the OTP? </span>
                {resendCooldown > 0 ? (
                  <span style={{ fontWeight: '750', color: '#0D9488' }}>
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0D9488',
                      fontWeight: '800',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Responsive Style */}
      <style jsx>{`
        @media (min-width: 900px) {
          .signup-left-banner {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
