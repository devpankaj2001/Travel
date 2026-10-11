'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Search, Calendar, Star, Clock, ShieldCheck,
  Sparkles, SlidersHorizontal, Check, ChevronDown, ChevronRight,
  Heart, Compass, X, CheckCircle2, ArrowRight
} from 'lucide-react';

import '../listing.css';
import { activitiesService } from '../../services/activities.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/Toast';
import AuthModal from '../../components/AuthModal';

// High-quality fallback activities for instant reliability
const FALLBACK_ACTIVITIES = [
  {
    id: 1,
    title: 'Eiffel Tower Summit Access & 1-Hour Seine River Cruise',
    slug: 'eiffel-tower-summit-access-seine-cruise',
    category: 'sightseeing',
    city: 'Paris',
    country: 'France',
    location: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
    duration_minutes: 180,
    duration_text: '3h',
    price: 3899,
    original_price: 5200,
    discount_percent: 25,
    rating: 4.8,
    reviews_count: 1420,
    primary_image: '/assets/images/categories/cat_sightseeing.jpg',
    company_name: 'Paris Heritage Explorers',
    badges: ['Bestseller', 'Instant Confirmation', 'Free Cancellation'],
    highlights: [
      'Summit elevator access to top floor of Eiffel Tower',
      '1-Hour scenic cruise along River Seine with audio guide',
      'Skip the ticket purchase line with mobile voucher'
    ],
    description: 'Skip the standard ticketing lines and ascend to the top floor summit of Paris iconic Eiffel Tower. Followed by a scenic 1-hour cruise gliding through the historic River Seine passing the Notre Dame, Louvre Museum, and Pont Alexandre III.'
  },
  {
    id: 2,
    title: 'Louvre Museum Guided Masterpieces Tour with Reserved Entry',
    slug: 'louvre-museum-guided-tour-reserved-entry',
    category: 'cultural',
    city: 'Paris',
    country: 'France',
    location: 'Rue de Rivoli, 75001 Paris',
    duration_minutes: 150,
    duration_text: '2h 30m',
    price: 4499,
    original_price: 5800,
    discount_percent: 22,
    rating: 4.9,
    reviews_count: 980,
    primary_image: '/assets/images/categories/cat_cultural.jpg',
    company_name: 'Louvre Art Guild',
    badges: ['Top Rated', 'Instant Confirmation', 'Skip The Line'],
    highlights: [
      'Reserved time-slot entrance to avoid hours of waiting',
      'Expert certified art historian live guide in English',
      'See the Mona Lisa, Venus de Milo, and Winged Victory'
    ],
    description: 'Bypass the immense entrance lines with priority tickets and explore the Mona Lisa, Venus de Milo, and Winged Victory with an expert art historian guide.'
  },
  {
    id: 3,
    title: 'Disneyland® Paris 1-Day 1-Park or 2-Parks Flexible Ticket',
    slug: 'disneyland-paris-1-day-ticket',
    category: 'adventure',
    city: 'Paris',
    country: 'France',
    location: 'Bd de Parc, 77700 Coupvray, France',
    duration_minutes: 480,
    duration_text: '8h (Full Day)',
    price: 6999,
    original_price: 8500,
    discount_percent: 18,
    rating: 4.7,
    reviews_count: 2310,
    primary_image: '/assets/images/categories/cat_adventure.jpg',
    company_name: 'Disneyland Official Partner',
    badges: ['Bestseller', 'Mobile Voucher', 'Instant Confirmation'],
    highlights: [
      'Unlimited rides across Disneyland Park or Walt Disney Studios',
      'Watch Disney Stars on Parade and Illuminations fireworks',
      'Mobile bar-coded instant ticket entry at turnstiles'
    ],
    description: 'Experience magical fairy tales and adrenaline-pumping rollercoasters at Disneyland® Park and Walt Disney Studios® Park.'
  },
  {
    id: 4,
    title: 'Dubai Red Dunes Desert Safari with BBQ Dinner & Quad Bike',
    slug: 'dubai-red-dunes-desert-safari-bbq-quad',
    category: 'desert-safari',
    city: 'Dubai',
    country: 'United Arab Emirates',
    location: 'Lahbab Desert, Dubai',
    duration_minutes: 360,
    duration_text: '6h',
    price: 2499,
    original_price: 3800,
    discount_percent: 34,
    rating: 4.9,
    reviews_count: 3120,
    primary_image: '/assets/images/exp_camel_safari.jpg',
    company_name: 'Arabian Adventures Co',
    badges: ['Bestseller', 'Free Cancellation', 'Buffet Dinner'],
    highlights: [
      'High-adrenaline 4x4 dune bashing across red desert dunes',
      '30-Min Quad Biking & Sandboarding included',
      'Belly dance, fire show, Tanoura & 5-star BBQ dinner'
    ],
    description: 'High-octane dune bashing in luxury 4x4 Land Cruisers, sandboarding, camel rides, 30-minute quad biking, live belly dancing, Tanoura show, and a 5-star international buffet dinner.'
  },
  {
    id: 5,
    title: 'Burj Khalifa At the Top (Level 124 & 125) Observation Deck',
    slug: 'burj-khalifa-at-the-top-level-124-125',
    category: 'sightseeing',
    city: 'Dubai',
    country: 'United Arab Emirates',
    location: '1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    duration_minutes: 90,
    duration_text: '1h 30m',
    price: 3650,
    original_price: 4200,
    discount_percent: 13,
    rating: 4.8,
    reviews_count: 2450,
    primary_image: '/assets/images/dest_dubai.jpg',
    company_name: 'Emaar Tourism',
    badges: ['Iconic Landmark', 'Instant Confirmation'],
    highlights: [
      'World fastest double-deck elevators travel at 10m/sec',
      'Outdoor observation terrace overlooking Dubai Fountain',
      'High-powered telescopes for panoramic skyline views'
    ],
    description: 'Ride the world fastest double-deck elevators to levels 124 and 125 for breathtaking 360-degree panoramic vistas of the Arabian Gulf and Dubai glittering skyline.'
  },
  {
    id: 6,
    title: 'Goa Grand Island Scuba Diving & 5 Water Sports Combo',
    slug: 'goa-grand-island-scuba-diving-water-sports-combo',
    category: 'water-sports',
    city: 'Goa',
    country: 'India',
    location: 'Grand Island / Calangute Beach, North Goa',
    duration_minutes: 360,
    duration_text: '6h',
    price: 1999,
    original_price: 3500,
    discount_percent: 43,
    rating: 4.7,
    reviews_count: 1890,
    primary_image: '/assets/images/exp_parasailing.jpg',
    company_name: 'Goa Ocean Thrills',
    badges: ['Super Saver', 'Free Cancellation', 'Video Included'],
    highlights: [
      'PADI certified instructor guided underwater scuba dive',
      'Parasailing, Jet Ski, Banana, Bumper & Speed Boat ride',
      'Complimentary underwater HD video & photos'
    ],
    description: 'Dive into crystal-clear waters with PADI certified dive instructors, followed by Parasailing, Jet Ski ride, Banana ride, Bumper ride, and Speedboat thrill ride.'
  },
  {
    id: 7,
    title: 'Royal Jaipur Heritage Hot Air Balloon Flight at Sunrise',
    slug: 'royal-jaipur-heritage-hot-air-balloon-flight',
    category: 'adventure',
    city: 'Jaipur',
    country: 'India',
    location: 'Amber Fort Area, Jaipur',
    duration_minutes: 180,
    duration_text: '3h',
    price: 8500,
    original_price: 12000,
    discount_percent: 29,
    rating: 4.9,
    reviews_count: 420,
    primary_image: '/assets/images/categories/cat_air.jpg',
    company_name: 'SkyWaltz Balloon Safaris',
    badges: ['Luxury VIP', 'Certified Pilots', 'Breakfast Included'],
    highlights: [
      'Soar gently above Amber Palace, Jal Mahal & Aravalli hills',
      'Commercial pilot certified by Civil Aviation Authority',
      'First flight certificate & continental breakfast'
    ],
    description: 'Float serenely over Rajput palaces, centuries-old forts, and the Aravalli hills during golden sunrise with certified commercial balloon pilots and champagne toast.'
  },
  {
    id: 11,
    title: 'Amber Fort & Palace Skip-The-Line Guided Heritage Tour',
    slug: 'amber-fort-skip-the-line-guided-tour',
    category: 'cultural',
    city: 'Jaipur',
    country: 'India',
    location: 'Devisinghpura, Amer, Jaipur, Rajasthan',
    duration_minutes: 120,
    duration_text: '2h',
    price: 499,
    original_price: 799,
    discount_percent: 38,
    rating: 4.8,
    reviews_count: 980,
    primary_image: '/assets/images/dest_jaipur.jpg',
    company_name: 'Jaipur Heritage Walks',
    badges: ['Bestseller', 'Skip The Line', 'Instant Confirmation'],
    highlights: [
      'Skip ticket counter queue at Suraj Pol entrance',
      'Explore Sheesh Mahal, Diwan-e-Khas & Maota Lake vistas',
      'Certified Rajput history guide with audio assistance'
    ],
    description: 'Explore the grand 16th-century hill fortress of Amer with reserved entrance tickets. Discover the dazzling Sheesh Mahal (Mirror Palace), Sukh Niwas, and panoramic ramparts overlooking Maota Lake.'
  },
  {
    id: 12,
    title: 'Old Pink City Heritage Walking Tour & Bazaar Street Food Crawl',
    slug: 'old-pink-city-heritage-walking-street-food',
    category: 'cultural',
    city: 'Jaipur',
    country: 'India',
    location: 'Hawa Mahal Rd, Badi Choupad, Jaipur',
    duration_minutes: 180,
    duration_text: '3h',
    price: 1299,
    original_price: 1800,
    discount_percent: 28,
    rating: 4.9,
    reviews_count: 640,
    primary_image: '/assets/images/categories/cat_cultural.jpg',
    company_name: 'Pink City Cultural Guild',
    badges: ['Top Rated', 'Food Included', 'Small Group'],
    highlights: [
      'Taste iconic Pyaz Kachori, creamy Lassi & Ghewar in Johari Bazaar',
      'Stroll through ancient artisan alleys and hidden Havelis',
      'Prime photography vantage point in front of Hawa Mahal'
    ],
    description: 'Immerse yourself in authentic vibrant culture on a guided walking tour through the pink sandstone bazaars, sampling centuries-old street delicacies and photographing iconic Rajput landmarks.'
  },
  {
    id: 13,
    title: 'Nahargarh Fort Sunset 4x4 Open Jeep Safari & Cycle Trail',
    slug: 'nahargarh-fort-sunset-jeep-safari',
    category: 'adventure',
    city: 'Jaipur',
    country: 'India',
    location: 'Nahargarh Fort Rd, Aravalli Hills, Jaipur',
    duration_minutes: 210,
    duration_text: '3h 30m',
    price: 1850,
    original_price: 2500,
    discount_percent: 26,
    rating: 4.9,
    reviews_count: 510,
    primary_image: '/assets/images/exp_atv_biking.jpg',
    company_name: 'Aravalli Offroad Safaris',
    badges: ['Adventure Pick', 'Scenic Sunset', 'Tea Included'],
    highlights: [
      'Rugged 4x4 open Jeep drive across Aravalli hills ridges',
      'Breathtaking sunset vistas over the entire illuminated Pink City',
      'Complimentary evening tea & traditional Rajasthani snacks'
    ],
    description: 'Ascend the rugged Aravalli mountains in an open-top 4x4 Jeep to Nahargarh Fort. Watch the sunset illuminate the city of Jaipur followed by evening tea on the cliff ramparts.'
  },
  {
    id: 14,
    title: 'Jaipur Private Full-Day Royal Forts & Palaces Cab Sightseeing Tour',
    slug: 'jaipur-private-full-day-royal-tour-cab',
    category: 'sightseeing',
    city: 'Jaipur',
    country: 'India',
    location: 'Pickup from any Hotel in Jaipur',
    duration_minutes: 480,
    duration_text: '8h (Full Day)',
    price: 2499,
    original_price: 3600,
    discount_percent: 31,
    rating: 4.8,
    reviews_count: 1420,
    primary_image: '/assets/images/dest_jaipur.jpg',
    company_name: 'Royal Rajasthan Travels',
    badges: ['Bestseller', 'AC Private Cab', 'Free Hotel Pickup'],
    highlights: [
      'Dedicated AC Sedan cab with courteous professional chauffeur',
      'Covers Amber Fort, Jal Mahal, City Palace, Jantar Mantar & Hawa Mahal',
      'Flexible customizable itinerary with door-to-door hotel pickup'
    ],
    description: 'Experience the ultimate full-day exploration of Jaipur UNESCO World Heritage monuments in an air-conditioned private vehicle with flexible timing and personalized hotel pickup.'
  },
  {
    id: 15,
    title: 'Chokhi Dhani Ethnic Village Cultural Evening, Folk Dance & Buffet Dinner',
    slug: 'chokhi-dhani-cultural-evening-buffet-dinner',
    category: 'cultural',
    city: 'Jaipur',
    country: 'India',
    location: '12 Miles, Tonk Road, Via Vatika, Jaipur',
    duration_minutes: 240,
    duration_text: '4h',
    price: 3799,
    original_price: 4900,
    discount_percent: 22,
    rating: 4.7,
    reviews_count: 2150,
    primary_image: '/assets/images/categories/cat_sightseeing.jpg',
    company_name: 'Chokhi Dhani Hospitality',
    badges: ['Family Favorite', 'Royal Thali Buffet', 'Live Shows'],
    highlights: [
      'Grand Rajasthani royal thali vegetarian feast dinner',
      'Live Kalbelia folk dances, fire acrobatics & puppet theater',
      'Camel & bullock cart village rides, mehndi & palmistry'
    ],
    description: 'Step into a recreated traditional Rajasthani village fair with vibrant cultural folk performances, acrobats, camel rides, and an authentic royal multi-course Rajasthani dinner.'
  },
  {
    id: 8,
    title: 'Solang Valley Paragliding, Zorbing & ATV Quad Bike Adventure',
    slug: 'solang-valley-paragliding-zorbing-atv-adventure',
    category: 'adventure',
    city: 'Manali',
    country: 'India',
    location: 'Solang Valley, Manali, Himachal Pradesh',
    duration_minutes: 240,
    duration_text: '4h',
    price: 2799,
    original_price: 3900,
    discount_percent: 28,
    rating: 4.8,
    reviews_count: 760,
    primary_image: '/assets/images/exp_atv_biking.jpg',
    company_name: 'Himalayan Adventure Hub',
    badges: ['Top Rated', 'Equipment Provided'],
    highlights: [
      'High-flying tandem paragliding with experienced pilots',
      'Downhill zorbing ball roll and rough terrain ATV track',
      'Panoramic vistas of snow-capped Pir Panjal peaks'
    ],
    description: 'High-flying tandem paragliding overlooking snow-capped Himalayan peaks, giant zorbing ball downhill, and rough terrain ATV quad biking.'
  },
  {
    id: 9,
    title: 'Rishikesh 16km White Water River Rafting & Cliff Jumping',
    slug: 'rishikesh-16km-river-rafting-cliff-jumping',
    category: 'adventure',
    city: 'Rishikesh',
    country: 'India',
    location: 'Shivpuri to NIM Beach, Rishikesh',
    duration_minutes: 180,
    duration_text: '3h',
    price: 999,
    original_price: 1600,
    discount_percent: 38,
    rating: 4.9,
    reviews_count: 2840,
    primary_image: '/assets/images/dest_rishikesh.jpg',
    company_name: 'Ganga White Water Rapids',
    badges: ['Bestseller', 'Safety Kayakers', 'Instant Confirmation'],
    highlights: [
      'Conquer Roller Coaster, Golf Course & Club House Grade III+ rapids',
      'Maggi point cliff jumping into natural river pool',
      'Top safety gear with lifejackets, helmets and paddles'
    ],
    description: 'Navigate thrilling Grade III and IV rapids like Roller Coaster, Golf Course, and Club House along the holy Ganges river with safety kayakers and cliff jumping.'
  },
  {
    id: 10,
    title: 'Bali Mount Batur Sunrise Volcano Trek with Natural Hot Springs',
    slug: 'bali-mount-batur-sunrise-trek-hot-springs',
    category: 'adventure',
    city: 'Bali',
    country: 'Indonesia',
    location: 'Kintamani, Mount Batur, Bali',
    duration_minutes: 420,
    duration_text: '7h',
    price: 3499,
    original_price: 4900,
    discount_percent: 29,
    rating: 4.8,
    reviews_count: 1150,
    primary_image: '/assets/images/col_adventure.jpg',
    company_name: 'Bali Eco Volcano Tours',
    badges: ['Top Rated', 'Hotel Transfer', 'Hot Springs'],
    highlights: [
      'Witness dramatic sunrise overlooking Lake Batur and Mount Agung',
      'Volcanic steam cooked eggs and hot breakfast at crater rim',
      'Relax in natural thermal volcanic hot springs after hike'
    ],
    description: 'Hike to the summit of active Mount Batur volcano for an unforgettable sunrise above the clouds, followed by hot volcanic steam cooked breakfast and soaking in lakeside thermal hot springs.'
  }
];

