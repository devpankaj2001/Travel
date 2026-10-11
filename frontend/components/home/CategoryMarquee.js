'use client';
import Link from 'next/link';

export default function CategoryMarquee({ onSelectCategory }) {
  const row1Categories = [
    { label: 'Adventure Activities', slug: 'adventure', icon: '/assets/images/categories/cat_adventure.jpg' },
    { label: 'Desert Experiences', slug: 'desert-safari', icon: '/assets/images/categories/cat_desert.jpg' },
    { label: 'Wildlife & Nature', slug: 'wildlife', icon: '/assets/images/categories/cat_wildlife.jpg' },
    { label: 'Water Sports', slug: 'water-sports', icon: '/assets/images/categories/cat_water_sports.jpg' },
    { label: 'Air Adventures', slug: 'adventure', icon: '/assets/images/categories/cat_air.jpg' },
    { label: 'Sightseeing Tours', slug: 'sightseeing', icon: '/assets/images/categories/cat_sightseeing.jpg' }
  ];

  const row2Categories = [
    { label: 'Cultural Experiences', slug: 'cultural', icon: '/assets/images/categories/cat_cultural.jpg' },
    { label: 'Food & Dining', slug: 'food-dining', icon: '/assets/images/categories/cat_food.jpg' },
    { label: 'Romantic & Couples', slug: 'luxury-vip', icon: '/assets/images/categories/cat_romantic.jpg' },
    { label: 'Nightlife & Party', slug: 'sightseeing', icon: '/assets/images/categories/cat_nightlife.jpg' },
    { label: 'Wellness & Spa', slug: 'sightseeing', icon: '/assets/images/categories/cat_wellness.jpg' },
    { label: 'Family & Kids', slug: 'adventure', icon: '/assets/images/categories/cat_family.jpg' }
  ];

  return (
    <section className="category-slider-section" aria-labelledby="category-heading">
      <div className="site-container">
        {/* Section Header: Left Heading + Right View All Button */}
        <div className="flex flex-col items-start sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2
              id="category-heading"
              className="text-2xl md:text-3xl font-extrabold text-[#333F70] text-left uppercase tracking-wide"
            >
              Explore Experiences by Category
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-medium text-left">
              Discover handpicked activities tailored to your passions and travel style
            </p>
          </div>

          <Link
            href="/listing"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 text-sm font-bold text-[#333F70] bg-[#D6F5EE]/40 hover:bg-[#333F70] hover:text-white border border-[#333F70]/20 rounded-xl transition-all duration-200 group/btn shrink-0"
          >
            <span>View All</span>
            <svg
              className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Slider Container with Left/Right Blur & Fade Overlays */}
        <div className="relative w-full overflow-hidden flex flex-col gap-3 sm:gap-3.5">
          {/* Left Blur & Fade Edge Overlay */}
          <div className="category-slider-fade-left" aria-hidden="true"></div>

          {/* Row 1: Right-to-Left (←) (6 Categories x 2 for loop) */}
          <div
            className="category-marquee-row category-marquee-left"
            id="categories-carousel-1"
            aria-label="Experience Categories Row 1"
          >
            <div className="category-marquee-track">
              {row1Categories.map((cat, idx) => (
                <Link
                  key={`r1-a-${idx}`}
                  href={`/listing?category=${encodeURIComponent(cat.slug)}`}
                  onClick={() => onSelectCategory && onSelectCategory(cat)}
                  className="category-pill-item group"
                >
                  <div className="category-pill-icon">
                    <img
                      src={cat.icon}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="category-pill-text">{cat.label}</span>
                  <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="category-marquee-track" aria-hidden="true">
              {row1Categories.map((cat, idx) => (
                <Link
                  key={`r1-b-${idx}`}
                  href={`/listing?category=${encodeURIComponent(cat.slug)}`}
                  tabIndex="-1"
                  className="category-pill-item group"
                >
                  <div className="category-pill-icon">
                    <img src={cat.icon} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <span className="category-pill-text">{cat.label}</span>
                  <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Row 2: Left-to-Right (→) (6 Categories x 2 for loop) */}
          <div
            className="category-marquee-row category-marquee-right"
            id="categories-carousel-2"
            aria-label="Experience Categories Row 2"
          >
            <div className="category-marquee-track">
              {row2Categories.map((cat, idx) => (
                <Link
                  key={`r2-a-${idx}`}
                  href={`/listing?category=${encodeURIComponent(cat.slug)}`}
                  onClick={() => onSelectCategory && onSelectCategory(cat)}
                  className="category-pill-item group"
                >
                  <div className="category-pill-icon">
                    <img
                      src={cat.icon}
                      alt={cat.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="category-pill-text">{cat.label}</span>
                  <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>

            <div className="category-marquee-track" aria-hidden="true">
              {row2Categories.map((cat, idx) => (
                <Link
                  key={`r2-b-${idx}`}
                  href={`/listing?category=${encodeURIComponent(cat.slug)}`}
                  tabIndex="-1"
                  className="category-pill-item group"
                >
                  <div className="category-pill-icon">
                    <img src={cat.icon} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <span className="category-pill-text">{cat.label}</span>
                  <svg className="category-pill-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Blur & Fade Edge Overlay */}
          <div className="category-slider-fade-right" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}
