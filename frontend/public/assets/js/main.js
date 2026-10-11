/**
 * AI-Powered Activity Booking Platform
 * Core Frontend Interactions & Route Handling
 */

// Centralized Route Configuration
const ROUTES = {
  home: 'index.html',
  activities: 'activities.html',
  destinations: 'destinations.html',
  experiences: 'experiences.html',
  aiTripPlanner: 'ai-trip-planner.html',
  offers: 'offers.html',
  loginSignUp: 'auth.html',
  becomeSupplier: 'supplier-registration.html',
  becomeTravelPartner: 'travel-partner.html',
  aboutUs: 'about-us.html',
  contactUs: 'contact-us.html',
  
  // Categories & Detail dynamic routes
  categoryDetail: (slug) => `category.html?type=${encodeURIComponent(slug)}`,
  destinationDetail: (slug) => `destination.html?name=${encodeURIComponent(slug)}`,
  activityDetail: (slug) => `activity-detail.html?item=${encodeURIComponent(slug)}`,

  // Company
  careers: 'careers.html',
  blog: 'blog.html',
  pressAndMedia: 'press.html',

  // Partners
  corporateBookings: 'corporate.html',
  affiliateProgram: 'affiliate.html',
  apiIntegration: 'api-docs.html',

  // Support
  helpCentre: 'help.html',
  manageBooking: 'my-account.html?tab=bookings',
  safetyAndTrust: 'trust-safety.html',
  contactSupport: 'support.html',

  // Legal Pages (Slide 16 requirements)
  termsAndConditions: 'legal/terms-and-conditions.html',
  privacyPolicy: 'legal/privacy-policy.html',
  cancellationAndRefund: 'legal/cancellation-refund.html',
  cookiePolicy: 'legal/cookie-policy.html',
  paymentPolicy: 'legal/payment-policy.html',
  supplierTerms: 'legal/supplier-terms.html',
  travelPartnerTerms: 'legal/partner-terms.html',
  userAgreement: 'legal/user-agreement.html',
  safetyDisclaimer: 'legal/safety-disclaimer.html',
  intellectualProperty: 'legal/intellectual-property.html',
  grievanceRedressal: 'legal/grievance-redressal.html',
  dataProtection: 'legal/data-protection.html',

  // Social Channels
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com',
  twitter: 'https://x.com',
  whatsapp: 'https://whatsapp.com'
};

// Toast Notification System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div>${message}</div>
      <button type="button" class="text-white/70 hover:text-white font-bold text-sm ml-2 focus:outline-none" aria-label="Dismiss notification">&times;</button>
    </div>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Global Link Interceptor for Configured Routes
function initRouteHandling() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (link) {
      e.preventDefault();
      const routeKey = link.getAttribute('data-route');
      const param = link.getAttribute('data-param');
      
      let targetUrl = '#';
      if (typeof ROUTES[routeKey] === 'function') {
        targetUrl = ROUTES[routeKey](param || '');
      } else if (ROUTES[routeKey]) {
        targetUrl = ROUTES[routeKey];
      }

      showToast(`<strong>Route:</strong> <code>${targetUrl}</code><br><span class="text-xs text-[#D6F5EE]">Destination page awaiting backend connection.</span>`);
    }
  });
}

// 1. Navigation & Partners Dropdown
function initNavigation() {
  const partnersDropdownBtn = document.getElementById('partners-menu-btn');
  const partnersDropdownMenu = document.getElementById('partners-menu');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
  const mobilePartnersBtn = document.getElementById('mobile-partners-btn');
  const mobilePartnersSubmenu = document.getElementById('mobile-partners-submenu');

  if (partnersDropdownBtn && partnersDropdownMenu) {
    let isOpen = false;
    const chevronIcon = partnersDropdownBtn.querySelector('.chevron-icon');

    function openDropdown() {
      isOpen = true;
      partnersDropdownBtn.setAttribute('aria-expanded', 'true');
      partnersDropdownMenu.classList.remove('hidden');
      partnersDropdownMenu.classList.add('block');
      if (chevronIcon) chevronIcon.classList.add('rotate-180');
      partnersDropdownBtn.classList.add('bg-white', 'text-[#333F70]');
      partnersDropdownBtn.classList.remove('text-white');
    }

    function closeDropdown() {
      isOpen = false;
      partnersDropdownBtn.setAttribute('aria-expanded', 'false');
      partnersDropdownMenu.classList.remove('block');
      partnersDropdownMenu.classList.add('hidden');
      if (chevronIcon) chevronIcon.classList.remove('rotate-180');
      partnersDropdownBtn.classList.remove('bg-white', 'text-[#333F70]');
      partnersDropdownBtn.classList.add('text-white');
    }

    // Toggle dropdown exclusively on click
    partnersDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isOpen) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    // Close when an option is clicked
    partnersDropdownMenu.addEventListener('click', () => {
      closeDropdown();
    });

    // Keyboard navigation
    partnersDropdownBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        }
        const firstLink = partnersDropdownMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeDropdown();
        partnersDropdownBtn.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen && !partnersDropdownBtn.contains(e.target) && !partnersDropdownMenu.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  // Mobile Menu
  if (mobileMenuBtn && mobileMenuDrawer && mobileMenuBackdrop) {
    function openMobileMenu() {
      mobileMenuDrawer.classList.remove('translate-x-full');
      mobileMenuBackdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
      mobileMenuDrawer.classList.add('translate-x-full');
      mobileMenuBackdrop.classList.add('hidden');
      document.body.style.overflow = '';
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    mobileMenuBtn.addEventListener('click', openMobileMenu);
    if (mobileMenuCloseBtn) mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);

    if (mobilePartnersBtn && mobilePartnersSubmenu) {
      mobilePartnersBtn.addEventListener('click', () => {
        mobilePartnersSubmenu.classList.toggle('hidden');
        const icon = mobilePartnersBtn.querySelector('.chevron-icon');
        if (icon) icon.classList.toggle('rotate-180');
      });
    }
  }
}

