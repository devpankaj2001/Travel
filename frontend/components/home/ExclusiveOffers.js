'use client';
export default function ExclusiveOffers({ onCopyCode, onClaimOffer }) {
  return (
    <section className="offers-section" aria-labelledby="offers-heading">
      <div className="site-container">
        {/* Section Header */}
        <div className="offers-header">
          <span className="offers-badge">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Exclusive Promo Deals
          </span>
          <h2 id="offers-heading" className="offers-title">
            Exclusive Deals and Offers
          </h2>
          <p className="offers-subtitle">
            Unlock instant promo codes, early-bird vouchers, and group travel discounts on your next escape.
          </p>
        </div>

        {/* 4 Luxury Voucher Cards */}
        <div className="offers-grid">

          {/* Deal 1: Limited-Time Discounts */}
          <div className="offer-voucher-card theme-coral">
            <div className="offer-img-wrap">
              <img src="/assets/images/offer_limited.jpg" alt="Limited-Time Discounts on coastal tours" className="offer-img"
                loading="lazy" />
              <div className="offer-img-gradient"></div>
              <span className="offer-badge-floating">⚡ Flash Sale</span>
              <span className="offer-discount-chip">UP TO 40% OFF</span>
            </div>
            {/* Perforated Ticket Divider */}
            <div className="offer-ticket-divider">
              <div className="offer-notch-left"></div>
              <div className="offer-dashed-line"></div>
              <div className="offer-notch-right"></div>
            </div>
            <div className="offer-card-body">
              <h3 className="offer-card-title">Limited-Time Discounts</h3>
              <p className="offer-card-desc">Instant flash savings on premier boat rides, lake tours, and coastal stays.</p>

              {/* Coupon Code Box */}
              <div className="offer-coupon-box" onClick={() => onCopyCode && onCopyCode('FLASH40')} title="Click to copy code">
                <div className="offer-coupon-info">
                  <span className="offer-coupon-label">Coupon Code</span>
                  <span className="offer-coupon-code">FLASH40</span>
                </div>
                <button type="button" className="offer-copy-btn" aria-label="Copy FLASH40 code">
                  <span>Copy</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="offer-footer-row">
                <span className="offer-validity-tag">
                  <span className="offer-pulse-dot"></span>
                  Valid 48 Hours
                </span>
                <a href="#!" data-route="offers" className="offer-claim-btn">
                  <span>Claim Offer</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Deal 2: Early Booking Offers */}
          <div className="offer-voucher-card theme-blue">
            <div className="offer-img-wrap">
              <img src="/assets/images/offer_early.jpg" alt="Early Booking Offers on luxury resorts" className="offer-img"
                loading="lazy" />
              <div className="offer-img-gradient"></div>
              <span className="offer-badge-floating">✈️ Advance Saver</span>
              <span className="offer-discount-chip">FLAT 25% OFF</span>
            </div>
            {/* Perforated Ticket Divider */}
            <div className="offer-ticket-divider">
              <div className="offer-notch-left"></div>
              <div className="offer-dashed-line"></div>
              <div className="offer-notch-right"></div>
            </div>
            <div className="offer-card-body">
              <h3 className="offer-card-title">Early Booking Offers</h3>
              <p className="offer-card-desc">Book 30+ days early and enjoy complimentary wellness treatments & upgrades.</p>

              {/* Coupon Code Box */}
              <div className="offer-coupon-box" onClick={() => onCopyCode && onCopyCode('EARLY25')} title="Click to copy code">
                <div className="offer-coupon-info">
                  <span className="offer-coupon-label">Coupon Code</span>
                  <span className="offer-coupon-code">EARLY25</span>
                </div>
                <button type="button" className="offer-copy-btn" aria-label="Copy EARLY25 code">
                  <span>Copy</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="offer-footer-row">
                <span className="offer-validity-tag">
                  <span className="offer-pulse-dot"></span>
                  Valid 2026 Trips
                </span>
                <a href="#!" data-route="offers" className="offer-claim-btn">
                  <span>Claim Offer</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Deal 3: Group Booking Discounts */}
          <div className="offer-voucher-card theme-teal">
            <div className="offer-img-wrap">
              <img src="/assets/images/offer_group.jpg" alt="Group Booking Discounts for friends and teams"
                className="offer-img" loading="lazy" />
              <div className="offer-img-gradient"></div>
              <span className="offer-badge-floating">👥 Squad & Team</span>
              <span className="offer-discount-chip">SAVE ₹3,000</span>
            </div>
            {/* Perforated Ticket Divider */}
            <div className="offer-ticket-divider">
              <div className="offer-notch-left"></div>
              <div className="offer-dashed-line"></div>
              <div className="offer-notch-right"></div>
            </div>
            <div className="offer-card-body">
              <h3 className="offer-card-title">Group Booking Discounts</h3>
              <p className="offer-card-desc">Special companion rates and dedicated tour coordinators for 4+ travelers.</p>

              {/* Coupon Code Box */}
              <div className="offer-coupon-box" onClick={() => onCopyCode && onCopyCode('GROUPFUN')} title="Click to copy code">
                <div className="offer-coupon-info">
                  <span className="offer-coupon-label">Coupon Code</span>
                  <span className="offer-coupon-code">GROUPFUN</span>
                </div>
                <button type="button" className="offer-copy-btn" aria-label="Copy GROUPFUN code">
                  <span>Copy</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="offer-footer-row">
                <span className="offer-validity-tag">
                  <span className="offer-pulse-dot"></span>
                  Min. 4 Guests
                </span>
                <a href="#!" data-route="offers" className="offer-claim-btn">
                  <span>Claim Offer</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Deal 4: Seasonal Special Offers */}
          <div className="offer-voucher-card theme-amber">
            <div className="offer-img-wrap">
              <img src="/assets/images/offer_seasonal.jpg" alt="Seasonal Special Offers on mountain getaways"
                className="offer-img" loading="lazy" />
              <div className="offer-img-gradient"></div>
              <span className="offer-badge-floating">🌴 Festive Special</span>
              <span className="offer-discount-chip">EXTRA 20% OFF</span>
            </div>
            {/* Perforated Ticket Divider */}
            <div className="offer-ticket-divider">
              <div className="offer-notch-left"></div>
              <div className="offer-dashed-line"></div>
              <div className="offer-notch-right"></div>
            </div>
            <div className="offer-card-body">
              <h3 className="offer-card-title">Seasonal Special Offers</h3>
              <p className="offer-card-desc">Curated festive retreats, sunset cruises, and seasonal mountain getaways.</p>

              {/* Coupon Code Box */}
              <div className="offer-coupon-box" onClick={() => onCopyCode && onCopyCode('SEASON20')} title="Click to copy code">
                <div className="offer-coupon-info">
                  <span className="offer-coupon-label">Coupon Code</span>
                  <span className="offer-coupon-code">SEASON20</span>
                </div>
                <button type="button" className="offer-copy-btn" aria-label="Copy SEASON20 code">
                  <span>Copy</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="offer-footer-row">
                <span className="offer-validity-tag">
                  <span className="offer-pulse-dot"></span>
                  High Demand
                </span>
                <a href="#!" data-route="offers" className="offer-claim-btn">
                  <span>Claim Offer</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Centered View All CTA */}
        <div className="offers-cta-wrap">
          <a href="#!" data-route="offers" className="offers-view-all-cta">
            <span>View All 18+ Active Offers</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Interactive 1-Click Copy Script */}
        
      </div>
    </section>
  );
}
