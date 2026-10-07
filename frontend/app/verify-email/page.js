'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    async function verify() {
      if (!token || !email) {
        setLoading(false);
        setSuccess(false);
        setMessage('Missing token or email parameter in verification URL.');
        return;
      }

      try {
        const res = await authService.supplierVerifyEmail({ token, email });
        setLoading(false);
        if (res.success) {
          setSuccess(true);
          setMessage(res.message || 'Email verified successfully!');
        } else {
          setSuccess(false);
          setMessage(res.message || 'Verification token is invalid or expired.');
        }
      } catch {
        setLoading(false);
        setSuccess(false);
        setMessage('Failed to connect to verification server.');
      }
    }
    verify();
  }, [token, email]);

  return (
    <div className="container" style={{ maxWidth: '480px', paddingTop: '80px', paddingBottom: '60px' }}>
      <div className="glass-card" style={{ textAlign: 'center' }}>
        {loading ? (
          <div>
            <Loader2 size={40} className="animate-spin" style={{ color: '#818cf8', margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Verifying your email...</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Communicating with Booking Platform authentication server...
            </p>
          </div>
        ) : success ? (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Email Verified!</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
              {message}
            </p>
            <Link href="/supplier/login" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
              Proceed to Supplier Login <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <XCircle size={36} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Verification Failed</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
              {message}
            </p>
            <Link href="/supplier/login" className="btn btn-secondary" style={{ width: '100%' }}>
              Back to Supplier Portal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>Verifying email token...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