// 2. Hero Image Slider (Disabled when using single static hero image)
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length <= 1) return;

  const prevBtn = document.getElementById('hero-prev-btn');
  const nextBtn = document.getElementById('hero-next-btn');
  const dots = document.querySelectorAll('.hero-dot');

  let currentIndex = 0;
  let timer = null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    
    slides.forEach((slide, idx) => {
      if (idx === index) {
        slide.classList.remove('opacity-0', 'pointer-events-none');
        slide.classList.add('opacity-100');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('opacity-100');
        slide.classList.add('opacity-0', 'pointer-events-none');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    dots.forEach((dot, idx) => {
      if (idx === index) {
        dot.classList.add('bg-white', 'w-8');
        dot.classList.remove('bg-white/50', 'w-2.5');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('bg-white', 'w-8');
        dot.classList.add('bg-white/50', 'w-2.5');
        dot.removeAttribute('aria-current');
      }
    });

    currentIndex = index;
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  if (prevBtn) prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      resetAutoPlay();
    });
  });

  function startAutoPlay() {
    if (!prefersReducedMotion) {
      timer = setInterval(nextSlide, 5000);
    }
  }

  function stopAutoPlay() {
    if (timer) clearInterval(timer);
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoPlay);
    heroSection.addEventListener('mouseleave', startAutoPlay);
  }

  startAutoPlay();
}

// 3. Search Bar Form & Guest Counter
function initSearchBar() {
  const guestMinusBtn = document.getElementById('guest-minus');
  const guestPlusBtn = document.getElementById('guest-plus');
  const guestCountEl = document.getElementById('guest-count');
  const guestInput = document.getElementById('search-guests');
  const dateInput = document.getElementById('search-date');
  const searchForm = document.getElementById('hero-search-form');

  let guests = 1;

  if (guestMinusBtn && guestPlusBtn && guestCountEl) {
    guestMinusBtn.addEventListener('click', () => {
      if (guests > 1) {
        guests--;
        guestCountEl.textContent = guests;
        if (guestInput) guestInput.value = guests;
      }
    });

    guestPlusBtn.addEventListener('click', () => {
      guests++;
      guestCountEl.textContent = guests;
      if (guestInput) guestInput.value = guests;
    });
  }

  // Prevent past dates
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dest = document.getElementById('search-destination')?.value.trim();
      const act = document.getElementById('search-activity')?.value;
      const date = dateInput?.value;

      const params = new URLSearchParams();
      if (dest) params.append('destination', dest);
      if (act) params.append('activity', act);
      if (date) params.append('date', date);
      params.append('guests', guests);

      const targetUrl = `activities.html?${params.toString()}`;
      showToast(`<strong>Search Query Generated:</strong><br><code>${targetUrl}</code><br><span class="text-xs text-[#D6F5EE]">Centralized route configured. Listing page awaiting implementation.</span>`);
    });
  }
}

// 3.5 Categories Dual-Row Horizontal Sliders (Hardware-accelerated continuous CSS marquee)
function initCategoriesCarousel() {
  // Smooth dual-direction infinite marquee is driven continuously by hardware-accelerated CSS animations:
  // Row 1: Right-to-Left (←) via marqueeScrollLeft
  // Row 2: Left-to-Right (→) via marqueeScrollRight
  // This eliminates any scrollLeft clamping, lockups, or frame stutters.
}

// 4. Destinations Horizontal Scrolling Carousel
function initDestinationsCarousel() {
  const container = document.getElementById('destinations-carousel');
  const prevBtn = document.getElementById('dest-prev-btn');
  const nextBtn = document.getElementById('dest-next-btn');

  if (!container) return;

  const scrollAmount = 300;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // Keyboard navigation
  container.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  });
}

// 5. AI Travel Assistant Preview
function initAIAssistant() {
  const aiForm = document.getElementById('ai-assistant-preview-form');
  const botBubble = document.getElementById('ai-bot-bubble');

  if (aiForm) {
    aiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const dest = document.getElementById('ai-dest-input')?.value || 'Jaipur';
      const budget = document.getElementById('ai-budget-input')?.value || 'Standard';
      const interests = document.getElementById('ai-interests-input')?.value || 'Adventure';

      const url = `ai-trip-planner.html?dest=${encodeURIComponent(dest)}&budget=${encodeURIComponent(budget)}&interests=${encodeURIComponent(interests)}`;
      showToast(`<strong>AI Trip Planner Request:</strong><br><code>${url}</code><br><span class="text-xs text-[#D6F5EE]">Homepage preview mode. Full wizard awaiting backend AI service.</span>`);
    });
  }
}

