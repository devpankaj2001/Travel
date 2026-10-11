'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/Toast';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw, Smartphone, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function CustomerVerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUserState } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qPhone = searchParams.get('phone');
    if (qEmail) setEmail(qEmail);
    if (qPhone) setPhone(qPhone);

    if (typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('pending_customer_email');
      const storedPhone = sessionStorage.getItem('pending_customer_phone');

      if (!qEmail && storedEmail) setEmail(storedEmail);
      if (!qPhone && storedPhone) setPhone(storedPhone);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email && !phone) {
      addToast('Customer email or mobile number is required', 'error');
      return;
    }

    if (!otp || otp.length !== 6) {
      addToast('Please enter the complete 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.customerVerifyOtp({
        email,
        phone,
        code: otp
      });

      if (res.success) {
        addToast(res.message || 'Account activated successfully! Welcome aboard.', 'success');
        if (res.data?.user) {
          updateUserState(res.data.user);
        }
        router.push('/customer/profile');
      } else {
        addToast(res.message || 'OTP verification failed', 'error');
      }
    } catch {
      addToast('Network error during OTP verification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email && !phone) {
      addToast('Email or mobile number is required to resend OTP', 'error');
      return;
    }

    setResending(true);
    try {
      const res = await authService.customerResendOtp({ email, phone });
      if (res.success) {
        addToast('A new OTP has been dispatched to both your Mobile Number & Email!', 'success');
      } else {
        addToast(res.message || 'Failed to resend OTP', 'error');
      }
    } catch {
      addToast('Network error while resending OTP', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: "'Manrope', -apple-system, sans-serif"
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 20px 45px -12px rgba(51, 63, 112, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '100px',
            background: 'rgba(51, 63, 112, 0.08)',
            marginBottom: '14px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0D9488' }}></span>
            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#333F70' }}>
              Direct Activation
            </span>
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Verify Your Account
          </h2>

          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: '1.5' }}>
            The <strong>same 6-digit OTP</strong> has been sent to both your Mobile &amp; Email. You can enter the code received on either!
          </p>
        </div>

        {/* Channels indicator box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(214, 245, 238, 0.45) 0%, rgba(224, 242, 254, 0.4) 100%)',
          border: '1px solid rgba(13, 148, 136, 0.2)',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F5146', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <CheckCircle2 size={15} style={{ color: '#0D9488' }} /> Code Dispatched To Both:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={14} style={{ color: '#0D9488' }} />
              <span>SMS: <strong>{phone || 'Your registered mobile'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} style={{ color: '#333F70' }} />
              <span>Email: <strong>{email || 'Your registered email'}</strong></span>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ margin: 0, fontWeight: '700', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                6-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0D9488',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {resending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Resend OTP
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="••••••"
              autoFocus
              required
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{
                width: '100%',
                letterSpacing: '10px',
                textAlign: 'center',
                fontSize: '26px',
                fontWeight: '800',
                padding: '14px',
                background: '#FAFAF8',
                border: '1.5px solid #CBD5E1',
                borderRadius: '12px',
                color: '#333F70',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%',
              padding: '14px',
              background: '#333F70',
              color: '#FFFFFF',
              fontWeight: '700',
              borderRadius: '12px',
              fontSize: '14px',
              border: 'none',
              cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
              opacity: loading || otp.length !== 6 ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(51, 63, 112, 0.2)'
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Verify &amp; Activate Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748B' }}>
          Valid OTP verify karte hi aap turant profile dashboard par chale jayenge.
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <Link href="/customer/login" style={{ fontSize: '13px', color: '#333F70', fontWeight: '700', textDecoration: 'none' }}>
            ← Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerVerifyOtpPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF8', color: '#64748B' }}>Loading verification...</div>}>
      <CustomerVerifyOtpContent />
    </Suspense>
  );
}
