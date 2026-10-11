'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BecomeASupplierRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/supplier/signup');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Manrope', sans-serif",
      backgroundColor: '#F8FAFC',
      color: '#64748B'
    }}>
      <p style={{ fontWeight: '750' }}>Redirecting to Supplier Registration...</p>
    </div>
  );
}
