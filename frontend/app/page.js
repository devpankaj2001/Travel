'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import AuthModal from '../components/AuthModal';

import HeroHeaderSection from '../components/home/HeroHeaderSection';
import CategoryMarquee from '../components/home/CategoryMarquee';
import PopularDestinations from '../components/home/PopularDestinations';
import TrendingExperiences from '../components/home/TrendingExperiences';
import HandpickedCollections from '../components/home/HandpickedCollections';
import ExclusiveOffers from '../components/home/ExclusiveOffers';
import PartnerPromos from '../components/home/PartnerPromos';
import AppShowcase from '../components/home/AppShowcase';
import StudioFooter from '../components/home/StudioFooter';
import AiChatbotWidget from '../components/home/AiChatbotWidget';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuth();
  const { addToast } = useToast();

  // Auth Modal State
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    role: 'customer',
    mode: 'signin'
  });

  const openAuth = (targetRole, targetMode) => {
    if (targetRole === 'supplier' && targetMode === 'signup') {
      router.push('/supplier/signup');
      return;
    }
    if (targetMode === 'signin') {
      router.push('/login');
      return;
    }
    setAuthModal({
      isOpen: true,
      role: targetRole || 'customer',
      mode: targetMode || 'signin'
    });
  };

  const handleCopyPromo = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        addToast(`🎉 Copied coupon "${code}"! Apply at checkout for discount.`, 'success');
      }).catch(() => {
        addToast(`Coupon Code: ${code}`, 'info');
      });
    } else {
      addToast(`Coupon Code: ${code}`, 'info');
    }
  };

  const handleSearch = (searchData) => {
    addToast(
      `Searching activities in "${searchData.destination || 'All Destinations'}" for ${searchData.guests} guest(s)...`,
      'info'
    );
  };

  const handleNotifyMe = (email) => {
    addToast(`🎉 Success! ${email} added to the Travel VIP Mobile App early access list.`, 'success');
  };

  return (
    <div className="relative min-h-screen bg-white font-sans text-slate-800 antialiased overflow-x-hidden">

      {/* 2. HERO + HEADER + SEARCH PANEL */}
      <HeroHeaderSection
        user={user}
        role={role}
        isAuthenticated={isAuthenticated}
        onOpenAuth={openAuth}
        onLogout={logout}
        onSearch={handleSearch}
      />

      {/* MAIN SECTIONS CONTAINER - EXACT MATCH WITH bookingplatform-two.vercel.app */}
      <main id="main-content" className="min-h-screen">
        {/* 3. EXPLORE EXPERIENCES BY CATEGORY (3 Infinite Marquee Rows) */}
        <CategoryMarquee onSelectCategory={(cat) => openAuth('customer', 'signin')} />

        {/* 4. EXPLORE POPULAR DESTINATIONS */}
        <PopularDestinations onSelectDestination={(dest) => openAuth('customer', 'signin')} />

        {/* 5. TRENDING EXPERIENCES (Bento Grid: 2 Tall Cards + 3 Stacked Cards) */}
        <TrendingExperiences onBookExperience={(exp) => openAuth('customer', 'signin')} />

        {/* 6. HANDPICKED EXPERIENCES FOR YOU (10 Themed Photographic Collections) */}
        <HandpickedCollections onSelectCollection={(col) => openAuth('customer', 'signin')} />

        {/* 7. EXCLUSIVE DEALS AND OFFERS (4 Luxury Perforated Voucher Cards) */}
        <ExclusiveOffers onCopyCode={handleCopyPromo} onClaimOffer={(offer) => openAuth('customer', 'signin')} />

        {/* 8. SUPPLIER & TRAVEL PARTNER PROMOTIONS (Host With Travel & Grow Your Business) */}
        <PartnerPromos
          onBecomeSupplier={() => router.push('/supplier/signup')}
          onBecomePartner={() => router.push('/supplier/signup')}
        />

        {/* 9. VIP MOBILE APP SHOWCASE */}
        <AppShowcase onNotifyMe={handleNotifyMe} />
      </main>

      {/* 14. SITE STUDIO FOOTER */}
      <StudioFooter onOpenAuth={openAuth} />

      {/* 15. FLOATING TRAVEL AI BOT CONCIERGE WIDGET */}
      <AiChatbotWidget />

      {/* 16. AUTHENTICATION MODAL (Customer / Supplier / Admin) */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialRole={authModal.role}
        initialMode={authModal.mode}
      />
    </div>
  );
}
