'use client';
export default function PartnerPromos({ onBecomeSupplier, onBecomePartner }) {
  return (
    <section className="partner-promos-section" aria-label="Partner Promotions">
      <div className="site-container">
        <div className="partner-promos-grid">

          {/* Card 1: Supplier / Activity Host Panel (Pale Mint Surface) */}
          <div className="partner-promo-card partner-card-supplier">
            <div className="partner-card-glow"></div>

            <div className="partner-promo-img-wrap">
              <img src="/assets/images/promo_supplier.jpg" alt="Activity service provider host welcoming guests"
                className="partner-promo-img" loading="lazy" />
              <span className="partner-img-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                For Activity Hosts
              </span>
            </div>

            <div className="partner-promo-content">
              <span className="partner-promo-tag">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Host With Travel
              </span>
              <h3 className="partner-promo-title">
                List Your Activity With Us
              </h3>
              <p className="partner-promo-desc">
                Connect with thousands of travelers worldwide and boost your direct booking revenue.
              </p>

              <div className="partner-feature-pills">
                <span className="partner-pill">✓ Zero Setup Fee</span>
                <span className="partner-pill">✓ Instant Payouts</span>
                <span className="partner-pill">✓ 24/7 Host Support</span>
              </div>

              <div>
                <a
                  href="#!"
                  data-route="becomeSupplier"
                  className="partner-promo-btn cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onBecomeSupplier) onBecomeSupplier();
                  }}
                >
                  <span>Become a Service Provider</span>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Travel Partner Panel (Dark Royal Navy Surface) */}
          <div className="partner-promo-card partner-card-b2b">
            <div className="partner-card-glow"></div>

            <div className="partner-promo-img-wrap">
              <img src="/assets/images/promo_partner.jpg" alt="Travel agency business partners collaborating"
                className="partner-promo-img" loading="lazy" />
              <span className="partner-img-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                B2B Agency Network
              </span>
            </div>

            <div className="partner-promo-content">
              <span className="partner-promo-tag">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Partner Program
              </span>
              <h3 className="partner-promo-title">
                Grow Your Travel Business With Us
              </h3>
              <p className="partner-promo-desc">
                Access curated tours, activities, and private experiences at exclusive wholesale B2B partner rates.
              </p>

              <div className="partner-feature-pills">
                <span className="partner-pill">✓ Wholesale Rates</span>
                <span className="partner-pill">✓ Dedicated Manager</span>
                <span className="partner-pill">✓ Bulk Booking API</span>
              </div>

              <div>
                <a
                  href="#!"
                  data-route="becomeTravelPartner"
                  className="partner-promo-btn cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onBecomePartner) onBecomePartner();
                  }}
                >
                  <span>Become a Travel Partner</span>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
