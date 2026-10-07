'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HeroHeaderSection({
  user,
  role,
  isAuthenticated,
  onOpenAuth,
  onLogout,
  onSearch
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [partnersDropdown, setPartnersDropdown] = useState(false);
  const [mobilePartnersOpen, setMobilePartnersOpen] = useState(false);

  const [destination, setDestination] = useState('');
  const [activity, setActivity] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('1');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch({ destination, activity, date, guests });
  };

  const getDashboardUrl = () => {
    if (['site_admin', 'site_accountant', 'finance'].includes(role)) return '/admin/dashboard';
    if (role === 'supplier') return '/supplier/dashboard';
    return '/customer/profile';
  };

  return (
    <>
      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full transition-all duration-300">
        <div className="site-container">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 font-extrabold text-2xl md:text-3xl tracking-wider focus:outline-none rounded-md"
              aria-label="LOGO Home"
            >
              <span style={{ color: '#FFFFFF', letterSpacing: '0.06em', textShadow: '0 2px 4px rgba(0,0,0,0.35)' }}>
                LOGO
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold" aria-label="Main Navigation">
              <Link href="/" style={{ color: '#FFFFFF' }} className="hover:text-[#D6F5EE] transition-colors py-1">Home</Link>
              <a href="#dest-heading" style={{ color: 'rgba(255, 255, 255, 0.92)' }} className="hover:text-[#D6F5EE] transition-colors py-1">Activities</a>
              <a href="#dest-heading" style={{ color: 'rgba(255, 255, 255, 0.92)' }} className="hover:text-[#D6F5EE] transition-colors py-1">Destinations</a>
              <a href="#trending-heading" style={{ color: 'rgba(255, 255, 255, 0.92)' }} className="hover:text-[#D6F5EE] transition-colors py-1">Experiences</a>
              <a href="#category-heading" style={{ color: 'rgba(255, 255, 255, 0.92)' }} className="hover:text-[#D6F5EE] transition-colors py-1">AI Trip Planner</a>
              <a href="#offers-heading" style={{ color: 'rgba(255, 255, 255, 0.92)' }} className="hover:text-[#D6F5EE] transition-colors py-1">Offers</a>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Partners Dropdown Menu */}
              <div className="relative" id="partners-dropdown-container">
                <button
                  type="button"
                  id="partners-menu-btn"
                  aria-haspopup="true"
                  aria-expanded={partnersDropdown}
                  onClick={() => setPartnersDropdown(!partnersDropdown)}
                  style={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    background: partnersDropdown ? '#FFFFFF' : 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold border rounded-lg transition-all duration-200 cursor-pointer ${
                    partnersDropdown ? '!text-[#333F70]' : 'hover:bg-white hover:!text-[#333F70]'
                  }`}
                >
                  <span>Partners</span>
                  <svg className={`w-4 h-4 chevron-icon transition-transform duration-200 ${partnersDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {partnersDropdown && (
                  <div
                    id="partners-menu"
                    role="menu"
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2.5 border border-slate-100 text-slate-800 z-50"
                  >
                    <button
                      type="button"
                      onClick={() => { setPartnersDropdown(false); onOpenAuth('supplier', 'signup'); }}
                      className="w-full text-left block px-4 py-2.5 text-sm hover:bg-[#D6F5EE]/40 hover:text-[#333F70] transition-colors cursor-pointer"
                    >
                      Become a Supplier
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPartnersDropdown(false); onOpenAuth('supplier', 'signup'); }}
                      className="w-full text-left block px-4 py-2.5 text-sm hover:bg-[#D6F5EE]/40 hover:text-[#333F70] transition-colors cursor-pointer"
                    >
                      Become a Travel Partner
                    </button>
                    <a
                      href="#about-us"
                      onClick={() => setPartnersDropdown(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-[#D6F5EE]/40 hover:text-[#333F70] transition-colors"
                    >
                      About Us
                    </a>
                    <a
                      href="#contact-support"
                      onClick={() => setPartnersDropdown(false)}
                      className="block px-4 py-2.5 text-sm hover:bg-[#D6F5EE]/40 hover:text-[#333F70] transition-colors"
                    >
                      Contact Us
                    </a>
                  </div>
                )}
              </div>

              {/* Login / Sign Up or Authenticated State */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={getDashboardUrl()}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold bg-[#D6F5EE] text-[#333F70] rounded-lg hover:bg-white transition-all shadow"
                  >
                    {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Dashboard'} ({role === 'site_admin' ? 'Admin' : role === 'supplier' ? 'Supplier' : 'Customer'})
                  </Link>
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Logout"
                    className="p-2 text-white hover:text-red-300 rounded-lg border border-white/40 hover:bg-white/10 cursor-pointer"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth('customer', 'signin')}
                  style={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                  className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold border rounded-lg hover:bg-white hover:!text-[#333F70] transition-all duration-200 cursor-pointer"
                >
                  Login / Sign Up
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                id="mobile-menu-btn"
                aria-expanded={mobileMenuOpen}
                aria-label="Open mobile navigation menu"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-white hover:text-[#D6F5EE] focus:outline-none rounded-lg cursor-pointer"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer & Backdrop */}
        {mobileMenuOpen && (
          <>
            <div
              id="mobile-menu-backdrop"
              className="fixed inset-0 bg-black/60 z-50 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div
              id="mobile-menu"
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#333F70] text-white z-50 p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <span className="font-extrabold text-2xl tracking-wider text-white">LOGO</span>
                  <button
                    type="button"
                    id="mobile-menu-close-btn"
                    aria-label="Close mobile menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-white/80 hover:text-white rounded-lg focus:outline-none cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <nav className="flex flex-col gap-4 text-base font-semibold" aria-label="Mobile Navigation">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#D6F5EE] transition-colors py-1.5">Home</Link>
                  <a href="#dest-heading" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#D6F5EE] transition-colors py-1.5">Activities</a>
                  <a href="#dest-heading" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#D6F5EE] transition-colors py-1.5">Destinations</a>
                  <a href="#trending-heading" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#D6F5EE] transition-colors py-1.5">Experiences</a>
                  <a href="#offers-heading" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#D6F5EE] transition-colors py-1.5">Offers</a>

                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setMobilePartnersOpen(!mobilePartnersOpen)}
                      className="w-full flex items-center justify-between text-white hover:text-[#D6F5EE] py-2 text-left cursor-pointer"
                    >
                      <span>Partners</span>
                      <svg className={`w-4 h-4 chevron-icon transition-transform duration-200 ${mobilePartnersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    {mobilePartnersOpen && (
                      <div className="pl-4 flex flex-col gap-2.5 pt-2 text-sm text-white/80">
                        <button
                          type="button"
                          onClick={() => { setMobileMenuOpen(false); onOpenAuth('supplier', 'signup'); }}
                          className="text-left text-white/90 hover:text-[#D6F5EE] py-1 cursor-pointer"
                        >
                          Become a Supplier
                        </button>
                        <button
                          type="button"
                          onClick={() => { setMobileMenuOpen(false); onOpenAuth('supplier', 'signup'); }}
                          className="text-left text-white/90 hover:text-[#D6F5EE] py-1 cursor-pointer"
                        >
                          Become a Travel Partner
                        </button>
                        <a href="#about-us" onClick={() => setMobileMenuOpen(false)} className="text-white/90 hover:text-[#D6F5EE] py-1">About Us</a>
                        <a href="#contact-support" onClick={() => setMobileMenuOpen(false)} className="text-white/90 hover:text-[#D6F5EE] py-1">Contact Us</a>
                      </div>
                    )}
                  </div>
                </nav>
              </div>

              <div className="pt-6 border-t border-white/10">
                {isAuthenticated ? (
                  <Link
                    href={getDashboardUrl()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center px-5 py-3 text-center text-sm font-bold bg-[#D6F5EE] text-[#333F70] rounded-xl hover:bg-white transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth('customer', 'signin'); }}
                    className="w-full flex items-center justify-center px-5 py-3 text-center text-sm font-bold bg-[#D6F5EE] text-[#333F70] rounded-xl hover:bg-white transition-colors cursor-pointer"
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* HERO SECTION */}
      <section
        id="hero-section"
        className="relative w-full min-h-[760px] sm:min-h-[820px] md:min-h-[850px] lg:min-h-[850px] flex items-center justify-center overflow-hidden bg-slate-900"
        aria-label="Hero Experience Showcase"
      >
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            id="hero-bg-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/images/hero_bg.jpg"
            className="w-full h-full object-cover object-center pointer-events-none"
          >
            <source src="/assets/images/Hero_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
          <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-black/70 to-transparent pointer-events-none"></div>
        </div>

        <div className="site-container relative z-20 text-center text-white pt-24 sm:pt-28 md:pt-32 pb-28 sm:pb-32 hero-content-wrap">
          <h1 className="hero-main-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-wide max-w-5xl mx-auto drop-shadow-md leading-tight text-white">
            Discover and Book Amazing Experiences Worldwide
          </h1>
          <p className="hero-sub-primary mt-4 sm:mt-5 text-base sm:text-xl md:text-2xl font-medium text-white max-w-3xl mx-auto drop-shadow-sm">
            Find Activities, Tours and Adventures for Every Journey
          </p>
          <p className="hero-sub-secondary mt-2 text-xs sm:text-sm md:text-base font-normal text-white/80 max-w-2xl mx-auto">
            Search by Destination, Activity or Experience
          </p>

          <div className="hero-ctas-group mt-8 sm:mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#category-heading"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.85)',
                borderRadius: '12px'
              }}
              className="hero-btn-ai inline-flex items-center justify-center px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold hover:bg-white hover:!text-[#333F70] shadow-lg transition-all duration-200"
            >
              Plan Your Trip with AI
            </a>
            <a
              href="#category-heading"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '12px'
              }}
              className="hero-btn-explore inline-flex items-center justify-center px-6 sm:px-8 py-3.5 text-sm sm:text-base font-bold hover:bg-white/20 shadow-md transition-all duration-200"
            >
              Explore Now
            </a>
          </div>
        </div>

        <div className="brush-edge-bottom" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
          <img
            src="/assets/images/hero_brush_bottom.png"
            alt=""
            className="w-full h-16 sm:h-20 md:h-24 lg:h-28 object-fill select-none"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* FLOATING SEARCH PANEL */}
      <div className="site-container relative z-30 hero-floating-panel" style={{ transform: 'translateY(-45%)', marginTop: '0', top: '0', marginBottom: '-2rem' }}>
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 45px -10px rgba(51, 63, 112, 0.16)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            padding: '20px 24px'
          }}
        >
          <form
            id="hero-search-form"
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end"
            aria-label="Activity Search Panel"
          >
            {/* Destination Field */}
            <div className="lg:col-span-3">
              <label
                htmlFor="search-destination"
                style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}
              >
                Where Are You Going?
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748B',
                    zIndex: 2
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="#333F70" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  id="search-destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destination..."
                  style={{
                    width: '100%',
                    height: '50px',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Activity Field */}
            <div className="lg:col-span-3">
              <label
                htmlFor="search-activity"
                style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}
              >
                Select Activity
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748B',
                    zIndex: 2
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="#333F70" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </span>
                <select
                  id="search-activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    paddingLeft: '44px',
                    paddingRight: '36px',
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                  }}
                >
                  <option value="">Select activity</option>
                  <option value="adventure">Adventure Activities</option>
                  <option value="desert">Desert Experiences</option>
                  <option value="wildlife">Wildlife & Nature</option>
                  <option value="water">Water Sports</option>
                  <option value="air">Air Adventures</option>
                  <option value="sightseeing">Sightseeing Tours</option>
                  <option value="cultural">Cultural Experiences</option>
                  <option value="food">Food & Dining Experiences</option>
                </select>
                <span
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </span>
              </div>
            </div>

            {/* Date Field */}
            <div className="lg:col-span-2">
              <label
                htmlFor="search-date"
                style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.08em', color: '#475569', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}
              >
                Choose Date
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748B',
                    zIndex: 2
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="#333F70" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </span>
                <input
                  type="date"
                  id="search-date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    paddingLeft: '44px',
                    paddingRight: '12px',
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Guests Counter Field (Exact URL Component) */}
            <div className="lg:col-span-2">
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.08em',
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'block'
                }}
              >
                Number of Guests
              </span>
              <div
                style={{
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '12px',
                  boxSizing: 'border-box'
                }}
              >
                <button
                  type="button"
                  id="guest-minus"
                  aria-label="Decrease guest count"
                  onClick={() => setGuests((prev) => Math.max(1, (parseInt(prev) || 1) - 1).toString())}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: '800',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  className="hover:bg-slate-100 active:scale-95 transition-all"
                >
                  -
                </button>
                <span
                  id="guest-count"
                  style={{
                    fontWeight: '800',
                    color: '#1E293B',
                    fontSize: '14px'
                  }}
                >
                  {guests}
                </span>
                <button
                  type="button"
                  id="guest-plus"
                  aria-label="Increase guest count"
                  onClick={() => setGuests((prev) => ((parseInt(prev) || 1) + 1).toString())}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: '800',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  className="hover:bg-slate-100 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Search Submit Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                id="search-submit-btn"
                style={{
                  width: '100%',
                  height: '50px',
                  background: '#333F70',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(51, 63, 112, 0.25)',
                  cursor: 'pointer'
                }}
                className="hover:bg-[#273157] active:scale-[0.98] transition-all"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>Search Experiences</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
