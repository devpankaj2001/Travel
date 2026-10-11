'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function AdminRegisterDisabledPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/admin/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="admin-theme-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="admin-editorial-card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: '#FEF3C7',
          color: '#D97706',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <ShieldAlert size={28} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
          Public Admin Registration Closed
        </h1>

        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '20px' }}>
          Administrator accounts cannot be created publicly. New administrative roles must be assigned directly by an authorized Site Administrator through the Users Management Console.
        </p>

        <Link
          href="/admin/login"
          className="admin-btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Return to Admin Login
        </Link>
      </div>
    </div>
  );
}
