'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useToast } from '../../components/Toast';
import { KeyRound, Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [mode, setMode] = useState('request'); // 'request' | 'reset'
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const qToken = searchParams.get('token');
    const qEmail = searchParams.get('email');
    if (qToken) {
      setToken(qToken);
      setMode('reset');
    }
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        addToast('Password reset link has been dispatched to your email!', 'success');
        setSubmitted(true);
        if (res.data?.resetToken) {
          // In development mode, auto switch to reset with token for easy demo
          setToken(res.data.resetToken);
        }
      } else {
        addToast(res.message || 'Request failed', 'error');
      }
    } catch {
      addToast('Network error during password reset request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword({ token, password });
      if (res.success) {
        addToast('Password updated successfully! Please log in.', 'success');
        router.push('/customer/login');
      } else {
        addToast(res.message || 'Failed to reset password', 'error');
      }
    } catch {
      addToast('Network error updating password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '480px', paddingTop: '60px', paddingBottom: '60px' }}>
      <div className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f87171',
            margin: '0 auto 16px auto'
          }}>
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>
            {mode === 'reset' ? 'Set New Password' : 'Reset Password'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {mode === 'reset'
              ? 'Enter your new credentials to regain access'
              : 'Enter your registered email to receive recovery instructions'}
          </p>
        </div>

        {mode === 'request' ? (
          submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle2 size={40} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Reset Link Dispatched</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '10px 0 24px 0' }}>
                If an account exists for <strong>{email}</strong>, a password reset link has been generated.
              </p>
              {token && (
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Continue with Demo Token <ArrowRight size={16} />
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleRequestReset}>
              <div className="form-group">
                <label className="form-label">Account Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send Reset Instructions <ArrowRight size={16} /></>}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSetNewPassword}>
            <div className="form-group">
              <label className="form-label">Recovery Token</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                required
                value={token}
                onChange={e => setToken(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Update Password & Sign In <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Remembered your password?{' '}
          <Link href="/customer/login" style={{ color: '#818cf8', fontWeight: '600' }}>
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading password recovery form...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
