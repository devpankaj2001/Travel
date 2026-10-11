'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HandpickedCollections({ onSelectCollection }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const collections = [
    {
      id: 1,
      title: 'Best Experiences for Couples',
      tag: '💖 Romantic Escapes',
      rating: '4.9',
      count: '14+ Romantic Spots',
      price: '₹1,499',
      image: '/assets/images/col_couples.jpg',
      alt: 'Romantic couple watching sunset',
      category: 'romantic',
      link: '/listing?category=luxury-vip'
    },
    {
      id: 2,
      title: 'Family-Friendly Activities',
      tag: '👨‍👩‍👧 All-Ages Fun',
      rating: '4.8',
      count: '22+ Family Tours',
      price: '₹799',
      image: '/assets/images/col_family.jpg',
      alt: 'Family playing together on beach',
      category: 'family',
      link: '/listing?category=adventure'
    },
    {
      id: 3,
      title: 'Top Adventure Activities',
      tag: '⚡ High Adrenaline',
      rating: '4.9',
      count: '18+ Thrill Sports',
      price: '₹999',
      image: '/assets/images/col_adventure.jpg',
      alt: 'Hiker standing on mountain ridge',
      category: 'adventure',
      link: '/listing?category=adventure'
    },
    {
      id: 4,
      title: 'Luxury Travel Experiences',
      tag: '✨ VIP & Luxury',
      rating: '5.0',
      count: '10+ Bespoke Stays',
      price: '₹4,999',
      image: '/assets/images/col_luxury.jpg',
      alt: 'Overwater bungalow luxury resort',
      category: 'luxury',
      link: '/listing?category=luxury-vip'
    },
    {
      id: 5,
      title: 'Experiences Under ₹1,000',
      tag: '🏷️ Pocket Friendly',
      rating: '4.7',
      count: '30+ Budget Activities',
      price: '₹499',
      image: '/assets/images/col_budget.jpg',
      alt: 'Backpacker taking in mountain view',
      category: 'budget',
      link: '/listing?maxPrice=1000'
    },
    {
      id: 6,
      title: 'Weekend Getaway Activities',
      tag: '🎒 2-3 Day Escapes',
      rating: '4.8',
      count: '16+ Quick Breaks',
      price: '₹1,299',
      image: '/assets/images/col_weekend.jpg',
      alt: 'Friends enjoying sunset on ridge',
      category: 'adventure',
      link: '/listing?duration=full_day'
    },
    {
      id: 7,
      title: 'Activities for Large Groups',
      tag: '👥 Group Specials',
      rating: '4.8',
      count: '12+ Team Outings',
      price: '₹899',
      image: '/assets/images/col_group.jpg',
      alt: 'Happy group smiling on trail',
      category: 'family',
      link: '/listing?category=adventure'
    },
    {
      id: 8,
      title: 'Corporate Outings & Retreats',
      tag: '💼 Offsites & Teams',
      rating: '4.9',
      count: '8+ Team Retreats',
      price: '₹2,499',
      image: '/assets/images/col_corporate.jpg',
      alt: 'Coworkers participating in ropes course',
      category: 'groups',
      link: '/listing?category=sightseeing'
    },
    {
      id: 9,
      title: 'School & College Excursions',
      tag: '🎓 Educational & Fun',
      rating: '4.7',
      count: '15+ Guided Tours',
      price: '₹399',
      image: '/assets/images/col_school.jpg',
      alt: 'Students walking in ancient heritage site',
      category: 'budget',
      link: '/listing?maxPrice=2000'
    },
    {
      id: 10,
      title: 'Most-Booked Experiences of 2026',
      tag: '🔥 All-Time Favorites',
      rating: '5.0',
      count: '25+ Iconic Hits',
      price: '₹1,799',
      image: '/assets/images/col_most_booked.jpg',
      alt: 'Travellers taking photo at landmark',
      category: 'adventure',
      link: '/listing'
    }
  ];

  const filterTabs = [
    { label: 'All', id: 'all' },
    { label: 'Adventure', id: 'adventure' },
    { label: 'Family', id: 'family' },
    { label: 'Romantic', id: 'romantic' },
    { label: 'Budget', id: 'budget' },
    { label: 'Luxury', id: 'luxury' }
  ];

  const visibleCollections = activeFilter === 'all'
    ? collections
    : collections.filter(c => c.category === activeFilter);

  return (
    <section className="py-12 md:py-16 bg-[#FAFAF8]" aria-labelledby="collections-heading">
      <div className="site-container">
        {/* Section Header: Left Heading + Right View All Button */}
        <div className="collection-header-row">
          <div>
            <div className="collection-tag-line-wrap">
              <span className="collection-coral-dash"></span>
              <span className="collection-tag-badge">Curated For You</span>
            </div>
            <h2 id="collections-heading" className="collection-main-title">
              Handpicked Experiences for You
            </h2>
            <p className="collection-sub-title">
              Themed collections tailored to every mood, budget, and travel companion.
            </p>
          </div>
          <Link href="/listing" className="collection-view-all-btn">
            <span>View All Collections</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="collection-filter-pills flex flex-wrap gap-2 mb-8">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#333F70] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 10 Photographic Collection Cards */}
        <div className="collection-grid">
          {visibleCollections.map((col) => (
            <Link
              key={col.id}
              href={col.link}
              onClick={() => onSelectCollection && onSelectCollection(col)}
              className="collection-card group"
            >
              <div className="collection-card-img-wrap">
                <img src={col.image} alt={col.alt} className="collection-img" loading="lazy" />
                <div className="collection-img-gradient"></div>
                <div className="collection-top-row">
                  <span className="collection-tag">{col.tag}</span>
                  <span className="collection-rating-badge">★ {col.rating}</span>
                </div>
              </div>
              <div className="collection-card-body">
                <div className="collection-activity-count">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{col.count}</span>
                </div>
                <h3 className="collection-title">{col.title}</h3>
                <div className="collection-meta">
                  <div className="collection-price-pill">
                    <span className="collection-price-label">From</span>
                    <span className="collection-price-val">{col.price}</span>
                  </div>
                  <span className="collection-explore-btn">
                    <span>Explore</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
