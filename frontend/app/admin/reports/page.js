'use client';

import Link from 'next/link';
import AdminShell from '../../../components/admin/AdminShell';

export default function AdminReportsPage() {
  return (
    <AdminShell title="Reports">
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginTop: 0, fontSize: 20 }}>Reports</h1>
        <p style={{ color: '#475569' }}>Revenue and operations totals stay on the main dashboard.</p>
        <Link href="/admin/dashboard" style={{ color: '#1d6fe8', fontWeight: 800 }}>Open dashboard metrics</Link>
      </div>
    </AdminShell>
  );
}
