'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { useToast } from '../../../components/Toast';
import {
  User,
  Lock,
  Save,
  Loader2,
  Compass,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  LogOut,
  ArrowRight,
  Ticket,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, updateUserState, logout } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'vouchers'
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: 'Jaipur',
    country: 'India',
    address: '',
    account_type: 'individual'
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await authService.getProfile();
        if (res.success && res.data) {
          setProfileForm({
            first_name: res.data.first_name || '',
            last_name: res.data.last_name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            city: res.data.city || 'Jaipur',
            country: res.data.country || 'India',
            address: res.data.address || '',
            account_type: res.data.account_type || 'individual'
          });
        }
      } catch (e) {
        // Fallback to user from auth hook
        if (user) {
          setProfileForm(prev => ({
            ...prev,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            phone: user.phone || ''
          }));
        }
      }
    }
    load();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const res = await authService.updateProfile({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
        account_type: profileForm.account_type,
        city: profileForm.city,
        country: profileForm.country,
        address: profileForm.address
      });

      if (res.success) {
        addToast('Profile details updated successfully!', 'success');
        const fresh = await authService.getProfile();
        if (fresh.success && fresh.data) {
          updateUserState(fresh.data);
        }
      } else {
        addToast(res.message || 'Failed to update profile', 'error');
      }
    } catch {
      addToast('Network error while updating profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      addToast('New password and confirmation do not match', 'error');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await authService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      if (res.success) {
        addToast('Password changed successfully!', 'success');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        addToast(res.message || 'Failed to change password', 'error');
      }
    } catch {
      addToast('Network error changing password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      fontFamily: "'Manrope', sans-serif",
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Luxury Editorial Header */}
      <header style={{
        padding: '20px 36px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(15, 23, 42, 0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#333F70',
              color: '#D6F5EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={20} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.1em', color: '#0F172A' }}>TRAVEL</span>
          </Link>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: '#D6F5EE',
            color: '#0F5146',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Customer Member
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/" style={{ fontSize: '13px', fontWeight: '700', color: '#333F70', textDecoration: 'none' }}>
            Explore Experiences
          </Link>
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              fontSize: '13px',
              fontWeight: '700',
              color: '#64748B',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          {/* User Profile Welcome Hero Card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px 36px',
            border: '1.5px solid rgba(51, 63, 112, 0.1)',
            boxShadow: '0 20px 45px -10px rgba(51, 63, 112, 0.08)',
            marginBottom: '28px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #333F70 0%, #1A2242 100%)',
                color: '#D6F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '900',
                boxShadow: '0 10px 24px rgba(51, 63, 112, 0.25)'
              }}>
                {(profileForm.first_name?.[0] || user?.first_name?.[0] || 'U').toUpperCase()}
                {(profileForm.last_name?.[0] || user?.last_name?.[0] || '').toUpperCase()}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: '850', color: '#0F172A', margin: 0 }}>
                    {profileForm.first_name} {profileForm.last_name}
                  </h1>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: '#ECFDF5',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}>
                    <CheckCircle2 size={13} /> Active &amp; Verified
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={14} style={{ color: '#0D9488' }} /> {profileForm.email || user?.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Phone size={14} style={{ color: '#0D9488' }} /> {profileForm.phone || user?.phone || 'Mobile added'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                background: '#333F70',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '750',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)'
              }}
            >
              <Compass size={16} /> Book Activities
            </Link>
          </div>

          {/* Segmented Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            background: '#F1F5F9',
            borderRadius: '16px',
            padding: '5px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'profile' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'profile' ? '#333F70' : '#64748B',
                boxShadow: activeTab === 'profile' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <User size={15} /> Personal Details &amp; Profile
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'security' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'security' ? '#333F70' : '#64748B',
                boxShadow: activeTab === 'security' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Lock size={15} /> Security &amp; Credentials
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('vouchers')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeTab === 'vouchers' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'vouchers' ? '#333F70' : '#64748B',
                boxShadow: activeTab === 'vouchers' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Ticket size={15} /> My Offers &amp; Vouchers
            </button>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: PERSONAL DETAILS & PROFILE EDIT FORM */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px',
              border: '1.5px solid rgba(51, 63, 112, 0.08)',
              boxShadow: '0 20px 45px -12px rgba(51, 63, 112, 0.06)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
                  Update Personal Information
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Modify your primary contact info, address, and account preferences
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.first_name}
                      onChange={e => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="admin-input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.last_name}
                      onChange={e => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="admin-input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Email Address (Verified)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profileForm.email || user?.email || ''}
                      style={{ opacity: 0.75, cursor: 'not-allowed' }}
                      className="admin-input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={profileForm.phone}
                      onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="admin-input-field"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="admin-input-field"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      value={profileForm.country}
                      onChange={e => setProfileForm({ ...profileForm, country: e.target.value })}
                      className="admin-input-field"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Residential / Billing Address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter street, apartment, or landmark"
                    value={profileForm.address}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="admin-input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Customer Account Segment
                  </label>
                  <select
                    value={profileForm.account_type}
                    onChange={e => setProfileForm({ ...profileForm, account_type: e.target.value })}
                    className="admin-input-field"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="individual">Individual Explorer (Retail Customer)</option>
                    <option value="organization">Corporate / Group Booking Coordinator</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="admin-btn-primary"
                    style={{ width: 'auto', padding: '13px 32px' }}
                  >
                    {profileLoading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Profile Changes</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SECURITY & PASSWORD UPDATE FORM */}
          {/* ========================================================= */}
          {activeTab === 'security' && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px',
              border: '1.5px solid rgba(51, 63, 112, 0.08)',
              boxShadow: '0 20px 45px -12px rgba(51, 63, 112, 0.06)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
                  Change Password &amp; Security
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Ensure your account is protected with a strong, distinct password
                </p>
              </div>

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '520px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="admin-input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="admin-input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Repeat new password"
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="admin-input-field"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="admin-btn-primary"
                    style={{ width: 'auto', padding: '13px 32px' }}
                  >
                    {passwordLoading ? <Loader2 size={16} className="animate-spin" /> : <><Lock size={16} /> Update Password</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: OFFERS & VOUCHERS CLAIMED */}
          {/* ========================================================= */}
          {activeTab === 'vouchers' && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px',
              border: '1.5px solid rgba(51, 63, 112, 0.08)',
              boxShadow: '0 20px 45px -12px rgba(51, 63, 112, 0.06)'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '850', color: '#0F172A', margin: '0 0 6px' }}>
                  Available Travel Vouchers
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Special coupon codes active on your account for instant discounts
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {[
                  { code: 'FIRSTTRIP10', title: '10% Welcome Discount', valid: 'Active on any first booking' },
                  { code: 'EARLY25', title: '25% Advance Booking', valid: 'Valid 30+ days in advance' },
                  { code: 'GROUPFUN', title: '₹3,000 Off Squad Tour', valid: 'Min. 4 travelers' }
                ].map((v, idx) => (
                  <div key={idx} style={{
                    padding: '18px',
                    borderRadius: '16px',
                    background: '#FAFAF8',
                    border: '1.5px dashed #CBD5E1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#0D9488', textTransform: 'uppercase', marginBottom: '4px' }}>Coupon Code</div>
                      <div style={{ fontSize: '18px', fontWeight: '900', fontFamily: 'monospace', color: '#1E293B', marginBottom: '6px' }}>{v.code}</div>
                      <div style={{ fontSize: '13px', fontWeight: '750', color: '#0F172A' }}>{v.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{v.valid}</div>
                    </div>
                    <Link href="/" style={{ marginTop: '14px', fontSize: '12px', fontWeight: '800', color: '#333F70', textDecoration: 'none' }}>
                      Apply to Tours →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
