'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminShell from '../../../components/admin/AdminShell';
import { authService } from '../../../services/auth.service';

const labelFor = (type) => (type === 'individual' ? 'Individual Person' : type === 'corporate' ? 'Registered Corporate Entity' : type || '—');

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authService.getAdminSuppliers().then((res) => {
      if (res.success) setSuppliers(res.data?.suppliers || []);
      else setError(res.message || 'Suppliers could not be loaded.');
      setLoading(false);
    });
  }, []);

  return (
    <AdminShell title="Suppliers">
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? <p style={{ padding: 20 }}>Loading suppliers…</p> : null}
        {error ? <p style={{ padding: 20, color: '#b91c1c' }}>{error}</p> : null}
        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                {['Supplier', 'Account type', 'Email', 'Status', ''].map((heading) => (
                  <th key={heading} style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{supplier.company_name || `${supplier.first_name} ${supplier.last_name}`}</td>
                  <td style={{ padding: '12px 16px' }}>{labelFor(supplier.account_type)}</td>
                  <td style={{ padding: '12px 16px' }}>{supplier.email}</td>
                  <td style={{ padding: '12px 16px', textTransform: 'capitalize' }}>{String(supplier.status || '').replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/suppliers/${supplier.id}`} style={{ color: '#1d6fe8', fontWeight: 800, textDecoration: 'none' }}>Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
