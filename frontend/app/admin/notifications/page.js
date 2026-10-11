'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Compass } from 'lucide-react';
import AdminShell from '../../../components/admin/AdminShell';
import { authService } from '../../../services/auth.service';

const parseMeta = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return {}; }
};

const present = (item) => {
  const meta = parseMeta(item.metadata);
  const supplier = meta.kind === 'supplier' || /supplier registration/i.test(item.title || '');
  const activity = meta.kind === 'activity' || /activity/i.test(item.title || '');
  if (supplier) {
    const waiting = (item.message || '').match(/^(.*?) is waiting for verification/i);
    const fromTitle = (item.title || '').replace(/^New Supplier Registration\s*[–-]\s*/i, '').trim();
    let name = waiting ? waiting[1] : fromTitle;
    name = name.replace(/^New Supplier Registration\s*[–-]\s*/i, '').trim();
    return {
      title: 'New Supplier Registration',
      message: name ? `${name} is waiting for verification.` : 'A new supplier is waiting for verification.',
      href: meta.href || (meta.supplierId ? `/admin/suppliers/${meta.supplierId}` : ''),
      tone: 'supplier'
    };
  }
  if (activity) {
    return {
      title: 'New Activity Submitted',
      message: item.message || 'An activity has been submitted for review.',
      href: meta.href || '',
      tone: 'activity'
    };
  }
  return {
    title: item.title,
    message: item.message,
    href: meta.href || '',
    tone: 'general'
  };
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getNotifications().then((res) => {
      const rows = res.success ? (res.data || []) : [];
      setItems(rows.filter((item) => item.type === 'system'));
      setLoading(false);
    });
  }, []);

  const unreadCount = items.filter((item) => item.status !== 'read').length;
  const supplierCount = items.filter((item) => present(item).tone === 'supplier').length;
  const activityCount = items.filter((item) => present(item).tone === 'activity').length;

  const visible = items.filter((item) => {
    const card = present(item);
    if (filter === 'unread') return item.status !== 'read';
    if (filter === 'suppliers') return card.tone === 'supplier';
    if (filter === 'activities') return card.tone === 'activity';
    return true;
  });

  const openItem = async (item) => {
    if (item.status !== 'read') {
      await authService.markNotificationRead(item.id);
      setItems((current) => current.map((row) => (row.id === item.id ? { ...row, status: 'read' } : row)));
    }
    const href = present(item).href;
    if (href) router.push(href);
  };

  const tabs = [
    ['all', 'All'],
    ['unread', `Unread (${unreadCount})`],
    ['suppliers', `Suppliers (${supplierCount})`],
    ['activities', `Activities (${activityCount})`]
  ];

  return (
    <AdminShell title="Notifications">
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', maxWidth: 760 }}>
        <div style={{ display: 'flex', gap: 22, padding: '0 20px', borderBottom: '1px solid #e2e8f0' }}>
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              style={{
                border: 0,
                background: 'transparent',
                padding: '14px 0',
                cursor: 'pointer',
                fontWeight: 700,
                color: filter === key ? '#1d6fe8' : '#64748b',
                borderBottom: filter === key ? '2px solid #1d6fe8' : '2px solid transparent'
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? <p style={{ padding: 20 }}>Loading notifications…</p> : null}
        {!loading && visible.length === 0 ? <p style={{ padding: 20, color: '#64748b' }}>No notifications in this view.</p> : null}
        {visible.map((item) => {
          const card = present(item);
          const unread = item.status !== 'read';
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openItem(item)}
              style={{
                width: '100%',
                textAlign: 'left',
                border: 0,
                borderBottom: '1px solid #f1f5f9',
                background: unread ? '#f8fbff' : '#fff',
                padding: '16px 20px',
                cursor: 'pointer',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start'
              }}
            >
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8f1fe', color: '#1d6fe8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.tone === 'activity' ? <Compass size={16} /> : <Bell size={16} />}
              </span>
              <span>
                <strong style={{ display: 'block', color: '#0f172a', fontSize: 15 }}>{card.title}</strong>
                <span style={{ display: 'block', color: '#64748b', marginTop: 4, fontSize: 14 }}>{card.message}</span>
              </span>
            </button>
          );
        })}
      </div>
    </AdminShell>
  );
}
