'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import { Building2, Save, Loader2, ArrowLeft, Landmark, Compass, CheckCircle2 } from 'lucide-react';

export default function SupplierProfilePage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [form, setForm] = useState({
    company_name: '',
    contact_person: '',
    trade_license_no: '',
    tax_id: '',
    business_address: '',
    city: '',
    country: 'India',
    bank_name: '',
    bank_account_no: '',
    bank_iban: ''
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await authService.getSupplierProfile();
        if (res.success && res.data) {
          setForm({
            company_name: res.data.company_name || '',
            contact_person: res.data.contact_person || '',
            trade_license_no: res.data.trade_license_no || '',
            tax_id: res.data.tax_id || '',
            business_address: res.data.business_address || '',
            city: res.data.city || '',
            country: res.data.country || 'India',
            bank_name: res.data.bank_name || '',
            bank_account_no: res.data.bank_account_no || '',
            bank_iban: res.data.bank_iban || ''
          });
        }
      } catch {
        // ignore
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.updateSupplierProfile(form);
      if (res.success) {
        addToast('Supplier business profile updated successfully!', 'success');
      } else {
        addToast(res.message || 'Failed to update profile', 'error');
      }
    } catch {
      addToast('Network error updating business profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#FAFAF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Manrope', -apple-system, sans-serif",
        color: '#64748B'
      }}>
        <Loader2 size={24} className="animate-spin" />
        <span style={{ marginLeft: '10px' }}>Loading business profile...</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAF8',
      fontFamily: "'Manrope', -apple-system, sans-serif",
      color: '#0F172A',
      padding: '40px 20px 80px'
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/supplier/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#333F70',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} /> Back to Supplier Portal
          </Link>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 20px 45px -12px rgba(51, 63, 112, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#D6F5EE',
              color: '#0D9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Company &amp; Banking Details
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Keep your legal registrations, trade licenses, and payout details up to date
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '28px' }}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Registered Business Name
              </label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={e => setForm({ ...form, company_name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FAFAF8',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={form.contact_person}
                  onChange={e => setForm({ ...form, contact_person: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FAFAF8',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  City / Base
                </label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FAFAF8',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Municipal Trade License No
                </label>
                <input
                  type="text"
                  value={form.trade_license_no}
                  onChange={e => setForm({ ...form, trade_license_no: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FAFAF8',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Tax / GST Identification
                </label>
                <input
                  type="text"
                  value={form.tax_id}
                  onChange={e => setForm({ ...form, tax_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FAFAF8',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Business Registered Address
              </label>
              <textarea
                rows={2}
                value={form.business_address}
                onChange={e => setForm({ ...form, business_address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  background: '#FAFAF8',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Banking */}
            <div style={{
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Landmark size={18} style={{ color: '#333F70' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Banking &amp; Settlement Details
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank"
                    value={form.bank_name}
                    onChange={e => setForm({ ...form, bank_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50200012345678"
                    value={form.bank_account_no}
                    onChange={e => setForm({ ...form, bank_account_no: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
                  IFSC / SWIFT / IBAN
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0000128"
                  value={form.bank_iban}
                  onChange={e => setForm({ ...form, bank_iban: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#333F70',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(51, 63, 112, 0.2)'
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
