'use client';
export default function NewsletterSection({ onSubscribe }) {
  return (
    <section className="newsletter-section-wrapper" aria-labelledby="newsletter-heading">
      <div className="site-container">
        <div className="newsletter-card">
          {/* Background Ambient Glow & Patterns */}
          <div className="newsletter-ambient-glow-1"></div>
          <div className="newsletter-ambient-glow-2"></div>

          <div className="newsletter-inner-grid">

            {/* Left Content: Value Proposition & Perks */}
            <div className="newsletter-content-col">
              <div className="newsletter-badge">
                <span>✈️</span>
                <span>TRAVEL CLUB</span>
                <span className="newsletter-badge-highlight">FREE ACCESS</span>
              </div>

              <h2 id="newsletter-heading" className="newsletter-title">
                Get Travel Inspiration &amp;<br />
                <span className="newsletter-gradient-text">Exclusive Member Offers</span>
              </h2>

              <p className="newsletter-subtitle">
                Join 250,000+ smart explorers who receive curated weekend itineraries, secret flash deals, and
                early-bird tour vouchers every Thursday.
              </p>

              {/* 3 Micro Value Pills */}
              <div className="newsletter-perks-row">
                <div className="newsletter-perk-item">
                  <span className="newsletter-perk-check">✓</span>
                  <span>Instant ₹1,000 Welcome Voucher</span>
                </div>
                <div className="newsletter-perk-item">
                  <span className="newsletter-perk-check">✓</span>
                  <span>Up to 35% Secret Flash Deals</span>
                </div>
                <div className="newsletter-perk-item">
                  <span className="newsletter-perk-check">✓</span>
                  <span>100% Free &bull; Zero Spam</span>
                </div>
              </div>
            </div>

            {/* Right: High Converting Subscription Card */}
            <div className="newsletter-form-col">
              <div className="newsletter-form-card">

                <div className="newsletter-form-header">
                  <div className="newsletter-icon-circle">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="newsletter-form-title-group">
                    <h3 className="newsletter-form-title">Subscribe to the Newsletter</h3>
                    <span className="newsletter-form-desc">Get your welcome voucher in your inbox</span>
                  </div>
                </div>

                <form id="newsletter-form" className="newsletter-form" novalidate>
                  <div className="newsletter-input-wrap">
                    <span className="newsletter-input-icon">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </span>
                    <input type="email" id="newsletter-email" placeholder="Enter your email address..." required
                      className="newsletter-input" />
                  </div>
                  <button type="submit" className="newsletter-submit-btn">
                    <span>Subscribe Now</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
                <span id="newsletter-feedback" className="hidden"></span>

                {/* Trust Line below form */}
                <div className="newsletter-trust-row">
                  <div className="newsletter-trust-avatars">
                    <img src="/assets/images/avatar_1.jpg" alt="Subscriber" className="newsletter-avatar-img" />
                    <img src="/assets/images/avatar_2.jpg" alt="Subscriber" className="newsletter-avatar-img" />
                    <img src="/assets/images/avatar_3.jpg" alt="Subscriber" className="newsletter-avatar-img" />
                  </div>
                  <span className="newsletter-trust-text">Join <strong>250,000+</strong> subscribers &bull; 🔒 1-click
                    unsubscribe anytime</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
