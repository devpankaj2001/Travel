'use client';
export default function CategoryMarquee({ onSelectCategory }) {
  return (
    <section className="category-slider-section" aria-labelledby="category-heading">
      <div className="site-container">

        {/* Section Header: Left Heading + Right View All Button */}
        <div className="flex flex-col items-start sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 id="category-heading"
              className="text-2xl md:text-3xl font-extrabold text-[#333F70] text-left uppercase tracking-wide">
              Explore Experiences by Category
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-medium text-left">
              Discover handpicked activities tailored to your passions and travel style
            </p>
          </div>

          <a href="#!" data-route="categories"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 text-sm font-bold text-[#333F70] bg-[#D6F5EE]/40 hover:bg-[#333F70] hover:text-white border border-[#333F70]/20 rounded-xl transition-all duration-200 group/btn shrink-0">
            <span>View All</span>
            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3"  />
            </svg>
          </a>
        </div>

        {/* Slider Container with Left/Right Blur & Fade Overlays */}
        <div className="relative w-full overflow-hidden flex flex-col gap-3 sm:gap-3.5">
          {/* Left Blur & Fade Edge Overlay (covers both rows) */}
          <div className="category-slider-fade-left" aria-hidden="true"></div>

          {/* Row 1: Right-to-Left (←) (6 Categories) */}
          <div className="category-marquee-row category-marquee-left" id="categories-carousel-1"
            aria-label="Experience Categories Row 1">
            {/* Track A */}
            <div className="category-marquee-track">
              {/* 1. Adventure Activities */}
              <a href="#!" data-route="categoryDetail" data-param="adventure-activities"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_adventure.jpg" alt="Adventure Activities"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Adventure Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 2. Desert Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="desert-experiences" className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_desert.jpg" alt="Desert Experiences"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Desert Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 3. Wildlife & Nature */}
              <a href="#!" data-route="categoryDetail" data-param="wildlife-nature" className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_wildlife.jpg" alt="Wildlife & Nature"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Wildlife & Nature</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 4. Water Sports */}
              <a href="#!" data-route="categoryDetail" data-param="water-sports" className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_water_sports.jpg" alt="Water Sports"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Water Sports</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 5. Air Adventures */}
              <a href="#!" data-route="categoryDetail" data-param="air-adventures" className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_air.jpg" alt="Air Adventures"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Air Adventures</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 6. Sightseeing Tours */}
              <a href="#!" data-route="categoryDetail" data-param="sightseeing-tours" className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_sightseeing.jpg" alt="Sightseeing Tours"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Sightseeing Tours</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>
            </div>

            {/* Track B (Seamless duplicate for infinite smooth loop) */}
            <div className="category-marquee-track" aria-hidden="true">
              {/* 1. Adventure Activities */}
              <a href="#!" data-route="categoryDetail" data-param="adventure-activities" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_adventure.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Adventure Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 2. Desert Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="desert-experiences" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_desert.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Desert Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 3. Wildlife & Nature */}
              <a href="#!" data-route="categoryDetail" data-param="wildlife-nature" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_wildlife.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Wildlife & Nature</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 4. Water Sports */}
              <a href="#!" data-route="categoryDetail" data-param="water-sports" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_water_sports.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Water Sports</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 5. Air Adventures */}
              <a href="#!" data-route="categoryDetail" data-param="air-adventures" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_air.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Air Adventures</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 6. Sightseeing Tours */}
              <a href="#!" data-route="categoryDetail" data-param="sightseeing-tours" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_sightseeing.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Sightseeing Tours</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>
            </div>
          </div>

          {/* Row 2: Left-to-Right (→) (5 Categories) */}
          <div className="category-marquee-row category-marquee-right" id="categories-carousel-2"
            aria-label="Experience Categories Row 2">
            {/* Track A */}
            <div className="category-marquee-track">
              {/* 7. Cultural Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="cultural-experiences"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_cultural.jpg" alt="Cultural Experiences"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Cultural Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 8. Food & Dining Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="food-dining-experiences"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_food.jpg" alt="Food & Dining Experiences"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Food & Dining Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 9. Romantic Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="romantic-experiences"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_romantic.jpg" alt="Romantic Experiences"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Romantic Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 10. Family Activities */}
              <a href="#!" data-route="categoryDetail" data-param="family-activities" className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_family.jpg" alt="Family Activities"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Family Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 11. Kids Activities */}
              <a href="#!" data-route="categoryDetail" data-param="kids-activities" className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_kids.jpg" alt="Kids Activities"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Kids Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>
            </div>

            {/* Track B (Seamless duplicate for infinite smooth loop) */}
            <div className="category-marquee-track" aria-hidden="true">
              {/* 7. Cultural Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="cultural-experiences" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_cultural.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Cultural Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 8. Food & Dining Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="food-dining-experiences" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_food.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Food & Dining Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 9. Romantic Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="romantic-experiences" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_romantic.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Romantic Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 10. Family Activities */}
              <a href="#!" data-route="categoryDetail" data-param="family-activities" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_family.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Family Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 11. Kids Activities */}
              <a href="#!" data-route="categoryDetail" data-param="kids-activities" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_kids.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Kids Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>
            </div>
          </div>

          {/* Row 3: Right-to-Left (←) (5 Categories) */}
          <div className="category-marquee-row category-marquee-left" id="categories-carousel-3"
            aria-label="Experience Categories Row 3">
            {/* Track A */}
            <div className="category-marquee-track">
              {/* 12. Wellness Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="wellness-experiences"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_wellness.jpg" alt="Wellness Experiences"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Wellness Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 13. Nightlife & Entertainment */}
              <a href="#!" data-route="categoryDetail" data-param="nightlife-entertainment"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_nightlife.jpg" alt="Nightlife & Entertainment"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Nightlife & Entertainment</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 14. Religious & Spiritual Tours */}
              <a href="#!" data-route="categoryDetail" data-param="religious-spiritual-tours"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_spiritual.jpg" alt="Religious & Spiritual Tours"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Religious & Spiritual Tours</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 15. Educational Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="educational-experiences"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_educational.jpg" alt="Educational Experiences"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Educational Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 16. Corporate Group Activities */}
              <a href="#!" data-route="categoryDetail" data-param="corporate-group-activities"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_corporate.jpg" alt="Corporate Group Activities"
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <span className="category-pill-text">Corporate Group Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>
            </div>

            {/* Track B (Seamless duplicate for infinite smooth loop) */}
            <div className="category-marquee-track" aria-hidden="true">
              {/* 12. Wellness Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="wellness-experiences" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_wellness.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Wellness Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 13. Nightlife & Entertainment */}
              <a href="#!" data-route="categoryDetail" data-param="nightlife-entertainment" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_nightlife.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Nightlife & Entertainment</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 14. Religious & Spiritual Tours */}
              <a href="#!" data-route="categoryDetail" data-param="religious-spiritual-tours" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_spiritual.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Religious & Spiritual Tours</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 15. Educational Experiences */}
              <a href="#!" data-route="categoryDetail" data-param="educational-experiences" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_educational.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Educational Experiences</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>

              {/* 16. Corporate Group Activities */}
              <a href="#!" data-route="categoryDetail" data-param="corporate-group-activities" tabIndex="-1"
                className="category-pill-item group">
                <div className="category-pill-icon">
                  <img src="/assets/images/categories/cat_corporate.jpg" alt="" className="w-full h-full object-cover"
                    loading="lazy" />
                </div>
                <span className="category-pill-text">Corporate Group Activities</span>
                <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6"  />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Blur & Fade Edge Overlay */}
          <div className="category-slider-fade-right" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}