const ALL_LOCATIONS_LIST = [
  'All',
  'Paris',
  'Dubai',
  'Goa',
  'Jaipur',
  'Manali',
  'Rishikesh',
  'Bali',
  'Udaipur',
  'Jaisalmer',
  'Thailand'
];

const ALL_CATEGORIES_LIST = [
  { label: 'All Categories', slug: 'all' },
  { label: 'Sightseeing & City Tours', slug: 'sightseeing' },
  { label: 'Adventure & Theme Parks', slug: 'adventure' },
  { label: 'Water Sports & Cruises', slug: 'water-sports' },
  { label: 'Desert Safari', slug: 'desert-safari' },
  { label: 'Cultural & Heritage', slug: 'cultural' },
  { label: 'Luxury & VIP', slug: 'luxury-vip' },
  { label: 'Wildlife & Nature', slug: 'wildlife' },
  { label: 'Food & Dining', slug: 'food-dining' }
];

function ListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, role, logout } = useAuth();
  const { addToast } = useToast();

  // Search parameters from URL
  const initialDestination = searchParams.get('destination') || searchParams.get('city') || (searchParams.get('scode') ? 'Paris' : 'All');
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || searchParams.get('q') || '';
  const initialDate = searchParams.get('date') || '';
  const initialGuests = searchParams.get('guests') || '1';
  const initialMinPrice = searchParams.get('min_price') || searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('max_price') || searchParams.get('maxPrice') || '';
  const initialPricePreset = searchParams.get('price_range') || (initialMinPrice || initialMaxPrice ? 'custom' : 'all');

  // Search Bar State
  const [selectedDestination, setSelectedDestination] = useState(initialDestination);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchDate, setSearchDate] = useState(initialDate);
  const [guestsCount, setGuestsCount] = useState(parseInt(initialGuests, 10) || 1);
  const [keyword, setKeyword] = useState(initialSearch);

  // Filter States
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || '15000');
  const [pricePreset, setPricePreset] = useState(initialPricePreset);
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [onlyInstantConfirm, setOnlyInstantConfirm] = useState(false);
  const [onlyFreeCancel, setOnlyFreeCancel] = useState(false);
  const [quickChip, setQuickChip] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  // Price calculations and helpers
  const numMinPrice = minPrice ? parseFloat(minPrice) : 0;
  const numMaxPrice = (maxPrice && maxPrice !== '15000') ? parseFloat(maxPrice) : Infinity;
  const isPriceFiltered = numMinPrice > 0 || numMaxPrice < Infinity || pricePreset !== 'all';

  const handleSelectPricePreset = (presetId) => {
    setPricePreset(presetId);
    if (presetId === 'all') {
      setMinPrice('');
      setMaxPrice('15000');
    } else if (presetId === 'under_1500') {
      setMinPrice('0');
      setMaxPrice('1500');
    } else if (presetId === '1500_3500') {
      setMinPrice('1500');
      setMaxPrice('3500');
    } else if (presetId === '3500_6000') {
      setMinPrice('3500');
      setMaxPrice('6000');
    } else if (presetId === 'above_6000') {
      setMinPrice('6000');
      setMaxPrice('15000');
    }
  };

  const handleSliderChange = (e) => {
    const val = e.target.value;
    setMaxPrice(val);
    setPricePreset('custom');
  };

  const handleResetPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('15000');
    setPricePreset('all');
  };

  // Data & Modal States
  const [activities, setActivities] = useState(FALLBACK_ACTIVITIES);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync state if URL query changes
  useEffect(() => {
    const dest = searchParams.get('destination') || searchParams.get('city') || (searchParams.get('scode') ? 'Paris' : 'All');
    setSelectedDestination(dest);
    const cat = searchParams.get('category') || 'all';
    setSelectedCategory(cat);
    const q = searchParams.get('search') || searchParams.get('q') || '';
    setKeyword(q);
    const minP = searchParams.get('min_price') || searchParams.get('minPrice') || '';
    const maxP = searchParams.get('max_price') || searchParams.get('maxPrice') || '';
    if (minP) setMinPrice(minP);
    if (maxP) setMaxPrice(maxP);
    if (minP || maxP) setPricePreset('custom');
  }, [searchParams]);

  // Load activities from API
  useEffect(() => {
    let isMounted = true;
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedDestination && selectedDestination !== 'All') {
          params.city = selectedDestination;
        }
        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (keyword) {
          params.search = keyword;
        }
        if (sortBy) {
          params.sort = sortBy;
        }
        if (minPrice) {
          params.minPrice = minPrice;
        }
        if (maxPrice && maxPrice !== '15000') {
          params.maxPrice = maxPrice;
        }

        const res = await activitiesService.getActivities(params);
        if (isMounted) {
          if (res.success && res.data && res.data.length > 0) {
            setActivities(res.data);
          } else {
            // Apply client-side fallback
            let filtered = [...FALLBACK_ACTIVITIES];
            if (selectedDestination && selectedDestination !== 'All') {
              filtered = filtered.filter(a => a.city.toLowerCase() === selectedDestination.toLowerCase());
            }
            if (selectedCategory && selectedCategory !== 'all') {
              filtered = filtered.filter(a => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));
            }
            if (keyword) {
              const kw = keyword.toLowerCase();
              filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(kw) ||
                a.city.toLowerCase().includes(kw) ||
                a.location?.toLowerCase().includes(kw)
              );
            }
            setActivities(filtered);
          }
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
        if (isMounted) {
          setActivities(FALLBACK_ACTIVITIES);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivities();
    return () => { isMounted = false; };
  }, [selectedDestination, selectedCategory, keyword, sortBy, minPrice, maxPrice]);

  // Handle Search Submission
  const handleTopSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedDestination && selectedDestination !== 'All') {
      query.set('destination', selectedDestination);
    }
    if (selectedCategory && selectedCategory !== 'all') {
      query.set('category', selectedCategory);
    }
    if (keyword) {
      query.set('search', keyword);
    }
    if (searchDate) {
      query.set('date', searchDate);
    }
    if (guestsCount > 1) {
      query.set('guests', guestsCount.toString());
    }
    if (minPrice) {
      query.set('min_price', minPrice);
    }
    if (maxPrice && maxPrice !== '15000') {
      query.set('max_price', maxPrice);
    }
    router.push(`/listing?${query.toString()}`);
  };

  // Toggle Wishlist
  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        addToast('Removed from saved items', 'info');
      } else {
        next.add(id);
        addToast('Saved to your wishlist ❤️', 'success');
      }
      return next;
    });
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setSelectedDestination('All');
    setSelectedCategory('all');
    setKeyword('');
    setMinPrice('');
    setMaxPrice('15000');
    setPricePreset('all');
    setSelectedDuration('all');
    setSelectedRating('all');
    setOnlyInstantConfirm(false);
    setOnlyFreeCancel(false);
    setQuickChip('all');
    router.push('/listing');
    addToast('Filters reset to default view', 'info');
  };

  // Dynamic Price Preset Counts matching current destination and category
  const pricePresetCounts = useMemo(() => {
    let base = [...activities];
    if (selectedDestination && selectedDestination !== 'All') {
      base = base.filter(a => a.city.toLowerCase() === selectedDestination.toLowerCase());
    }
    if (selectedCategory && selectedCategory !== 'all') {
      base = base.filter(a => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    return {
      all: base.length,
      under_1500: base.filter(a => a.price < 1500).length,
      p1500_3500: base.filter(a => a.price >= 1500 && a.price <= 3500).length,
      p3500_6000: base.filter(a => a.price > 3500 && a.price <= 6000).length,
      above_6000: base.filter(a => a.price > 6000).length,
    };
  }, [activities, selectedDestination, selectedCategory]);

  // Client-side filtering & sorting
  const filteredActivities = useMemo(() => {
    let list = [...activities];

    if (selectedDestination && selectedDestination !== 'All') {
      list = list.filter(a => a.city.toLowerCase() === selectedDestination.toLowerCase());
    }

    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter(a => a.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    if (keyword.trim()) {
      const q = keyword.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.location?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    }

    // Price Range Filter
    const minP = minPrice ? parseFloat(minPrice) : 0;
    const maxP = (maxPrice && maxPrice !== '15000') ? parseFloat(maxPrice) : Infinity;
    if (minP > 0 || maxP < Infinity) {
      list = list.filter(a => a.price >= minP && a.price <= maxP);
    }

    // Duration
    if (selectedDuration === 'under_2h') list = list.filter(a => a.duration_minutes <= 120);
    else if (selectedDuration === '2h_4h') list = list.filter(a => a.duration_minutes > 120 && a.duration_minutes <= 240);
    else if (selectedDuration === '4h_8h') list = list.filter(a => a.duration_minutes > 240 && a.duration_minutes <= 480);
    else if (selectedDuration === 'full_day') list = list.filter(a => a.duration_minutes > 480);

    // Rating
    if (selectedRating === '4.5') list = list.filter(a => a.rating >= 4.5);
    else if (selectedRating === '4.0') list = list.filter(a => a.rating >= 4.0);

    // Quick Chips
    if (quickChip === 'bestseller') list = list.filter(a => a.badges?.some(b => b.toLowerCase().includes('bestseller')));
    else if (quickChip === 'top_rated') list = list.filter(a => a.rating >= 4.8);
    else if (quickChip === 'free_cancel') list = list.filter(a => a.badges?.some(b => b.toLowerCase().includes('cancellation')));
    else if (quickChip === 'under_2000') list = list.filter(a => a.price <= 2000);
    else if (quickChip === '2000_5000') list = list.filter(a => a.price >= 2000 && a.price <= 5000);
    else if (quickChip === 'above_5000') list = list.filter(a => a.price > 5000);

    // Badges
    if (onlyInstantConfirm) list = list.filter(a => a.badges?.some(b => b.toLowerCase().includes('instant')));
    if (onlyFreeCancel) list = list.filter(a => a.badges?.some(b => b.toLowerCase().includes('cancellation')));

    // Sort
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'duration') list.sort((a, b) => a.duration_minutes - b.duration_minutes);

    return list;
  }, [
    activities, selectedDestination, selectedCategory, keyword,
    minPrice, maxPrice, selectedDuration, selectedRating, quickChip,
    onlyInstantConfirm, onlyFreeCancel, sortBy
  ]);

  // Destination Counts
  const destinationCounts = useMemo(() => {
    const counts = {};
    ALL_LOCATIONS_LIST.forEach(loc => { counts[loc] = 0; });
    activities.forEach(act => {
      const c = act.city;
      if (counts[c] !== undefined) counts[c]++;
      else counts[c] = 1;
    });
    counts['All'] = activities.length;
    return counts;
  }, [activities]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDestination !== 'All') count++;
    if (selectedCategory !== 'all') count++;
    if (isPriceFiltered) count++;
    if (selectedDuration !== 'all') count++;
    if (selectedRating !== 'all') count++;
    if (onlyInstantConfirm) count++;
    if (onlyFreeCancel) count++;
    if (keyword.trim()) count++;
    return count;
  }, [selectedDestination, selectedCategory, isPriceFiltered, selectedDuration, selectedRating, onlyInstantConfirm, onlyFreeCancel, keyword]);

  return (
    <div className="listing-page-container">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="mmt-nav-header">
        <div className="mmt-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/" className="mmt-brand-logo">
              <span className="mmt-logo-icon">
                <Compass size={22} />
              </span>
              <span>TRAVEL<span style={{ color: '#0D9488' }}>.</span></span>
            </Link>

            <nav className="mmt-nav-links">
              <Link href="/" className="mmt-nav-link">Home</Link>
              <Link href="/listing" className="mmt-nav-link active">Tours & Attractions</Link>
              <Link href="/listing?category=adventure" className="mmt-nav-link">Adventures</Link>
              <Link href="/#offers-heading" className="mmt-nav-link">Offers</Link>
            </nav>
          </div>

          <div className="mmt-nav-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  href={role === 'supplier' ? '/supplier/dashboard' : (role === 'site_admin' ? '/admin/dashboard' : '/customer/profile')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                  {user?.first_name || user?.email?.split('@')[0] || 'My Account'}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="mmt-btn-login"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAKEMYTRIP FLOATING SEARCH & MODIFICATION RIBBON */}
      <section className="mmt-search-banner">
        <div className="mmt-container">
          {/* Breadcrumbs */}
          <div className="mmt-breadcrumbs">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <Link href="/listing">Tours & Attractions</Link>
            <ChevronRight size={12} />
            <span style={{ color: '#FFFFFF', fontWeight: '700' }}>
              {selectedDestination === 'All' ? 'All Global Destinations' : selectedDestination}
            </span>
          </div>

          {/* Heading */}
          <div className="mmt-banner-header">
            <div>
              <h1 className="mmt-banner-title">
                Tours & Activities in {selectedDestination === 'All' ? 'All Destinations' : selectedDestination}
              </h1>
              <p className="mmt-banner-sub">
                Book handpicked skip-the-line tickets, day tours, museum visits & adventures with instant confirmation.
              </p>
            </div>
            <div className="mmt-trust-tags">
              <span className="mmt-trust-tag">⚡ 100% Mobile Vouchers</span>
              <span className="mmt-trust-tag">🛡️ Best Price Guarantee</span>
            </div>
          </div>

          {/* Persistent Search Form Box */}
          <form onSubmit={handleTopSearchSubmit} className="mmt-search-box">
            {/* 1. Destination */}
            <div className="mmt-field-group">
              <label className="mmt-field-label">Destination / City</label>
              <div className="mmt-input-wrap">
                <MapPin size={18} className="mmt-field-icon" />
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="mmt-select"
                >
                  {ALL_LOCATIONS_LIST.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc === 'All' ? '🌍 All Locations' : `📍 ${loc}`}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ color: '#94A3B8', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* 2. Category */}
            <div className="mmt-field-group">
              <label className="mmt-field-label">Experience Category</label>
              <div className="mmt-input-wrap">
                <Compass size={18} className="mmt-field-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mmt-select"
                >
                  {ALL_CATEGORIES_LIST.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} style={{ color: '#94A3B8', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* 3. Date */}
            <div className="mmt-field-group">
              <label className="mmt-field-label">Activity Date</label>
              <div className="mmt-input-wrap">
                <Calendar size={18} className="mmt-field-icon" />
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="mmt-input"
                  style={{ fontSize: '12.5px' }}
                />
              </div>
            </div>

            {/* 4. Guests Counter */}
            <div className="mmt-field-group">
              <label className="mmt-field-label">Guests / Tickets</label>
              <div className="mmt-input-wrap">
                <div className="mmt-counter-wrap">
                  <button
                    type="button"
                    onClick={() => setGuestsCount(prev => Math.max(1, prev - 1))}
                    className="mmt-btn-counter"
                  >
                    -
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                    {guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestsCount(prev => prev + 1)}
                    className="mmt-btn-counter"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Search Button */}
            <div className="mmt-field-group">
              <button type="submit" className="mmt-btn-search">
                <Search size={16} />
                <span>SEARCH</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. QUICK FILTER STRIP */}
      <section className="mmt-quick-strip">
        <div className="mmt-quick-inner">
          <div className="mmt-quick-pills">
            <span className="mmt-pill-tag">
              <Sparkles size={13} style={{ color: '#0D9488', display: 'inline', marginRight: '4px' }} />
              Quick:
            </span>

            {[
              { id: 'all', label: 'All Activities' },
              { id: 'bestseller', label: '🔥 Bestsellers' },
              { id: 'top_rated', label: '★ Top Rated (4.8+)' },
              { id: 'under_2000', label: '💰 Under ₹2,000' },
              { id: '2000_5000', label: '💰 ₹2,000 - ₹5,000' },
              { id: 'above_5000', label: '💎 Luxury (₹5,000+)' },
              { id: 'free_cancel', label: '🛡️ Free Cancellation' }
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setQuickChip(chip.id)}
                className={`mmt-pill ${quickChip === chip.id ? 'active' : ''}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MAIN LAYOUT: SIDEBAR + RESULTS FEED */}
      <div className="mmt-main-layout">

        {/* LEFT SIDEBAR FILTERS */}
        <aside className="mmt-sidebar">
          <div className="mmt-sidebar-title-row">
            <div className="mmt-sidebar-title">
              <SlidersHorizontal size={16} style={{ color: '#333F70' }} />
              <span>Select Filters</span>
              {activeFiltersCount > 0 && (
                <span style={{
                  background: '#0D9488',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '100px'
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button type="button" onClick={handleClearFilters} className="mmt-btn-clear">
                Clear All
              </button>
            )}
          </div>

          {/* Search within Results */}
          <div className="mmt-filter-section">
            <div className="mmt-filter-heading">Search in Results</div>
            <div className="mmt-input-wrap" style={{ height: '40px', padding: '0 10px' }}>
              <Search size={14} style={{ color: '#94A3B8', marginRight: '8px' }} />
              <input
                type="text"
                placeholder="e.g. cruise, museum, safari..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="mmt-input"
                style={{ fontSize: '12px' }}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="mmt-filter-section">
            <div className="mmt-filter-heading">Locations & Cities</div>
            <div className="mmt-filter-options">
              {ALL_LOCATIONS_LIST.map((loc) => {
                const isChecked = selectedDestination === loc;
                const count = destinationCounts[loc] || 0;
                return (
                  <div
                    key={loc}
                    onClick={() => setSelectedDestination(loc)}
                    className={`mmt-filter-item ${isChecked ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="radio"
                        name="side_dest"
                        checked={isChecked}
                        onChange={() => setSelectedDestination(loc)}
                        style={{ accentColor: '#333F70', cursor: 'pointer' }}
                      />
                      <span>{loc === 'All' ? 'All Destinations' : loc}</span>
                    </div>
                    <span className="mmt-filter-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mmt-filter-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="mmt-filter-heading" style={{ margin: 0 }}>Price Range</div>
              {isPriceFiltered && (
                <button
                  type="button"
                  onClick={handleResetPriceFilter}
                  className="mmt-price-range-badge-reset"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="mmt-price-filter-card">
              {/* Dynamic Range Value Box */}
              <div className="mmt-price-range-badge">
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Selected Range
                  </span>
                  <span className="mmt-price-range-badge-val">
                    ₹{numMinPrice.toLocaleString('en-IN')} — {numMaxPrice === Infinity ? '₹15,000+' : `₹${numMaxPrice.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <span style={{ fontSize: '10.5px', color: '#0F766E', fontWeight: '800', background: '#CCFBF1', padding: '3px 8px', borderRadius: '100px' }}>
                  Per Person
                </span>
              </div>

              {/* Interactive Max Price Slider */}
              <div className="mmt-slider-container">
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="250"
                  value={maxPrice || '15000'}
                  onChange={handleSliderChange}
                  className="mmt-range-slider"
                  style={{
                    background: `linear-gradient(to right, #0D9488 0%, #0D9488 ${Math.min(100, Math.max(0, (((parseFloat(maxPrice || '15000')) - 500) / (15000 - 500)) * 100))}%, #E2E8F0 ${Math.min(100, Math.max(0, (((parseFloat(maxPrice || '15000')) - 500) / (15000 - 500)) * 100))}%, #E2E8F0 100%)`
                  }}
                  aria-label="Filter maximum price"
                />
                <div className="mmt-slider-labels">
                  <span>Min: ₹500</span>
                  <span>Max: ₹15,000+</span>
                </div>
              </div>

              {/* Direct Min / Max Input Fields */}
              <div className="mmt-price-inputs-grid">
                <div className="mmt-price-input-box">
                  <label className="mmt-price-input-label">Min (₹)</label>
                  <div className="mmt-price-input-wrap">
                    <span className="mmt-price-currency">₹</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setPricePreset('custom');
                      }}
                      className="mmt-price-input-field"
                    />
                  </div>
                </div>

                <div className="mmt-price-input-box">
                  <label className="mmt-price-input-label">Max (₹)</label>
                  <div className="mmt-price-input-wrap">
                    <span className="mmt-price-currency">₹</span>
                    <input
                      type="number"
                      placeholder="15000"
                      value={maxPrice === '15000' && pricePreset === 'all' ? '' : maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setPricePreset('custom');
                      }}
                      className="mmt-price-input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Preset Radios with Live Counts */}
              <div className="mmt-price-presets-list">
                {[
                  { id: 'all', label: 'All Price Ranges', count: pricePresetCounts.all },
                  { id: 'under_1500', label: 'Under ₹1,500', count: pricePresetCounts.under_1500 },
                  { id: '1500_3500', label: '₹1,500 to ₹3,500', count: pricePresetCounts.p1500_3500 },
                  { id: '3500_6000', label: '₹3,500 to ₹6,000', count: pricePresetCounts.p3500_6000 },
                  { id: 'above_6000', label: 'Above ₹6,000', count: pricePresetCounts.above_6000 }
                ].map((item) => {
                  const isChecked = pricePreset === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectPricePreset(item.id)}
                      className={`mmt-price-preset-row ${isChecked ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="radio"
                          name="side_price_preset"
                          checked={isChecked}
                          onChange={() => handleSelectPricePreset(item.id)}
                          style={{ accentColor: '#0D9488', cursor: 'pointer' }}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="mmt-price-preset-count">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="mmt-filter-section">
            <div className="mmt-filter-heading">Experience Duration</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'all', label: 'Any Duration' },
                { id: 'under_2h', label: 'Up to 2 Hours' },
                { id: '2h_4h', label: '2 to 4 Hours' },
                { id: '4h_8h', label: '4 to 8 Hours' },
                { id: 'full_day', label: 'Full Day (8h+)' }
              ].map((d) => (
                <label key={d.id} className="mmt-filter-check-row">
                  <input
                    type="radio"
                    name="side_duration"
                    checked={selectedDuration === d.id}
                    onChange={() => setSelectedDuration(d.id)}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="mmt-filter-section">
            <div className="mmt-filter-heading">Customer Rating</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'all', label: 'All Ratings' },
                { id: '4.5', label: '4.5 ★ & Above' },
                { id: '4.0', label: '4.0 ★ & Above' }
              ].map((r) => (
                <label key={r.id} className="mmt-filter-check-row">
                  <input
                    type="radio"
                    name="side_rating"
                    checked={selectedRating === r.id}
                    onChange={() => setSelectedRating(r.id)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Booking Preferences */}
          <div className="mmt-filter-section">
            <div className="mmt-filter-heading">Preferences</div>
            <label className="mmt-filter-check-row">
              <input
                type="checkbox"
                checked={onlyInstantConfirm}
                onChange={(e) => setOnlyInstantConfirm(e.target.checked)}
              />
              <span>⚡ Instant Confirmation</span>
            </label>
            <label className="mmt-filter-check-row">
              <input
                type="checkbox"
                checked={onlyFreeCancel}
                onChange={(e) => setOnlyFreeCancel(e.target.checked)}
              />
              <span>🛡️ Free Cancellation</span>
            </label>
          </div>
        </aside>

        {/* RIGHT COLUMN: RESULTS FEED */}
        <main className="mmt-results-feed">
          {/* Top Sort & Count Bar */}
          <div className="mmt-results-topbar">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div className="mmt-results-count">
                  Showing <span>{filteredActivities.length}</span> Activities & Experiences
                </div>
                {isPriceFiltered && (
                  <div className="mmt-active-filter-tag">
                    <span>💰 ₹{numMinPrice.toLocaleString('en-IN')} – {numMaxPrice === Infinity ? '₹15,000+' : `₹${numMaxPrice.toLocaleString('en-IN')}`}</span>
                    <button type="button" onClick={handleResetPriceFilter} title="Remove price filter">
                      <X size={12} />
                    </button>
                  </div>
                )}
                {selectedDestination !== 'All' && (
                  <div className="mmt-active-filter-tag" style={{ background: '#EEF2FF', borderColor: '#C7D2FE', color: '#3730A3' }}>
                    <span>📍 {selectedDestination}</span>
                    <button type="button" onClick={() => setSelectedDestination('All')} title="Remove destination filter" style={{ color: '#4338CA' }}>
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0', fontWeight: '500' }}>
                {selectedDestination === 'All' ? 'Across all top global destinations' : `Located in ${selectedDestination}`}</p>
            </div>

            <div className="mmt-sort-wrap">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mmt-sort-select"
              >
                <option value="popularity">Popularity / Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="duration">Duration: Short to Long</option>
              </select>
            </div>
          </div>

          {/* Activity Cards Feed */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ background: '#FFFFFF', padding: '24px', borderRadius: '18px', height: '220px', border: '1.5px solid #E2E8F0' }}>
                  <div style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '700' }}>Loading experiences...</div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #E2E8F0',
              padding: '48px 24px',
              textAlign: 'center'
            }}>
              <Compass size={48} style={{ color: '#333F70', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                No Activities Found
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '420px', margin: '8px auto 20px auto' }}>
                We could not find matching activities in <strong>{selectedDestination}</strong> with current filters. Try resetting filters.
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                style={{
                  padding: '10px 24px',
                  background: '#333F70',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredActivities.map((item) => {
              const isWishlisted = wishlist.has(item.id);
              return (
                <article key={item.id} className="mmt-card">
                  {/* Left: Image Banner */}
                  <Link
                    href={`/activity/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mmt-card-img-wrap"
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <img
                      src={item.primary_image || '/assets/images/dest_jaipur.jpg'}
                      alt={item.title}
                      className="mmt-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/assets/images/dest_jaipur.jpg';
                      }}
                    />

                    {/* Top Badges */}
                    <div className="mmt-badge-group">
                      {item.badges?.[0] && (
                        <span className="mmt-badge-gold">{item.badges[0]}</span>
                      )}
                      {item.discount_percent > 0 && (
                        <span className="mmt-badge-green">{item.discount_percent}% OFF</span>
                      )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item.id); }}
                      className={`mmt-btn-wishlist ${isWishlisted ? 'active' : ''}`}
                      aria-label="Wishlist"
                    >
                      <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                  </Link>

                  {/* Middle: Details */}
                  <div className="mmt-card-content">
                    <div>
                      {/* Category & Location */}
                      <div className="mmt-card-meta-top">
                        <span className="mmt-card-category">{item.category?.replace('-', ' ')}</span>
                        <span style={{ color: '#CBD5E1' }}>•</span>
                        <span className="mmt-card-location">
                          <MapPin size={13} style={{ color: '#0D9488' }} />
                          {item.city}, {item.country}
                        </span>
                      </div>

                      {/* Title */}
                      <Link
                        href={`/activity/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <h2 className="mmt-card-title">
                          {item.title}
                        </h2>
                      </Link>

                      {/* Rating */}
                      <div className="mmt-rating-row">
                        <span className="mmt-rating-pill">★ {item.rating}</span>
                        <span className="mmt-rating-label">Very Good</span>
                        <span className="mmt-rating-reviews">({item.reviews_count} reviews)</span>
                      </div>

                      {/* Highlights */}
                      <div className="mmt-highlights-list">
                        {item.highlights?.slice(0, 3).map((h, idx) => (
                          <div key={idx} className="mmt-highlight-item">
                            <Check size={14} className="mmt-highlight-icon" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Tags */}
                    <div className="mmt-card-footer-tags">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} style={{ color: '#333F70' }} />
                        Duration: {item.duration_text}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#059669' }}>
                        <ShieldCheck size={14} />
                        Free Cancellation
                      </span>
                    </div>
                  </div>

                  {/* Right: Pricing & CTA */}
                  <div className="mmt-card-sidebar">
                    <div style={{ width: '100%' }}>
                      <div className="mmt-price-label">Starting from</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '4px' }}>
                        {item.original_price && (
                          <span className="mmt-price-original">₹{item.original_price.toLocaleString()}</span>
                        )}
                        <span className="mmt-price-amount">₹{item.price.toLocaleString()}</span>
                      </div>
                      <div className="mmt-price-note">per adult • taxes included</div>
                      {item.original_price && (
                        <div className="mmt-price-save-badge">
                          Save ₹{(item.original_price - item.price).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <div style={{ width: '100%' }}>
                      <Link
                        href={`/activity/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mmt-btn-details"
                        style={{ textDecoration: 'none' }}
                      >
                        <span>VIEW DETAILS</span>
                        <ArrowRight size={14} />
                      </Link>
                      <div className="mmt-instant-confirm-note">⚡ Instant Confirmation</div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </main>
      </div>

      {/* 5. POPUP ACTIVITY DETAIL & BOOKING MODAL */}
      {selectedActivity && (
        <div className="mmt-modal-overlay">
          <div className="mmt-modal-box">
            <button
              type="button"
              onClick={() => setSelectedActivity(null)}
              className="mmt-modal-close"
            >
              <X size={18} />
            </button>

            {/* Modal Hero Banner */}
            <div className="mmt-modal-hero">
              <img src={selectedActivity.primary_image} alt={selectedActivity.title} />
              <div className="mmt-modal-hero-gradient"></div>
              <div className="mmt-modal-hero-content">
                <span style={{
                  background: '#0D9488',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  {selectedActivity.category?.replace('-', ' ')}
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: '8px 0 4px 0' }}>
                  {selectedActivity.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#E2E8F0' }}>
                  <span>📍 {selectedActivity.location || `${selectedActivity.city}, ${selectedActivity.country}`}</span>
                  <span>•</span>
                  <span>⏱️ {selectedActivity.duration_text}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mmt-modal-body">
              {/* Rating + Operator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="mmt-rating-pill">★ {selectedActivity.rating}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#0F172A' }}>
                    Based on {selectedActivity.reviews_count} traveler reviews
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  By <strong>{selectedActivity.company_name}</strong>
                </span>
              </div>

              {/* Overview */}
              <div>
                <h4 style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Experience Overview
                </h4>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6', margin: 0 }}>
                  {selectedActivity.description}
                </p>
              </div>

              {/* Inclusions */}
              <div>
                <h4 style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Inclusions & Highlights
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selectedActivity.highlights?.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                      <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <h4 style={{ fontSize: '11.5px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Select Time Slot
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['09:00 AM (Morning)', '01:30 PM (Afternoon)', '05:00 PM (Sunset)'].map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: idx === 0 ? '1.5px solid #333F70' : '1px solid #E2E8F0',
                        background: idx === 0 ? 'rgba(51, 63, 112, 0.08)' : '#FFFFFF',
                        color: idx === 0 ? '#333F70' : '#475569',
                        fontWeight: '800',
                        fontSize: '11.5px',
                        cursor: 'pointer'
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #F1F5F9', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase' }}>Total Payable</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A' }}>
                    ₹{(selectedActivity.price * guestsCount).toLocaleString()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isAuthenticated) {
                      setAuthModalOpen(true);
                      addToast('Please login to complete booking', 'info');
                    } else {
                      addToast(`Booking initiated for "${selectedActivity.title}"!`, 'success');
                      setSelectedActivity(null);
                    }
                  }}
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(13, 148, 136, 0.35)'
                  }}
                >
                  Book Experience Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole="customer"
        initialMode="signin"
      />
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9' }}>
          <div style={{ textAlign: 'center', color: '#64748B', fontWeight: '700' }}>
            Loading Tours &amp; Attractions...
          </div>
        </div>
      }
    >
      <ListingContent />
    </Suspense>
  );
}
