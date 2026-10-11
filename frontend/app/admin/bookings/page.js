'use client';

import AdminShell from '../../../components/admin/AdminShell';

export default function AdminBookingsPage() {
  return (
    <AdminShell title="Bookings">
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginTop: 0, fontSize: 20 }}>Bookings</h1>
        <p style={{ color: '#475569' }}>Supplier bookings appear here after a supplier is approved and starts receiving orders.</p>
      </div>
    </AdminShell>
  );
}
