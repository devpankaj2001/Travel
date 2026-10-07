'use client';
export default function WhyBookSection() {
  return (
    <section className="why-book-section py-16 md:py-20" aria-labelledby="why-heading">
      <div className="site-container">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#333F70]/10 text-[#333F70] mb-3">
            <svg className="w-3.5 h-3.5 text-[#333F70]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd" />
            </svg>
            Trust & Quality Guaranteed
          </span>
          <h2 id="why-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#172B4D] tracking-tight mb-3">
            Why Book With Us?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Over 2 Million+ travelers trust us for authentic, hassle-free, and memorable experiences worldwide.
          </p>
        </div>

        {/* 10 Benefits Grid: 5 columns x 2 rows on desktop, 3 on tablet, 2 on mobile */}
        <div className="why-grid mb-10">

          {/* 1. Verified Activity Providers */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-indigo">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="why-card-title">Verified Activity Providers</h3>
            <p className="why-card-desc">Handpicked, safety-audited local experts & certified hosts.</p>
          </div>

          {/* 2. Best Price Guarantee */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-amber">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="why-card-title">Best Price Guarantee</h3>
            <p className="why-card-desc">Direct partner rates with zero hidden markups or surprise fees.</p>
          </div>

          {/* 3. Secure Online Payments */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-emerald">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="why-card-title">Secure Online Payments</h3>
            <p className="why-card-desc">256-bit bank encryption & global trusted payment gateways.</p>
          </div>

          {/* 4. Instant Booking Confirmation */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-blue">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="why-card-title">Instant Booking Confirmation</h3>
            <p className="why-card-desc">Mobile e-tickets and QR vouchers delivered instantly.</p>
          </div>

          {/* 5. Easy Cancellation Options */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-rose">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="why-card-title">Easy Cancellation Options</h3>
            <p className="why-card-desc">Hassle-free 100% refund up to 24 hours prior to activity.</p>
          </div>

          {/* 6. 24/7 Customer Support */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-cyan">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="why-card-title">24/7 Customer Support</h3>
            <p className="why-card-desc">Round-the-clock multilingual assistance via chat, phone & email.</p>
          </div>

          {/* 7. Trusted Reviews */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-gold">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <h3 className="why-card-title">Trusted Reviews</h3>
            <p className="why-card-desc">Genuine ratings & unedited photos from verified explorers.</p>
          </div>

          {/* 8. AI Powered Recommendations */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-purple">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="why-card-title">AI-Powered Recommendations</h3>
            <p className="why-card-desc">Smart itineraries customized to your travel style & budget.</p>
          </div>

          {/* 9. Transparent Pricing */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-sky">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="why-card-title">Transparent Pricing</h3>
            <p className="why-card-desc">All taxes, park entry & booking fees clearly shown upfront.</p>
          </div>

          {/* 10. Safe and Reliable Experiences */}
          <div className="why-book-card group">
            <div className="why-icon-box why-icon-orange">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="why-card-title">Safe and Reliable Experiences</h3>
            <p className="why-card-desc">Fully insured tours with licensed guides & certified equipment.</p>
          </div>

        </div>

        {/* Trust Stats Bar */}
        <div className="why-trust-bar">
          <div className="why-trust-item">
            <div className="why-trust-badge why-icon-emerald">
              ★
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">4.9 / 5.0 Star Rating</div>
              <div className="text-xs text-slate-500">Based on 150,000+ real reviews</div>
            </div>
          </div>
          <div className="why-trust-divider"></div>
          <div className="why-trust-item">
            <div className="why-trust-badge why-icon-blue">
              ✓
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">100% Verified Partners</div>
              <div className="text-xs text-slate-500">Licensed & certified operators only</div>
            </div>
          </div>
          <div className="why-trust-divider"></div>
          <div className="why-trust-item">
            <div className="why-trust-badge why-icon-purple">
              🛡️
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Secure Traveler Guarantee</div>
              <div className="text-xs text-slate-500">Protected booking & easy refunds</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
