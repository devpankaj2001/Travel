'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminShell from '../../../../components/admin/AdminShell';
import { authService } from '../../../../services/auth.service';
import { useToast } from '../../../../components/Toast';

const fileUrl = (url) => (url?.startsWith('http') ? url : `http://localhost:5000${url || ''}`);

const asList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return asList(parsed);
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  if (typeof value === 'object') {
    return [...asList(value.selected), ...asList(value.custom)];
  }
  return [];
};

export default function AdminSupplierReviewPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [supplier, setSupplier] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await authService.getAdminSupplierDetail(id);
    if (res.success) setSupplier(res.data);
    else setError(res.message || 'Supplier could not be loaded.');
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const decide = async (status) => {
    setBusy(true);
    const note = status === 'approved' ? 'Approved after supplier review' : 'Rejected after supplier review';
    const res = status === 'approved'
      ? await authService.approveSupplier(id, note)
      : await authService.rejectSupplier(id, note);
    setBusy(false);
    if (res.success) {
      addToast(res.message || `Supplier ${status}`, 'success');
      await load();
    } else {
      addToast(res.message || 'The status could not be changed.', 'error');
    }
  };

  const verifyDoc = async (docId, status) => {
    const reason = status === 'rejected' ? 'Document needs to be replaced.' : null;
    const res = await authService.verifyAdminSupplierDocument(id, docId, { status, rejection_reason: reason });
    if (res.success) {
      addToast(res.message || 'Document updated', 'success');
      await load();
    } else {
      addToast(res.message || 'Document could not be updated', 'error');
    }
  };

  const name = supplier ? (supplier.company_name || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim()) : 'Supplier Details';
  const accountType = supplier?.account_type === 'individual' ? 'Individual Person' : 'Registered Corporate Entity';
  const rows = supplier ? [
    ['Supplier Name', `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim() || name],
    ['Account Type', accountType],
    ['Email', supplier.email],
    ['Phone', supplier.phone],
    ['Registration Date', supplier.created_at ? new Date(supplier.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'],
    ['Categories', supplier.main_category || '—'],
    ['Sub-Categories', supplier.sub_category || '—'],
    ['Services', asList(supplier.services).join(', ') || '—'],
    ['Add-on Services', asList(supplier.add_ons).join(', ') || '—'],
    ['Description', supplier.description || '—']
  ] : [];

  return (
    <AdminShell title="Supplier Details">
      {loading ? <p>Loading supplier…</p> : null}
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      {supplier && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>{name}</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', textTransform: 'capitalize' }}>Status: {String(supplier.status || '').replace(/_/g, ' ')}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" disabled={busy || supplier.status === 'approved'} onClick={() => decide('approved')} style={{ border: 0, background: '#16a34a', color: '#fff', borderRadius: 8, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>Approve</button>
              <button type="button" disabled={busy || supplier.status === 'rejected'} onClick={() => decide('rejected')} style={{ border: 0, background: '#dc2626', color: '#fff', borderRadius: 8, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid #e2e8f0', marginBottom: 16 }}>
            {['overview', 'documents', 'activities', 'history'].map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} style={{ border: 0, background: 'transparent', padding: '8px 0', fontWeight: 800, textTransform: 'capitalize', color: tab === item ? '#1d6fe8' : '#64748b', borderBottom: tab === item ? '2px solid #1d6fe8' : '2px solid transparent', cursor: 'pointer' }}>{item}</button>
            ))}
          </div>
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '10px 16px' }}>
              {rows.map(([label, value]) => (
                <div key={label} style={{ display: 'contents' }}>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
                  <div style={{ fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'documents' && (
            <div style={{ display: 'grid', gap: 10 }}>
              {(supplier.documents || []).length === 0 ? <p>No documents uploaded.</p> : supplier.documents.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                  <div>
                    <strong>{doc.document_name || doc.document_type}</strong>
                    <div style={{ color: '#64748b', fontSize: 12, textTransform: 'capitalize' }}>{doc.status}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={fileUrl(doc.document_url)} target="_blank" rel="noreferrer" style={{ color: '#1d6fe8', fontWeight: 700 }}>Open</a>
                    <button type="button" onClick={() => verifyDoc(doc.id, 'approved')} style={{ border: '1px solid #16a34a', background: '#fff', color: '#16a34a', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Approve</button>
                    <button type="button" onClick={() => verifyDoc(doc.id, 'rejected')} style={{ border: '1px solid #dc2626', background: '#fff', color: '#dc2626', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === 'activities' && <p style={{ color: '#475569' }}>Supplier approval does not publish activities. Activities appear here after this supplier submits them for review.</p>}
          {tab === 'history' && (
            <div style={{ display: 'grid', gap: 8, color: '#334155' }}>
              <div>Registered {supplier.created_at ? new Date(supplier.created_at).toLocaleString('en-IN') : '—'}</div>
              <div>Current status: {String(supplier.status || '').replace(/_/g, ' ')}</div>
              <div>Review notes: {supplier.approval_notes || 'None yet'}</div>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}
