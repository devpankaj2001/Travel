'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // All custom pages manage their own footer or are clean centered layouts
  if (
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/customer') ||
    pathname.startsWith('/supplier')
  ) {
    return null;
  }

  return (
    <footer style={{
      borderTop: '1px solid rgba(15, 23, 42, 0.08)',
      padding: '36px 0',
      background: '#FFFFFF',
      fontFamily: "'Manrope', -apple-system, sans-serif"
    }}>
      <div className="container" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#333F70' }}>
            TRAVEL. Luxury Experiences &amp; Escapes
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            Production-grade Role-Based Access Control, Supplier Onboarding &amp; Multi-portal Architecture.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
          <Link href="/login" style={{ color: '#64748B', textDecoration: 'none', fontWeight: '600' }}>Customer Portal</Link>
          <Link href="/supplier/signup" style={{ color: '#0D9488', textDecoration: 'none', fontWeight: '800' }}>Become a Supplier</Link>
          <Link href="/login" style={{ color: '#64748B', textDecoration: 'none', fontWeight: '600' }}>Supplier Portal</Link>
          <Link href="/login" style={{ color: '#64748B', textDecoration: 'none', fontWeight: '600' }}>Admin Console</Link>
        </div>
      </div>
    </footer>
  );
}
