'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Compass
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Building2 },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];

export default function AdminShell({ title, children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href) => {
    if (href === '/admin/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f4f7fb', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}>
      <aside style={{ width: 230, background: '#0b1f3a', color: '#dbe7f5', display: 'flex', flexDirection: 'column', flexShrink: 0, minHeight: '100vh', position: 'sticky', top: 0 }}>
        <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 18px 18px', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>
          <Compass size={20} /> TravelHub
        </Link>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {LINKS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: active ? '#fff' : '#c5d4e8',
                  background: active ? '#1d6fe8' : 'transparent',
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                <Icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ fontSize: 12, color: '#9fb3c8', marginBottom: 10 }}>{user?.email}</div>
          <button type="button" onClick={logout} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 0, background: 'transparent', color: '#fca5a5', cursor: 'pointer', fontWeight: 700, padding: 0 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ height: 64, background: '#1d6fe8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <strong style={{ fontSize: 18 }}>{title}</strong>
          <span style={{ fontSize: 13 }}>{user?.first_name} {user?.last_name}</span>
        </header>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
