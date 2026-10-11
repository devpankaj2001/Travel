'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/customer/profile');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Manrope', -apple-system, sans-serif",
      color: '#64748B'
    }}>
      <p>Redirecting to your profile dashboard...</p>
    </div>
  );
}
