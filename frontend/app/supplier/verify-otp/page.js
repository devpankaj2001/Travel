'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import { ShieldCheck, ArrowRight, Loader2, RefreshCw, KeyRound, Building2 } from 'lucide-react';
import Link from 'next/link';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockSeconds, setBlockSeconds] = useState(0);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qPhone = searchParams.get('phone');
    if (qEmail) setEmail(qEmail);
    if (qPhone) setPhone(qPhone);
  }, [searchParams]);

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

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (isBlocked) {
      addToast(`Account temporarily blocked. Please wait ${formatTime(blockSeconds)}.`, 'error');
      return;
    }
    if (code.length !== 6) {
      addToast('Please enter the complete 6-digit OTP code', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.supplierVerifyOtp({ email, phone, code });
      if (res.success) {
        addToast('OTP verified successfully! Please log in.', 'success');
        router.push('/supplier/login');
      } else {
        if (res.is_blocked || res.status === 429) {
          setIsBlocked(true);
          setBlockSeconds(600);
        }
        addToast(res.message || 'OTP verification failed', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'Network error during OTP verification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isBlocked) {
      addToast(`Account temporarily blocked. Please wait ${formatTime(blockSeconds)}.`, 'error');
      return;
    }
    setResending(true);
    try {
      const res = await authService.supplierResendOtp({ email, phone });
      if (res.success) {
        addToast('A new OTP has been dispatched to your phone and email!', 'success');
      } else {
        if (res.is_blocked || res.status === 429) {
          setIsBlocked(true);
          setBlockSeconds(600);
        }
        addToast(res.message || 'Failed to resend OTP', 'error');
      }
    } catch {
      addToast('Network error requesting new OTP', 'error');
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
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        boxShadow: '0 20px 45px -12px rgba(51, 63, 112, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#D6F5EE',
            color: '#0D9488',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Building2 size={26} />
          </div>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(51, 63, 112, 0.08)',
            color: '#333F70',
            fontSize: '11px',
            fontWeight: '800',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '100px',
            marginBottom: '12px'
          }}>
            Supplier Two-Way Verification
          </span>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.5px' }}>
            Verify Identity
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: '1.5' }}>
            Enter the 6-digit verification code dispatched to <br />
            <strong style={{ color: '#0F172A' }}>{phone || email || 'your registered contact'}</strong>
          </p>
        </div>

        {/* Blocked State Notice */}
        {isBlocked && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #FCA5A5',
            color: '#991B1B',
            padding: '14px 16px',
            borderRadius: '14px',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              ⚠️ Account Temporarily Blocked
            </div>
            <div>
              5 wrong OTP attempts entered. Verification disabled for{' '}
              <strong style={{ color: '#DC2626' }}>{formatTime(blockSeconds)}</strong>.
            </div>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              disabled={isBlocked}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '28px',
                textAlign: 'center',
                letterSpacing: '10px',
                fontWeight: '800',
                color: isBlocked ? '#94A3B8' : '#333F70',
                backgroundColor: isBlocked ? '#F1F5F9' : '#FAFAF8',
                border: isBlocked ? '1.5px solid #CBD5E1' : '1.5px solid #E2E8F0',
                borderRadius: '14px',
                outline: 'none',
                cursor: isBlocked ? 'not-allowed' : 'text',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6 || isBlocked}
            style={{
              width: '100%',
              backgroundColor: isBlocked ? '#94A3B8' : '#333F70',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '14px',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading || code.length !== 6 || isBlocked ? 'not-allowed' : 'pointer',
              opacity: loading || code.length !== 6 || isBlocked ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: isBlocked ? 'none' : '0 4px 14px rgba(51, 63, 112, 0.2)'
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isBlocked ? (
              `Account Blocked (${formatTime(blockSeconds)})`
            ) : (
              <>Verify & Access Portal <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #F1F5F9',
          fontSize: '13px'
        }}>
          <span style={{ color: '#64748B' }}>Didn't receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || isBlocked}
            style={{
              background: 'transparent',
              border: 'none',
              color: isBlocked ? '#94A3B8' : '#0D9488',
              fontWeight: '700',
              cursor: isBlocked || resending ? 'not-allowed' : 'pointer',
              opacity: isBlocked ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} className={resending ? 'animate-spin' : ''} /> Resend OTP
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '14px',
          marginTop: '22px',
          fontSize: '13px'
        }}>
          <Link href="/supplier/login" style={{ color: '#333F70', fontWeight: '750', textDecoration: 'none' }}>
            ← Supplier Login
          </Link>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <Link href="/supplier/signup" style={{ color: '#0D9488', fontWeight: '750', textDecoration: 'none' }}>
            Supplier Register →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SupplierVerifyOtpPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF8', color: '#64748B' }}>Loading verification form...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
