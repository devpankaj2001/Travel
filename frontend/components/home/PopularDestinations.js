'use client';
export default function PopularDestinations({ onSelectDestination }) {
  return (
    <section className="py-8 md:py-12" aria-labelledby="dest-heading">
      <div className="site-container">
        {/* Section Header: Left Heading + Right View All Button */}
        <div className="flex flex-col items-start sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h2 id="dest-heading"
              className="text-2xl md:text-3xl font-extrabold text-[#333F70] text-left uppercase tracking-wide">
              Explore Popular Destinations
            </h2>
            <p className="mt-1 text-sm text-slate-500 font-medium text-left">
              Discover top-rated destinations for your next journey
            </p>
          </div>

          <a href="#!" data-route="destinations"
            className="inline-flex items-center gap-2 self-start sm:self-auto px-5 py-2.5 text-sm font-bold text-[#333F70] bg-[#D6F5EE]/40 hover:bg-[#333F70] hover:text-white border border-[#333F70]/20 rounded-xl transition-all duration-200 group/btn shrink-0">
            <span>View All</span>
            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M14 5l7 7m0 0l-7 7m7-7H3"  />
            </svg>
          </a>
        </div>

        {/* 8 Fixed Destination Cards Grid (Bigger boxes, 4 cols on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">

          {/* 1. Dubai */}
          <a href="#!" data-route="destinationDetail" data-param="dubai"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_dubai.jpg" alt="Dubai Burj Khalifa skyline"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Dubai</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

          {/* 2. Goa */}
          <a href="#!" data-route="destinationDetail" data-param="goa"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_goa.jpg" alt="Goa tropical palm beach"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Goa</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

          {/* 3. Jaipur */}
          <a href="#!" data-route="destinationDetail" data-param="jaipur"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_jaipur.jpg" alt="Jaipur Hawa Mahal palace"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Jaipur</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

          {/* 4. Udaipur */}
          <a href="#!" data-route="destinationDetail" data-param="udaipur"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_udaipur.jpg" alt="Udaipur City Palace and lake"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Udaipur</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

          {/* 5. Manali */}
          <a href="#!" data-route="destinationDetail" data-param="manali"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_manali.jpg" alt="Manali snowy mountain valleys"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Manali</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

          {/* 6. Jaisalmer */}
          <a href="#!" data-route="destinationDetail" data-param="jaisalmer"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_jaisalmer.jpg" alt="Jaisalmer golden sand fort"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Jaisalmer</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

          {/* 7. Rishikesh */}
          <a href="#!" data-route="destinationDetail" data-param="rishikesh"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_rishikesh.jpg" alt="Rishikesh holy river and Himalayan temples"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Rishikesh</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

          {/* 8. Thailand */}
          <a href="#!" data-route="destinationDetail" data-param="thailand"
            className="group relative h-60 sm:h-64 lg:h-72 rounded-2xl overflow-hidden shadow-md card-hover-effect block">
            <img src="/assets/images/dest_thailand.jpg" alt="Thailand emerald sea and longtail boats"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 text-white">
              <h3 className="font-extrabold text-xl sm:text-2xl drop-shadow leading-tight">Thailand</h3>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mt-1">
                <span>Explore Tours</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </p>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
}
