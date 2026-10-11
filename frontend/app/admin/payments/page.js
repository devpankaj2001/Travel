'use client';

import AdminShell from '../../../components/admin/AdminShell';

export default function AdminPaymentsPage() {
  return (
    <AdminShell title="Payments">
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginTop: 0, fontSize: 20 }}>Payments</h1>
        <p style={{ color: '#475569' }}>Supplier payouts and payment records will be listed here.</p>
      </div>
    </AdminShell>
  );
}
