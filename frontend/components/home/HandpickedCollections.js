'use client';
export default function HandpickedCollections({ onSelectCollection }) {
  return (
    <section className="collection-section" aria-labelledby="collections-heading">
      <div className="site-container">

        {/* Section Header with View All */}
        <div className="collection-header-row">
          <div>
            <span className="collection-badge">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Curated For You
            </span>
            <h2 id="collections-heading" className="collection-main-title">
              Handpicked Experiences for You
            </h2>
            <p className="collection-sub-title">
              Themed collections tailored to every mood, budget, and travel companion.
            </p>
          </div>
          <a href="#!" className="collection-view-all-btn">
            <span>View All Collections</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* 10 Photographic Collection Cards (5 columns desktop, 3 tablet, 2 mobile) */}
        <div className="collection-grid">

          {/* 1. Best Experiences for Couples */}
          <a href="#!" data-route="categoryDetail" data-param="couples" data-category="couples romantic"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_couples.jpg" alt="Romantic couple watching sunset" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">💖 Romantic Escapes</span>
                <span className="collection-rating-badge">★ 4.9</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>14+ Romantic Spots</span>
              </div>
              <h3 className="collection-title">Best Experiences for Couples</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹1,499</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 2. Family-Friendly Activities */}
          <a href="#!" data-route="categoryDetail" data-param="family-friendly" data-category="family"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_family.jpg" alt="Family playing together on beach" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">👨‍👩‍👧 All-Ages Fun</span>
                <span className="collection-rating-badge">★ 4.8</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>22+ Family Tours</span>
              </div>
              <h3 className="collection-title">Family-Friendly Activities</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹799</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 3. Top Adventure Activities */}
          <a href="#!" data-route="categoryDetail" data-param="top-adventure" data-category="adventure"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_adventure.jpg" alt="Hiker standing on mountain ridge" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">⚡ High Adrenaline</span>
                <span className="collection-rating-badge">★ 4.9</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>18+ Thrill Sports</span>
              </div>
              <h3 className="collection-title">Top Adventure Activities</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹999</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 4. Luxury Travel Experiences */}
          <a href="#!" data-route="categoryDetail" data-param="luxury-travel" data-category="luxury"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_luxury.jpg" alt="Overwater bungalow luxury resort" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">✨ VIP & Luxury</span>
                <span className="collection-rating-badge">★ 5.0</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>10+ Bespoke Stays</span>
              </div>
              <h3 className="collection-title">Luxury Travel Experiences</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹4,999</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 5. Experiences Under ₹1,000 */}
          <a href="#!" data-route="categoryDetail" data-param="under-1000" data-category="budget"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_budget.jpg" alt="Backpacker taking in mountain view" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">🏷️ Pocket Friendly</span>
                <span className="collection-rating-badge">★ 4.7</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>30+ Budget Deals</span>
              </div>
              <h3 className="collection-title">Experiences Under ₹1,000</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹399</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 6. Weekend Getaways */}
          <a href="#!" data-route="categoryDetail" data-param="weekend-getaways" data-category="romantic adventure"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_weekend.jpg" alt="Lush green hill station getaway" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">🚗 Short Breaks</span>
                <span className="collection-rating-badge">★ 4.8</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>16+ Road Trips</span>
              </div>
              <h3 className="collection-title">Weekend Getaways</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹1,299</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 7. Group Activities */}
          <a href="#!" data-route="categoryDetail" data-param="group-activities" data-category="groups family"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_group.jpg" alt="Friends hiking together in scenic outdoors"
                className="collection-img" loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">🎉 Friends & Teams</span>
                <span className="collection-rating-badge">★ 4.9</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>15+ Group Events</span>
              </div>
              <h3 className="collection-title">Group Activities</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹899</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 8. Corporate Experiences */}
          <a href="#!" data-route="categoryDetail" data-param="corporate-experiences" data-category="groups"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_corporate.jpg" alt="Corporate team retreat outdoors" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">💼 Team Offsites</span>
                <span className="collection-rating-badge">★ 4.9</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>12+ Corporate Retreats</span>
              </div>
              <h3 className="collection-title">Corporate Experiences</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹2,499</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 9. School and College Tours */}
          <a href="#!" data-route="categoryDetail" data-param="school-college-tours" data-category="groups budget"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_school.jpg" alt="Students exploring natural landmarks" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">🎓 Student Trips</span>
                <span className="collection-rating-badge">★ 4.8</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>20+ Educational Treks</span>
              </div>
              <h3 className="collection-title">School & College Tours</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹599</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* 10. Most Booked Experiences */}
          <a href="#!" data-route="categoryDetail" data-param="most-booked" data-category="adventure luxury"
            className="collection-card group">
            <div className="collection-card-img-wrap">
              <img src="/assets/images/col_most_booked.jpg" alt="Hot air balloons floating in sky" className="collection-img"
                loading="lazy" />
              <div className="collection-img-gradient"></div>
              <div className="collection-top-row">
                <span className="collection-tag">🔥 Trending Choice</span>
                <span className="collection-rating-badge">★ 5.0</span>
              </div>
            </div>
            <div className="collection-card-body">
              <div className="collection-activity-count">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>25+ Top Rated Sellers</span>
              </div>
              <h3 className="collection-title">Most Booked Experiences</h3>
              <div className="collection-meta">
                <div className="collection-price-pill">
                  <span className="collection-price-label">From</span>
                  <span className="collection-price-val">₹699</span>
                </div>
                <span className="collection-explore-btn">
                  <span>Explore</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </a>

        </div>

      </div>
    </section>
  );
}