// 6. Customer Reviews Carousel
function initReviewsCarousel() {
  const container = document.getElementById('reviews-carousel');
  const prevBtn = document.getElementById('reviews-prev-btn');
  const nextBtn = document.getElementById('reviews-next-btn');
  const dots = document.querySelectorAll('.review-dot');

  if (!container) return;

  function updateActiveDot() {
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 0) return;
    const progress = scrollLeft / maxScroll;
    const activeIdx = Math.round(progress * (dots.length - 1));
    dots.forEach((dot, idx) => {
      if (idx === activeIdx) {
        dot.classList.add('bg-[#333F70]', 'w-6');
        dot.classList.remove('bg-slate-300', 'w-2.5');
      } else {
        dot.classList.remove('bg-[#333F70]', 'w-6');
        dot.classList.add('bg-slate-300', 'w-2.5');
      }
    });
  }

  container.addEventListener('scroll', updateActiveDot, { passive: true });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const cardWidth = container.querySelector('.review-card')?.offsetWidth || 340;
      container.scrollBy({ left: -cardWidth - 24, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const cardWidth = container.querySelector('.review-card')?.offsetWidth || 340;
      container.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      const totalWidth = container.scrollWidth - container.clientWidth;
      const targetScroll = (idx / (dots.length - 1)) * totalWidth;
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    });
  });
}

// 7. Newsletter Subscription Form
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const emailInput = document.getElementById('newsletter-email');
  const feedbackEl = document.getElementById('newsletter-feedback');

  if (form && emailInput) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      // RFC 5322 standard email validation regex
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

      if (!email || !emailRegex.test(email)) {
        if (feedbackEl) {
          feedbackEl.textContent = 'Please enter a valid email address.';
          feedbackEl.className = 'text-xs text-red-600 mt-1 block';
        }
        emailInput.focus();
        return;
      }

      if (feedbackEl) {
        feedbackEl.textContent = '';
      }

      // Exact PPT requirement: "Do not show 'Successfully subscribed' unless a real subscription endpoint confirms success. Keep the endpoint configurable; without it, identify submission as a demo rather than pretending to save an email."
      showToast(`<strong>Newsletter Demo Submission:</strong><br>Email entered: <code>${email}</code><br><span class="text-xs text-[#D6F5EE]">Subscription endpoint awaiting connection in API configuration.</span>`);
      emailInput.value = '';
    });
  }
}

// 8. Hero Background Video Autoplay Guarantee (iOS Safari & Android Mobile Support)
function initHeroVideo() {
  const video = document.getElementById('hero-bg-video') || document.querySelector('#hero-section video');
  if (!video) return;

  // Enforce mandatory DOM properties for mobile engines (iOS WebKit & Chrome Android)
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', 'true');
  video.setAttribute('x5-playsinline', 'true');

  function tryPlay() {
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Will activate on first touch/interaction if blocked by low power mode
      });
    }
  }

  // Attempt play immediately
  tryPlay();

  // Retry on media events
  video.addEventListener('loadedmetadata', tryPlay, { once: true });
  video.addEventListener('loadeddata', tryPlay, { once: true });
  video.addEventListener('canplay', tryPlay, { once: true });

  // Real mobile fallback: trigger play on very first touch/scroll gesture anywhere
  const gesturePlayTrigger = () => {
    video.muted = true;
    const p = video.play();
    if (p !== undefined) {
      p.then(() => {
        removeGestureListeners();
      }).catch(() => {});
    }
  };

  function removeGestureListeners() {
    window.removeEventListener('touchstart', gesturePlayTrigger);
    window.removeEventListener('touchend', gesturePlayTrigger);
    window.removeEventListener('touchmove', gesturePlayTrigger);
    window.removeEventListener('scroll', gesturePlayTrigger);
    document.removeEventListener('click', gesturePlayTrigger);
  }

  window.addEventListener('touchstart', gesturePlayTrigger, { passive: true });
  window.addEventListener('touchend', gesturePlayTrigger, { passive: true });
  window.addEventListener('touchmove', gesturePlayTrigger, { passive: true });
  window.addEventListener('scroll', gesturePlayTrigger, { passive: true });
  document.addEventListener('click', gesturePlayTrigger, { passive: true });

  // Tab switch or app resume handling
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && video.paused) {
      tryPlay();
    }
  });
}

// DOM Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initHeroVideo();
  initRouteHandling();
  initNavigation();
  initHeroSlider();
  initSearchBar();
  initCategoriesCarousel();
  initDestinationsCarousel();
  initAIAssistant();
  initReviewsCarousel();
  initNewsletter();
});

// Also trigger immediately if script loaded after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initHeroVideo();
}
