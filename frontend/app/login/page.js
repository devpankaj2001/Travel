'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { useToast } from '../../components/Toast';
import {
  Compass,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';

export default function UnifiedLoginPage() {
  const router = useRouter();
  const { updateUserState } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('Please enter both your email address and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.login({
        email: email.trim(),
        password
      });

      if (res.success && res.data) {
        const { user, role, redirectTo } = res.data;
        updateUserState(user);

        const roleLabel = role === 'site_admin' ? 'Administrator'
          : role === 'supplier' ? 'Supplier Partner'
          : role === 'accountant' || role === 'site_accountant' || role === 'finance' ? 'Finance & Accounts'
          : 'Customer';

        addToast(`🎉 Welcome back, ${user.first_name || 'User'}! Logged in as ${roleLabel}.`, 'success');

        // Dynamic Role-Based Redirection
        let destination = redirectTo;
        if (!destination) {
          if (role === 'supplier') {
            destination = '/supplier/dashboard';
          } else if (['site_admin', 'admin', 'accountant', 'site_accountant', 'finance'].includes(role)) {
            destination = '/admin/dashboard';
          } else {
            destination = '/customer/profile';
          }
        }

        setTimeout(() => {
          router.push(destination);
        }, 300);
      } else {
        addToast(res.message || 'Invalid credentials. Please try again.', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Login failed. Please verify your email and password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    const origHeight = document.body.style.height;
    if (window.innerWidth >= 900) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    }
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
      } else {
        document.body.style.overflow = origOverflow;
        document.body.style.height = origHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.height = origHeight;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{
      height: 'calc(100vh - 114px)',
      display: 'flex',
      backgroundColor: '#FFFFFF',
      fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: 'hidden'
    }}
    className="login-main-container"
    >

      {/* ========================================================================= */}
      {/* 1. LEFT COLUMN: LUXURY SCENIC TRAVEL BANNER (40% WIDTH) */}
      {/* ========================================================================= */}
      <div style={{
        flex: '0 0 40%',
        width: '40%',
        height: '100%',
        position: 'relative',
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 34px 18px',
        color: '#FFFFFF',
        backgroundImage: "url('/assets/images/login_bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden'
      }}
      className="login-left-banner"
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
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#333F70',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D6F5EE',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(214, 245, 238, 0.3)'
            }}>
              <Compass size={22} />
            </div>
            <div>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
                TRAVEL<span style={{ color: '#0D9488' }}>.</span>
              </span>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: '800', color: '#D6F5EE', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Unified Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center Content & Value Badges positioned from top */}
        <div style={{ position: 'relative', zIndex: 2, margin: '28px 0 auto' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(214, 245, 238, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(214, 245, 238, 0.35)',
            color: '#D6F5EE',
            fontSize: '11px',
            fontWeight: '800',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            <Sparkles size={12} /> Multi-Role Portal
          </span>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '900',
            lineHeight: 1.15,
            color: '#FFFFFF',
            letterSpacing: '-0.8px',
            margin: '0 0 10px',
            textShadow: '0 4px 18px rgba(0, 0, 0, 0.5)'
          }}>
            Partner &amp; Member<br />Login
          </h1>

          <p style={{
            fontSize: '13.5px',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.92)',
            maxWidth: '440px',
            margin: '0 0 18px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
          }}>
            Access your company dashboard, manage your bookings &amp; inventory, and track your business in real-time.
          </p>

          {/* 4 Feature Pills matching user's reference image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', maxWidth: '360px' }}>
            {[
              { icon: TrendingUp, text: 'Track sales & orders' },
              { icon: Users, text: 'Manage your team & inventory' },
              { icon: ShieldCheck, text: 'Exclusive partner rates & payouts' },
              { icon: Zap, text: 'Grow your business' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.35)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#0D9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.4)'
                  }}>
                    <Icon size={14} strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '750', color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{ position: 'relative', zIndex: 2, fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>
          &copy; {new Date().getFullYear()} TRAVEL Inc. Secure 256-Bit SSL Unified Access.
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIGHT COLUMN: UNIFIED LOGIN FORM (60% WIDTH, AUTO-ROLE DETECTION) */}
      {/* ========================================================================= */}
      <div style={{
        flex: '0 0 60%',
        width: '60%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 24px',
        backgroundColor: '#FAFAF8',
        height: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '28px 36px',
          boxShadow: '0 20px 48px -12px rgba(51, 63, 112, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)',
          border: '1px solid #E2E8F0',
          boxSizing: 'border-box'
        }}>

          {/* Header matching Reference Image */}
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{
              fontSize: '26px',
              fontWeight: '900',
              color: '#0F172A',
              letterSpacing: '-0.5px',
              margin: '0 0 4px'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#64748B',
              margin: 0,
              fontWeight: '550'
            }}>
              Login to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* Email Address */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: '750',
                color: '#334155',
                marginBottom: '5px'
              }}>
                Email Address
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ position: 'absolute', left: '13px', color: '#94A3B8' }}>
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'all 0.2s ease',
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
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12.5px',
                fontWeight: '750',
                color: '#334155',
                marginBottom: '5px'
              }}>
                Password
              </label>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ position: 'absolute', left: '13px', color: '#94A3B8' }}>
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'all 0.2s ease',
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row matching reference image */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                cursor: 'pointer',
                color: '#475569',
                fontWeight: '650'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '15px',
                    height: '15px',
                    accentColor: '#0D9488',
                    cursor: 'pointer'
                  }}
                />
                Remember me
              </label>

              <Link
                href="/reset-password"
                style={{
                  color: '#0D9488',
                  fontWeight: '750',
                  textDecoration: 'none'
                }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Prominent Login Button matching deep teal reference */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#0D9488',
                color: '#FFFFFF',
                fontSize: '14.5px',
                fontWeight: '850',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '2px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#047857';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(13, 148, 136, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0D9488';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(13, 148, 136, 0.3)';
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link matching Reference Image */}
          <div style={{
            marginTop: '18px',
            textAlign: 'center',
            fontSize: '12.5px',
            color: '#64748B'
          }}>
            <span>New Partner? </span>
            <Link
              href="/become-a-supplier"
              style={{
                color: '#0D9488',
                fontWeight: '800',
                textDecoration: 'none'
              }}
            >
              Become a Supplier
            </Link>
            <span style={{ margin: '0 8px', color: '#CBD5E1' }}>•</span>
            <Link
              href="/customer/signup"
              style={{
                color: '#333F70',
                fontWeight: '750',
                textDecoration: 'none'
              }}
            >
              Register
            </Link>
          </div>

        </div>
      </div>

      {/* Responsive Style to display left banner on medium+ screens and prevent body scroll */}
      <style jsx global>{`
        @media (min-width: 900px) {
          .login-main-container {
            height: calc(100vh - 114px) !important;
          }
          .login-left-banner {
            display: flex !important;
            height: 100% !important;
            min-height: 100% !important;
          }
          html, body {
            overflow: hidden !important;
            height: 100vh !important;
          }
        }
        @media (max-width: 899px) {
          .login-main-container {
            height: auto !important;
            min-height: calc(100vh - 114px) !important;
          }
          html, body {
            overflow: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
