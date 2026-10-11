'use client';
import { useState } from 'react';

export default function AppShowcase({ onNotifyMe }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNotifyMe) onNotifyMe(email);
    setEmail('');
  };

  return (
    <section className="app-section-wrapper" aria-labelledby="app-heading">
      <div className="site-container">
        <div className="app-showcase-container">
          {/* Ambient Decorative Contours & Glows */}
          <div className="app-contour-bg"></div>
          <div className="app-ambient-blob-1"></div>
          <div className="app-ambient-blob-2"></div>

          <div className="app-showcase-grid">

            {/* Left: High-Converting Content & Feature Cards */}
            <div className="app-content-col">
              <div className="app-coming-badge">
                <span className="app-live-dot"></span>
                <span>TRAVEL APP &bull; COMING SOON</span>
                <span className="app-badge-tag">VIP BETA</span>
              </div>

              <h2 id="app-heading" className="app-main-title">
                The Entire World of Travel,<br />
                <span className="app-gradient-text">Right in Your Pocket</span>
              </h2>

              <p className="app-main-desc">
                Explore 10,000+ handpicked adventures, unlock instant offline boarding passes, and enjoy live GPS guide
                radar &mdash; built for curious travelers who never stop discovering.
              </p>

              {/* 3 Interactive Feature Cards */}
              <div className="app-features-grid">
                {/* Card 1 */}
                <div className="app-feat-card">
                  <div className="app-feat-icon-wrap">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div className="app-feat-content">
                    <h4 className="app-feat-title">Offline Boarding Passes &amp; QR Entry</h4>
                    <p className="app-feat-text">100% paperless digital passes saved directly to Apple Wallet &amp; Google
                      Pay without internet.</p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="app-feat-card">
                  <div className="app-feat-icon-wrap">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="app-feat-content">
                    <h4 className="app-feat-title">Live Guide &amp; Pickup Radar</h4>
                    <p className="app-feat-text">Real-time driver GPS coordinates, meetup point navigation &amp; instant
                      1-tap guide chat.</p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="app-feat-card">
                  <div className="app-feat-icon-wrap">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="app-feat-content">
                    <h4 className="app-feat-title">15% Launch Member Voucher</h4>
                    <p className="app-feat-text">Early waitlist travelers get an automatic 15% discount applied on their
                      first 3 mobile bookings.</p>
                  </div>
                </div>
              </div>

              {/* VIP Early Access Pre-Registration Box */}
              <div className="app-vip-box">
                <div className="app-vip-header">
                  <div className="app-vip-title-group">
                    <span className="app-vip-sparkle">✨</span>
                    <span className="app-vip-title">Get VIP Early Access When We Launch</span>
                  </div>
                  <div className="app-vip-platforms">
                    <span className="app-platform-pill" title="Apple iOS App (Coming Soon)">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path
                          d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.17.67-2.85 1.46-.59.68-1.11 1.77-.97 2.83 1.11.09 2.22-.56 2.86-1.34z" />
                      </svg>
                      iOS
                    </span>
                    <span className="app-platform-pill" title="Android Google Play (Coming Soon)">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path
                          d="M3.609 1.814L13.792 12 3.61 22.186c-.307-.267-.487-.677-.487-1.168V2.982c0-.491.18-.901.486-1.168zm11.233 11.236l2.383 2.383-11.45 6.44 9.067-8.823zm2.383-4.083l-2.383 2.383-9.067-8.823 11.45 6.44zm1.186 2.042l3.208 1.805c.954.537.954 1.417 0 1.954l-3.208 1.805-2.091-2.092 2.091-2.072z" />
                      </svg>
                      Android
                    </span>
                  </div>
                </div>

                <form className="app-vip-form" onSubmit={handleSubmit}>
                  <div className="app-vip-input-wrap">
                    <svg className="app-vip-input-icon" width="18" height="18" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <input
                      type="email"
                      className="app-vip-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for private beta invite..."
                      required
                    />
                  </div>
                  <button type="submit" className="app-vip-btn cursor-pointer">
                    <span>Notify Me</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>

                <div className="app-vip-footer">
                  <div className="app-vip-avatars">
                    <img src="/assets/images/avatar_1.jpg" alt="Traveler" className="app-avatar-circle" />
                    <img src="/assets/images/avatar_2.jpg" alt="Traveler" className="app-avatar-circle" />
                    <img src="/assets/images/avatar_3.jpg" alt="Traveler" className="app-avatar-circle" />
                  </div>
                  <span className="app-vip-social-proof">
                    <strong>8,450+</strong> travelers already on the waitlist &bull; 🔒 100% spam-free
                  </span>
                </div>
              </div>

            </div>

            {/* Right: Realistic 3D Mobile App Mockup Showcase */}
            <div className="app-mockup-stage">
              <div className="app-mockup-halo"></div>

              {/* Floating Glass Micro-Cards Outside Screens */}
              <div className="app-float-card app-card-top-right">
                <div className="app-float-icon-box icon-mint">✓</div>
                <div className="app-float-info">
                  <span className="app-float-headline">Offline Pass Ready</span>
                  <span className="app-float-sub">Desert Camel Safari</span>
                </div>
              </div>

              <div className="app-float-card app-card-bottom-left">
                <div className="app-float-icon-box icon-amber">★</div>
                <div className="app-float-info">
                  <span className="app-float-headline">4.9 Star Rating</span>
                  <span className="app-float-sub">14,200+ Reviews Preview</span>
                </div>
              </div>

              <div className="app-mockup-main-box">
                <img src="/assets/images/traval_app_mockup.png"
                  alt="Travel Mobile App 3D Preview - Discover Tours & Instant Digital Passes" className="app-mockup-image"
                  loading="lazy" />
                <div className="app-phone-ground-shadow"></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
