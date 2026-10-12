'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  Mail,
  Phone,
  ShieldAlert,
  User,
  X
} from 'lucide-react';
import AdminShell from '../../../../../components/admin/AdminShell';
import { authService } from '../../../../../services/auth.service';
import { useToast } from '../../../../../components/Toast';

export default function AdminSupplierSuspendPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State matching Screen 3
  const [reason, setReason] = useState('Policy / Compliance Review');
  const [notes, setNotes] = useState('Supplier account suspended due to policy and compliance review. Multiple customer complaints under investigation.');
  const [scope, setScope] = useState({
    disableNewBookings: true,
    reviewExistingBookings: true,
    holdPayments: true,
    restrictPayouts: true,
    suspendSupplierAccess: false
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await authService.getAdminSupplierDetail(id);
        if (res.success && res.data) {
          setSupplier(res.data);
        } else {
          addToast(res.message || 'Supplier details could not be loaded', 'error');
        }
      } catch (err) {
        addToast(err?.message || 'Error fetching supplier', 'error');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleSuspend = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      addToast('Suspension notes are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        status: 'suspended',
        notes: notes.trim(),
        reason: `${reason} - ${notes.trim()}`,
        scope
      };
      const res = await authService.updateAdminSupplierStatus(id, payload);
      if (res.success) {
        addToast('Supplier account has been successfully suspended. Review scope applied.', 'success');
        router.push(`/admin/suppliers/${id}/affected-bookings`);
      } else {
        addToast(res.message || 'Failed to suspend supplier', 'error');
      }
    } catch (err) {
      addToast(err?.message || 'Network error updating suspension status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const name = supplier?.company_name || supplier?.owner_name || [supplier?.first_name, supplier?.last_name].filter(Boolean).join(' ') || 'Sunrise Tours Pvt. Ltd.';

  return (
    <AdminShell title="Suspend Supplier">
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Breadcrumb Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
            <Link href="/admin/suppliers" style={{ color: '#1d6fe8', textDecoration: 'none' }}>Suppliers</Link>
            <span>/</span>
            <Link href={`/admin/suppliers/${id}`} style={{ color: '#1d6fe8', textDecoration: 'none' }}>Supplier Details</Link>
            <span>/</span>
            <span style={{ color: '#0F172A', fontWeight: '800' }}>Suspend Supplier</span>
          </div>

          <Link
            href={`/admin/suppliers/${id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              fontSize: '12.5px',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={14} /> Back to Supplier
          </Link>
        </div>

        {/* Supplier Information Card (Screen 3 Top) */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '72px',
              height: '54px',
              borderRadius: '10px',
              backgroundColor: '#0F172A',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D6F5EE',
              backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                  {name}
                </h2>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 9px',
                  borderRadius: '100px',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  <CheckCircle2 size={12} /> Approved Supplier
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px', color: '#64748B', flexWrap: 'wrap' }}>
                <span>Owner: <strong style={{ color: '#0F172A' }}>{supplier?.owner_name || supplier?.contact_person || 'Rahul Sharma'}</strong></span>
                <span>Email: <strong style={{ color: '#0F172A' }}>{supplier?.email || 'rahul@sunrisetours.com'}</strong></span>
                <span>Phone: <strong style={{ color: '#0F172A' }}>{supplier?.phone || '+91 98765 43210'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '12px', color: '#64748B', borderLeft: '1px solid #F1F5F9', paddingLeft: '20px' }}>
            <div>
              <div style={{ color: '#94A3B8', fontSize: '11px' }}>Business Type</div>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{supplier?.business_type || 'Private Limited'}</div>
              <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '6px' }}>GST Number</div>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{supplier?.tax_id || '27ABCDE1234F1ZZ5'}</div>
            </div>
            <div>
              <div style={{ color: '#94A3B8', fontSize: '11px' }}>PAN Number</div>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{supplier?.pan_number || 'ABCDE1234F'}</div>
              <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '6px' }}>Joined On</div>
              <div style={{ fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                {new Date(supplier?.created_at || '2024-01-15').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Form Layout: Left Suspension Details & Scope | Right Confirm Box */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Column: Details & Scope */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Suspension Details */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                Suspension Details
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                  Suspension Reason <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                >
                  <option value="Policy / Compliance Review">Policy / Compliance Review</option>
                  <option value="Fraudulent Activity">Fraudulent Activity</option>
                  <option value="Quality Complaints & Customer Disputes">Quality Complaints & Customer Disputes</option>
                  <option value="Non-payment / Commission Default">Non-payment / Commission Default</option>
                  <option value="Documentation / KYC Non-compliance">Documentation / KYC Non-compliance</option>
                  <option value="Regulatory / Legal Restriction">Regulatory / Legal Restriction</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#334155', marginBottom: '6px' }}>
                  Suspension Notes <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="Detail the circumstances, policy breaches, and specific conditions..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  {notes.length}/500
                </div>
              </div>
            </div>

            {/* Suspension Scope Checkboxes */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                Suspension Scope
              </h3>

              {[
                { key: 'disableNewBookings', label: 'Disable New Bookings', desc: 'Supplier cannot receive any new bookings.' },
                { key: 'reviewExistingBookings', label: 'Review Existing Bookings', desc: 'All existing bookings will be reviewed.' },
                { key: 'holdPayments', label: 'Hold Payments', desc: 'Pending payments will be put on hold.' },
                { key: 'restrictPayouts', label: 'Restrict Payouts', desc: 'Payouts will be restricted until review is complete.' },
                { key: 'suspendSupplierAccess', label: 'Suspend Supplier Access', desc: 'Supplier will not be able to access supplier panel (optional).' }
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={scope[item.key]}
                    onChange={(e) => setScope({ ...scope, [item.key]: e.target.checked })}
                    style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#1d6fe8', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A' }}>{item.label}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Right Column: Confirm Suspension Warning Box (Screen 3 Right) */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #FECACA',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 4px 16px rgba(220, 38, 38, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '850', color: '#991B1B', margin: '0 0 6px' }}>
                  Confirm Suspension
                </h4>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                  Are you sure you want to suspend this supplier? This will restrict their access and apply the selected booking and payment actions.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => router.push(`/admin/suppliers/${id}`)}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: '750',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSuspend}
                disabled={submitting}
                style={{
                  flex: 1.4,
                  padding: '11px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(220, 38, 38, 0.25)'
                }}
              >
                {submitting ? 'Suspending...' : 'Suspend Supplier'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </AdminShell>
  );
}
