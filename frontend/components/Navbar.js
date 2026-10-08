'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Compass, User, LogOut, ShieldCheck, Building2, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, role, logout } = useAuth();

  // All custom pages manage their own editorial luxury navigation matching bookingplatform-two.vercel.app
  if (
    pathname === '/' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/customer') ||
    pathname.startsWith('/supplier')
  ) {
    return null;
  }

  const getDashboardLink = () => {
    if (['site_admin', 'site_accountant', 'finance'].includes(role)) {
      return '/admin/dashboard';
    }
    if (role === 'supplier') {
      return '/supplier/dashboard';
    }
    return '/customer/profile';
  };

  return (
    <nav style={{
      background: '#FFFFFF',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.03)',
      fontFamily: "'Manrope', -apple-system, sans-serif"
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            background: '#333F70',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D6F5EE'
          }}>
            <Compass size={22} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#333F70', letterSpacing: '-0.5px' }}>
            TRAVEL<span style={{ color: '#0D9488' }}>.</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isAuthenticated ? (
            <>
              <Link href="/login" style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#333F70',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none'
              }}>
                Sign In
              </Link>
              <Link href="/supplier/signup" style={{
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#0D9488',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '800',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)'
              }}>
                Become a Supplier
              </Link>
              <Link href="/login" style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#333F70',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none'
              }}>
                Supplier Portal
              </Link>
              <Link href="/login" style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: '#333F70',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none'
              }}>
                Staff Admin
              </Link>
            </>
          ) : (
            <>
              <span style={{
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#D6F5EE',
                color: '#0D9488',
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase'
              }}>
                {user?.role_name || role}
              </span>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                {user?.first_name} {user?.last_name}
              </span>
              <Link href={getDashboardLink()} style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: '#333F70',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                textDecoration: 'none'
              }}>
                Dashboard
              </Link>
              <button onClick={logout} style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#EF4444',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
