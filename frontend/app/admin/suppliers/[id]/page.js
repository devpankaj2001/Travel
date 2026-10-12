'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '../../../../components/admin/AdminShell';
import { authService } from '../../../../services/auth.service';
import { useToast } from '../../../../components/Toast';
import {
  Check, X, AlertCircle, FileText, Mail, Building2, User, Clock,
  Send, ArrowLeft, ShieldAlert, CheckCircle, ExternalLink, MessageSquare
} from 'lucide-react';

const fileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const origin = api.replace(/\/api\/v1\/?$/, '');
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`;
};

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
  const router = useRouter();
  const { addToast } = useToast();

  const [supplier, setSupplier] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | documents | taxonomy | history
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Modals / Action States
  const [activeModal, setActiveModal] = useState(null); // 'request_docs' | 'approve' | 'reject' | 'remark' | 'doc_reject'
  const [modalText, setModalText] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await authService.getAdminSupplierDetail(id);
    if (res.success && res.data) {
      setSupplier(res.data);
      setError('');
    } else {
      setError(res?.message || 'Supplier details could not be loaded.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  // Handle Approve
  const handleApprove = async () => {
    setBusy(true);
    const notes = modalText.trim() || 'Supplier application approved after compliance review.';
    const res = await authService.approveSupplier(id, notes);
    setBusy(false);
    setActiveModal(null);
    setModalText('');
    if (res.success) {
      addToast(res.message || 'Supplier approved successfully. Email notification sent.', 'success');
      await load();
    } else {
      addToast(res.message || 'Failed to approve supplier.', 'error');
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!modalText.trim()) {
      addToast('A rejection reason is required.', 'error');
      return;
    }
    setBusy(true);
    const res = await authService.rejectSupplier(id, modalText.trim());
    setBusy(false);
    setActiveModal(null);
    setModalText('');
    if (res.success) {
      addToast(res.message || 'Supplier rejected. Notice email sent.', 'success');
      await load();
    } else {
      addToast(res.message || 'Failed to reject supplier.', 'error');
    }
  };

  // Handle Request Missing Documents
  const handleRequestDocuments = async () => {
    if (!modalText.trim()) {
      addToast('Please provide instructions detailing the missing documents or information.', 'error');
      return;
    }
    setBusy(true);
    const res = await authService.requestSupplierDocuments(id, modalText.trim());
    setBusy(false);
    setActiveModal(null);
    setModalText('');
    if (res.success) {
      addToast(res.message || 'Document request and remarks emailed to supplier.', 'success');
      await load();
    } else {
      addToast(res.message || 'Failed to send document request.', 'error');
    }
  };

  // Handle Send General Remark / Message
  const handleSendRemark = async () => {
    if (!modalText.trim()) {
      addToast('Please enter remarks text.', 'error');
      return;
    }
    setBusy(true);
    const res = await authService.addSupplierRemarks(id, modalText.trim());
    setBusy(false);
    setActiveModal(null);
    setModalText('');
    if (res.success) {
      addToast(res.message || 'Remarks saved and emailed to supplier.', 'success');
      await load();
    } else {
      addToast(res.message || 'Failed to send remarks.', 'error');
    }
  };

  // Handle Verify Document (Approve or Reject with reason)
  const handleVerifyDocument = async (docId, status, rejectionReason = null) => {
    setBusy(true);
    const res = await authService.verifyAdminSupplierDocument(id, docId, {
      status,
      rejection_reason: rejectionReason
    });
    setBusy(false);
    setActiveModal(null);
    setModalText('');
    setSelectedDocId(null);
    if (res.success) {
      addToast(res.message || `Document marked as ${status}.`, 'success');
      await load();
    } else {
      addToast(res.message || 'Failed to update document.', 'error');
    }
  };

  const name = supplier ? (supplier.company_name || `${supplier.first_name || ''} ${supplier.last_name || ''}`.trim()) : 'Supplier Details';
  const isIndividual = supplier?.account_type === 'individual';
  const accountTypeLabel = isIndividual ? 'Individual Person' : 'Registered Corporate Entity';
  const status = supplier?.status || 'pending';

  const statusBadgeStyle = {
    approved: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    rejected: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    documents_required: { bg: '#ffedd5', text: '#c2410c', border: '#fdba74' },
    under_review: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
    pending: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' }
  }[status] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };

  return (
    <AdminShell title="Supplier Details & Verification">
      <div style={{ marginBottom: 16 }}>
        <Link href="/admin/suppliers" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1d6fe8', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Suppliers List
        </Link>
      </div>

      {loading && <p style={{ color: '#64748b' }}>Loading supplier application details…</p>}
      {error && <div style={{ padding: 14, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 8 }}>{error}</div>}

      {supplier && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>{name}</h1>
                <span style={{
                  background: statusBadgeStyle.bg,
                  color: statusBadgeStyle.text,
                  border: `1px solid ${statusBadgeStyle.border}`,
                  padding: '3px 10px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {status.replace(/_/g, ' ')}
                </span>
                <span style={{
                  background: isIndividual ? '#f3e8ff' : '#dbeafe',
                  color: isIndividual ? '#6b21a8' : '#1e40af',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {accountTypeLabel}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 13 }}>
                Reference: <strong>{supplier.application_reference || `SUP-${supplier.id}`}</strong> · Registered: {supplier.created_at ? new Date(supplier.created_at).toLocaleString('en-IN') : '—'}
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={busy}
                onClick={() => { setModalText(supplier.approval_notes || ''); setActiveModal('remark'); }}
                style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <MessageSquare size={15} /> Add Remark & Email
              </button>

              <button
                type="button"
                disabled={busy || status === 'approved'}
                onClick={() => { setModalText(''); setActiveModal('request_docs'); }}
                style={{ border: '1px solid #f97316', background: '#fff7ed', color: '#c2410c', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <AlertCircle size={15} /> Request Missing Documents
              </button>

              <button
                type="button"
                disabled={busy || status === 'approved'}
                onClick={() => { setModalText(''); setActiveModal('approve'); }}
                style={{ border: 0, background: '#16a34a', color: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Check size={16} /> Approve
              </button>

              <button
                type="button"
                disabled={busy || status === 'rejected'}
                onClick={() => { setModalText(''); setActiveModal('reject'); }}
                style={{ border: 0, background: '#dc2626', color: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <X size={16} /> Reject
              </button>

              <Link
                href={`/admin/suppliers/${id}/suspend`}
                style={{ border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <ShieldAlert size={15} /> Suspend Supplier
              </Link>

              <Link
                href={`/admin/suppliers/${id}/affected-bookings`}
                style={{ border: '1px solid #93c5fd', background: '#eff6ff', color: '#1d6fe8', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Clock size={15} /> Affected Bookings
              </Link>
            </div>
          </div>

          {/* Remarks Notice Banner (if any) */}
          {supplier.approval_notes && (
            <div style={{ margin: '16px 0', padding: '14px 18px', background: status === 'documents_required' ? '#fff7ed' : '#f8fafc', border: `1px solid ${status === 'documents_required' ? '#fed7aa' : '#e2e8f0'}`, borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: status === 'documents_required' ? '#c2410c' : '#334155' }}>
                <MessageSquare size={16} />
                <span>Current Review Remarks / Document Request:</span>
              </div>
              <p style={{ margin: '6px 0 0', color: '#334155', fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {supplier.approval_notes}
              </p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid #e2e8f0', margin: '20px 0' }}>
            {[
              { key: 'overview', label: 'Overview & Profile' },
              { key: 'documents', label: `Documents (${(supplier.documents || []).length})` },
              { key: 'taxonomy', label: 'Categories & Services' },
              { key: 'history', label: 'Audit & History' }
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                style={{
                  border: 0,
                  background: 'transparent',
                  padding: '10px 0',
                  fontWeight: 800,
                  fontSize: 13,
                  color: tab === t.key ? '#1d6fe8' : '#64748b',
                  borderBottom: tab === t.key ? '2px solid #1d6fe8' : '2px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW & PROFILE */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Account & Contact Information */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} style={{ color: '#1d6fe8' }} /> Account & Contact Details
                </h3>
                <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Primary Contact:</span>
                    <strong>{supplier.first_name} {supplier.last_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <strong style={{ color: '#0f172a' }}>{supplier.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Mobile Number:</span>
                    <strong>{supplier.phone || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Contact Address:</span>
                    <strong style={{ textAlign: 'right', maxWidth: 220 }}>{supplier.contact_address || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>City / State:</span>
                    <strong>{[supplier.city, supplier.state].filter(Boolean).join(', ') || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Country / Postal Code:</span>
                    <strong>{[supplier.country, supplier.postal_code].filter(Boolean).join(' - ') || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* Account Type Specific Details */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isIndividual ? <User size={16} style={{ color: '#9333ea' }} /> : <Building2 size={16} style={{ color: '#2563eb' }} />}
                  {isIndividual ? 'Individual Person Information' : 'Corporate Entity Details'}
                </h3>
                <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
                  {isIndividual ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Full Legal Name:</span>
                        <strong>{supplier.legal_name || `${supplier.first_name} ${supplier.last_name}`}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Display Name:</span>
                        <strong>{supplier.display_name || '—'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Identity Proof Type:</span>
                        <strong>{supplier.identity_type || '—'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Identity Number:</span>
                        <strong>{supplier.identity_number || '—'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>PAN Number:</span>
                        <strong>{supplier.pan_number || '—'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Residential Address:</span>
                        <strong style={{ textAlign: 'right', maxWidth: 220 }}>{supplier.residential_address || supplier.contact_address || '—'}</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Registered Legal Name:</span>
                        <strong>{supplier.company_name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Brand / Trade Name:</span>
                        <strong>{supplier.brand_name || supplier.company_name}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Business Type:</span>
                        <strong>{supplier.business_type || 'Corporate Entity'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Registration / License No:</span>
                        <strong>{supplier.trade_license_no || '—'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>GST / Tax ID:</span>
                        <strong>{supplier.tax_id || '—'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Authorized Representative:</span>
                        <strong>{supplier.owner_name || supplier.contact_person || '—'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Registered Address:</span>
                        <strong style={{ textAlign: 'right', maxWidth: 220 }}>{supplier.business_address || supplier.contact_address || '—'}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS */}
          {tab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                  Review each submitted document according to the supplier account type checklist. You can approve or reject individual documents with specific reasons.
                </p>
                <button
                  type="button"
                  onClick={() => { setModalText(''); setActiveModal('request_docs'); }}
                  style={{ border: '1px solid #f97316', background: '#fff7ed', color: '#c2410c', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                >
                  + Request Additional Document
                </button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {(supplier.documents || []).length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', background: '#f8fafc', borderRadius: 8, color: '#64748b' }}>
                    No KYC documents uploaded yet.
                  </div>
                ) : (
                  supplier.documents.map((doc) => {
                    const docStatus = doc.status || 'pending';
                    const docBadge = {
                      approved: { bg: '#dcfce7', text: '#15803d' },
                      rejected: { bg: '#fee2e2', text: '#b91c1c' },
                      pending: { bg: '#fef3c7', text: '#b45309' }
                    }[docStatus] || { bg: '#f1f5f9', text: '#475569' };

                    return (
                      <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#fff' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FileText size={18} style={{ color: '#1d6fe8', flexShrink: 0 }} />
                            <strong style={{ fontSize: 14, color: '#0f172a' }}>{doc.document_name || doc.document_type}</strong>
                            <span style={{ background: docBadge.bg, color: docBadge.text, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 9999, textTransform: 'uppercase' }}>
                              {docStatus}
                            </span>
                          </div>
                          <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
                            Type: <strong>{doc.document_type}</strong> · Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString('en-IN') : '—'}
                          </div>
                          {doc.rejection_reason && (
                            <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                              Rejection note: {doc.rejection_reason}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <a
                            href={fileUrl(doc.document_url)}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid #cbd5e1', background: '#fff', color: '#1d6fe8', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                          >
                            Open <ExternalLink size={12} />
                          </a>

                          <button
                            type="button"
                            disabled={busy || docStatus === 'approved'}
                            onClick={() => handleVerifyDocument(doc.id, 'approved')}
                            style={{ border: '1px solid #16a34a', background: docStatus === 'approved' ? '#dcfce7' : '#fff', color: '#16a34a', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={busy || docStatus === 'rejected'}
                            onClick={() => { setSelectedDocId(doc.id); setModalText(''); setActiveModal('doc_reject'); }}
                            style={{ border: '1px solid #dc2626', background: docStatus === 'rejected' ? '#fee2e2' : '#fff', color: '#dc2626', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TAXONOMY & SERVICES */}
          {tab === 'taxonomy' && (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Selected Main Categories</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>{supplier.main_category || 'None'}</p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Sub-Categories</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#334155' }}>{supplier.sub_category || 'None'}</p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Services / Activities Provided</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {asList(supplier.services).length === 0 ? <span style={{ color: '#64748b', fontSize: 13 }}>None</span> : (
                    asList(supplier.services).map((srv, idx) => (
                      <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                        {srv}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Add-on Services</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {asList(supplier.add_ons).length === 0 ? <span style={{ color: '#64748b', fontSize: 13 }}>None</span> : (
                    asList(supplier.add_ons).map((addon, idx) => (
                      <span key={idx} style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                        {addon}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 18 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Service & Activity Description</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {supplier.description || 'No description provided.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT & HISTORY */}
          {tab === 'history' && (
            <div style={{ display: 'grid', gap: 12, fontSize: 13, color: '#334155' }}>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <strong>Registered At:</strong> {supplier.created_at ? new Date(supplier.created_at).toLocaleString('en-IN') : '—'}
              </div>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <strong>Current Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{status.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <strong>Last Review Notes:</strong> {supplier.approval_notes || 'None recorded yet'}
              </div>
              {supplier.approved_at && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                  <strong>Approved At:</strong> {new Date(supplier.approved_at).toLocaleString('en-IN')} (By: {supplier.approved_by_email || 'Admin'})
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE ACTION MODALS */}
      {/* ========================================================================= */}

      {/* 1. Request Missing Documents Modal */}
      {activeModal === 'request_docs' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#c2410c', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={20} /> Request Missing Documents / Information
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              This will set the supplier status to <strong>Documents Required</strong> and dispatch an email to <strong>{supplier?.email}</strong> with your instructions.
            </p>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Missing Documents / Required Actions: <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              rows={4}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder="e.g. Please upload your company GST Certificate and registered business address proof."
              style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="button" disabled={busy} onClick={() => { setActiveModal(null); setModalText(''); }} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" disabled={busy} onClick={handleRequestDocuments} style={{ border: 0, background: '#c2410c', color: '#fff', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                {busy ? 'Sending Request…' : 'Send Request & Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Remark & Email Modal */}
      {activeModal === 'remark' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={20} style={{ color: '#1d6fe8' }} /> Add Review Remark & Email Supplier
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Your remark will be saved to the supplier profile and an email notification will be delivered to <strong>{supplier?.email}</strong>.
            </p>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Review Remark / Message: <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              rows={4}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder="Enter remark or message for the supplier…"
              style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="button" disabled={busy} onClick={() => { setActiveModal(null); setModalText(''); }} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" disabled={busy} onClick={handleSendRemark} style={{ border: 0, background: '#1d6fe8', color: '#fff', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                {busy ? 'Sending…' : 'Save & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Approve Modal */}
      {activeModal === 'approve' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={20} /> Approve Supplier Application
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Are you sure you want to approve <strong>{name}</strong>? An approval email will be sent to <strong>{supplier?.email}</strong>.
            </p>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Approval Notes (Optional):
            </label>
            <textarea
              rows={3}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder="e.g. All documents verified. Approved for activity listing."
              style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="button" disabled={busy} onClick={() => { setActiveModal(null); setModalText(''); }} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" disabled={busy} onClick={handleApprove} style={{ border: 0, background: '#16a34a', color: '#fff', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                {busy ? 'Approving…' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Reject Modal */}
      {activeModal === 'reject' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={20} /> Reject Supplier Application
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>
              Please specify the reason for rejecting this supplier application. The rejection reason will be sent to <strong>{supplier?.email}</strong>.
            </p>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              Rejection Reason: <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder="e.g. Trade license number could not be verified with municipal records."
              style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button type="button" disabled={busy} onClick={() => { setActiveModal(null); setModalText(''); }} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" disabled={busy} onClick={handleReject} style={{ border: 0, background: '#dc2626', color: '#fff', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                {busy ? 'Rejecting…' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Reject Single Document Modal */}
      {activeModal === 'doc_reject' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 460, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, color: '#dc2626' }}>
              Reject Document
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>
              Please provide the reason why this document is being rejected (e.g. blurry, expired, incorrect entity name):
            </p>
            <textarea
              rows={3}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder="e.g. Document is expired or unreadable. Please upload a clear valid copy."
              style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button type="button" disabled={busy} onClick={() => { setActiveModal(null); setSelectedDocId(null); setModalText(''); }} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (!modalText.trim()) {
                    addToast('Please provide a rejection reason.', 'error');
                    return;
                  }
                  handleVerifyDocument(selectedDocId, 'rejected', modalText.trim());
                }}
                style={{ border: 0, background: '#dc2626', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
