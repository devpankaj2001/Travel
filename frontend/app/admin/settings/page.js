'use client';

import Link from 'next/link';
import AdminShell from '../../../components/admin/AdminShell';

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Settings">
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginTop: 0, fontSize: 20 }}>Settings</h1>
        <p style={{ color: '#475569' }}>User roles, permissions, and the audit log are managed from the operations dashboard.</p>
        <Link href="/admin/dashboard" style={{ color: '#1d6fe8', fontWeight: 800 }}>Open user and role settings</Link>
      </div>
    </AdminShell>
  );
}
