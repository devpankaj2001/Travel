'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import { ShieldCheck, ArrowRight, Loader2, Lock, Mail, Compass } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { updateUserState } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dashboardPath, setDashboardPath] = useState('/admin/dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
      setDashboardPath('/dashboard');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.adminLogin({ email, password });
      if (res.success) {
        addToast(`Authenticated successfully as ${res.data.user.role_name || res.data.user.role}!`, 'success');
        updateUserState(res.data.user);
        router.push(dashboardPath);
      } else {
        addToast(res.message || 'Administrative authentication failed', 'error');
      }
    } catch {
      addToast('Network error connecting to Admin API', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-theme-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAF8', fontFamily: "'Manrope', sans-serif" }}>
      {/* Editorial Header */}
      <header style={{ padding: '24px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(15, 23, 42, 0.06)', background: '#FFFFFF' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#333F70',
            color: '#D6F5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={20} />
          </div>
          <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.1em', color: '#0F172A' }}>TRAVEL</span>
          <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: '#D6F5EE', color: '#0F5146' }}>ADMIN CONSOLE</span>
        </Link>
        <Link href="/" style={{ fontSize: '13px', fontWeight: '700', color: '#333F70', textDecoration: 'none' }}>
          Platform Home →
        </Link>
      </header>

      {/* Main Form Center */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <div className="admin-editorial-card">
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div className="admin-editorial-badge" style={{ marginBottom: '14px' }}>
                <span className="admin-editorial-dot"></span>
                <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#333F70' }}>
                  Enterprise Console
                </span>
              </div>

              <h1 style={{ fontSize: '26px', fontWeight: '850', color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Administrator Login
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px' }}>
                Sign in to manage supplier approvals, user roles, and financial reports
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Administrative Email
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
                  <input
                    type="email"
                    className="admin-input-field"
                    placeholder="admin@bookingplatform.com"
                    required
                    style={{ paddingLeft: '40px' }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Password
                  </label>
                  <Link href="/reset-password" style={{ fontSize: '12px', fontWeight: '700', color: '#0D9488', textDecoration: 'none' }}>
                    Forgot?
                  </Link>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', color: '#94A3B8' }} />
                  <input
                    type="password"
                    className="admin-input-field"
                    placeholder="••••••••••••"
                    required
                    style={{ paddingLeft: '40px' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="admin-btn-primary"
                style={{ marginTop: '6px' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign In to Console <ArrowRight size={16} /></>}
              </button>
            </form>

            <div style={{
              marginTop: '28px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              fontSize: '12px',
              color: '#64748B',
              lineHeight: '1.5'
            }}>
              🔒 <strong>Restricted Access:</strong> Administrator roles can only be granted by an existing Site Administrator. Public registration is closed.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
