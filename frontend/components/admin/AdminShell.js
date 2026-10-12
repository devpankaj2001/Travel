'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Layers,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Compass,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';

const LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Building2 },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];

export default function AdminShell({ title, onRefresh, refreshing, headerActions, children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingSuppliersCount, setPendingSuppliersCount] = useState(0);
  const [pushToast, setPushToast] = useState(null);

  useEffect(() => {
    let lastSeenId = 0;
    const fetchNotifs = () => {
      authService.getNotifications().then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const unread = res.data.filter((item) => item.status !== 'read');
          setUnreadCount(unread.length);
          if (res.data.length > 0) {
            const latest = res.data[0];
            if (lastSeenId > 0 && latest.id > lastSeenId && latest.status !== 'read') {
              setPushToast(latest);
              setTimeout(() => setPushToast(null), 8000);
            }
            lastSeenId = latest.id;
          }
        }
      }).catch(() => {});
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    authService.getAdminSuppliers().then((res) => {
      if (res.success && res.data?.suppliers) {
        const pending = res.data.suppliers.filter((s) => s.status !== 'approved');
        setPendingSuppliersCount(pending.length);
      }
    }).catch(() => {});
  }, [pathname]);

  const isActive = (href) => {
    if (href === '/admin/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Manrope', -apple-system, sans-serif",
      display: 'flex'
    }}>
      {/* Push Notification Toast */}
      {pushToast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          background: '#1d6fe8',
          color: '#fff',
          padding: '14px 18px',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(29,111,232,0.35)',
          maxWidth: 380,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start'
        }}>
          <Bell size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>{pushToast.title || 'New Push Notification'}</div>
            <div style={{ fontSize: 12.5, marginTop: 3, opacity: 0.95, lineHeight: 1.4 }}>{pushToast.message}</div>
            <Link
              href="/admin/notifications"
              onClick={() => setPushToast(null)}
              style={{ display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 800, color: '#D6F5EE', textDecoration: 'none' }}
            >
              View in Admin Panel →
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setPushToast(null)}
            style={{ border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* 1. LEFT SIDEBAR */}
      <aside style={{
        width: '240px',
        backgroundColor: '#0b1f3a',
        borderRight: '1px solid #0b1f3a',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 40,
        flexShrink: 0
      }}>
        {/* Brand & Nav */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 16px 16px' }}>
          {/* Logo matching Supplier Console: Compass + TravelHub + Admin Console */}
          <div style={{ marginBottom: '24px', paddingLeft: '8px' }}>
            <Link href="/admin/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#333F70',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6F5EE',
                boxShadow: '0 2px 8px rgba(51, 63, 112, 0.2)'
              }}>
                <Compass size={20} />
              </div>
              <div>
                <span style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-0.5px', display: 'block', lineHeight: 1.1 }}>
                  TravelHub
                </span>
                <span style={{ fontSize: '10px', fontWeight: '750', color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {LINKS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const badge = item.href === '/admin/notifications' && unreadCount > 0
                ? `${unreadCount}`
                : item.href === '/admin/suppliers' && pendingSuppliersCount > 0
                ? `${pendingSuppliersCount}`
                : null;
              const isBadgeRed = item.href === '/admin/suppliers' || item.href === '/admin/notifications';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    backgroundColor: active ? '#1d6fe8' : 'transparent',
                    color: active ? '#FFFFFF' : '#dbe7f5',
                    fontSize: '13px',
                    fontWeight: active ? '800' : '650',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={17} style={{ color: active ? '#FFFFFF' : '#9fb3c8' }} />
                    <span>{item.label}</span>
                  </div>
                  {badge && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      backgroundColor: isBadgeRed ? '#EF4444' : (active ? 'rgba(214, 245, 238, 0.22)' : '#D6F5EE'),
                      color: isBadgeRed ? '#FFFFFF' : (active ? '#D6F5EE' : '#0D9488')
                    }}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom User Area */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#333F70',
                color: '#D6F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                flexShrink: 0
              }}>
                {(user?.first_name?.[0] || 'A').toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Administrator'}
                </div>
                <div style={{ fontSize: '11px', color: '#9fb3c8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'admin@travelhub.com'}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: '#fca5a5',
              fontSize: '12px',
              fontWeight: '750',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Navbar */}
        <header style={{
          height: '68px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A' }}>
              {title || 'Dashboard'}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: '9999px',
              backgroundColor: '#D6F5EE',
              color: '#0D9488',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              <ShieldCheck size={13} /> Admin Console
            </span>
          </div>

          {/* Right Header: Refresh button + Notification bell + Admin Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: '750',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
              </button>
            )}

            {headerActions}

            <Link
              href="/admin/notifications"
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                textDecoration: 'none'
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#EF4444',
                  borderRadius: '50%'
                }} />
              )}
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#333F70',
                color: '#D6F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800'
              }}>
                {(user?.first_name?.[0] || 'A').toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A', lineHeight: 1.2 }}>
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Administrator'}
                </div>
                <div style={{ fontSize: '11px', color: '#1d6fe8', fontWeight: '800' }}>
                  {(user?.role_slug || 'Site Admin').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div style={{ padding: '28px 32px', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
