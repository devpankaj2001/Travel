'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Calendar, Clock, Star, ShieldCheck, Check,
  CheckCircle2, X, Heart, Share2, Compass, ChevronRight,
  ArrowLeft, ArrowRight, Lock, Sparkles, PhoneCall,
  MessageSquare, Building, Info, AlertCircle, ThumbsUp,
  User, Eye
} from 'lucide-react';

import '../activity-detail.css';
import { activitiesService } from '../../../services/activities.service';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/Toast';
import AuthModal from '../../../components/AuthModal';

// Complete high-quality catalog of activities
const ALL_ACTIVITIES = [
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
    secondary_images: [
      '/assets/images/categories/cat_romantic.jpg',
      '/assets/images/categories/cat_cultural.jpg',
      '/assets/images/dest_dubai.jpg'
    ],
    company_name: 'Paris Heritage Explorers',
    badges: ['Bestseller', 'Instant Confirmation', 'Free Cancellation'],
    highlights: [
      'Summit elevator access to top floor of Eiffel Tower',
      '1-Hour scenic cruise along River Seine with audio guide',
      'Skip the ticket purchase line with mobile voucher',
      'Audio commentary in 14 international languages'
    ],
    inclusions: [
      'Eiffel Tower top summit elevator ticket',
      '1-Hour Seine River cruise boarding pass',
      'Multilingual audio guide headset on boat',
      'All local booking taxes & entry fees'
    ],
    exclusions: [
      'Hotel pickup & drop-off',
      'Food, drinks & restaurant meals',
      'Gratuities (optional)'
    ],
    meeting_point: 'Place de Sydney, 75015 Paris (150m from Eiffel Tower base pillar). Look for guide holding TRAVEL flag.',
    description: 'Skip the standard ticketing lines and ascend to the top floor summit of Paris iconic Eiffel Tower. Marvel at unmatched 360-degree vistas across Montmartre, Notre Dame, and the Arc de Triomphe, followed by a scenic 1-hour cruise gliding through the historic River Seine passing Louvre Museum and Pont Alexandre III.'
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
    secondary_images: [
      '/assets/images/categories/cat_educational.jpg',
      '/assets/images/categories/cat_sightseeing.jpg'
    ],
    company_name: 'Louvre Art Guild',
    badges: ['Top Rated', 'Instant Confirmation', 'Skip The Line'],
    highlights: [
      'Reserved time-slot entrance to avoid hours of waiting',
      'Expert certified art historian live guide in English',
      'See the Mona Lisa, Venus de Milo, and Winged Victory',
      'Small intimate group limited to 15 travelers'
    ],
    inclusions: [
      'Skip-the-line timed Louvre Museum admission',
      '2.5-hour licensed art historian guided tour',
      'Personal wireless audio headset',
      'Free time to explore permanent exhibits after tour'
    ],
    exclusions: [
      'Hotel transfers',
      'Temporary special exhibition tickets',
      'Food & beverages'
    ],
    meeting_point: 'Arc de Triomphe du Carrousel, opposite the Louvre Pyramid glass entrance.',
    description: 'Bypass the immense entrance lines with priority tickets and explore the Mona Lisa, Venus de Milo, and Winged Victory with an expert art historian guide.'
  },
  {
    id: 7,
    title: 'Royal Jaipur Heritage Hot Air Balloon Flight at Sunrise',
    slug: 'royal-jaipur-heritage-hot-air-balloon-flight',
    category: 'adventure',
    city: 'Jaipur',
    country: 'India',
    location: 'Amber Fort Area, Jaipur, Rajasthan 302001',
    duration_minutes: 180,
    duration_text: '3h',
    price: 8500,
    original_price: 12000,
    discount_percent: 29,
    rating: 4.9,
    reviews_count: 420,
    primary_image: '/assets/images/categories/cat_air.jpg',
    secondary_images: [
      '/assets/images/dest_jaipur.jpg',
      '/assets/images/exp_atv_biking.jpg',
      '/assets/images/col_luxury.jpg'
    ],
    company_name: 'SkyWaltz Balloon Safaris',
    badges: ['Luxury VIP', 'Certified Pilots', 'Breakfast Included'],
    highlights: [
      'Soar gently above Amber Palace, Jal Mahal & Aravalli hills',
      'Commercial pilot certified by Civil Aviation Authority',
      'First flight certificate & continental breakfast',
      'Round-trip hotel transfers in AC vehicle included'
    ],
    inclusions: [
      'Approx 60-minute hot air balloon sunrise flight',
      'Tea/coffee and light breakfast at landing site',
      'First Flight Certificate signed by Pilot',
      'Hotel pickup and drop-off in Jaipur central hotels',
      'Comprehensive passenger aviation insurance'
    ],
    exclusions: [
      'Personal tips and gratuities',
      'Professional GoPro video package (optional add-on)'
    ],
    meeting_point: 'Hotel pickup provided from anywhere within Jaipur municipal limits at 05:30 AM.',
    description: 'Float serenely over Rajput palaces, centuries-old forts, and the Aravalli hills during golden sunrise with certified commercial balloon pilots and champagne toast.'
  },
  {
    id: 11,
    title: 'Amber Fort & Palace Skip-The-Line Guided Heritage Tour',
    slug: 'amber-fort-skip-the-line-guided-tour',
    category: 'cultural',
    city: 'Jaipur',
    country: 'India',
    location: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
    duration_minutes: 120,
    duration_text: '2h',
    price: 499,
    original_price: 799,
    discount_percent: 38,
    rating: 4.8,
    reviews_count: 980,
    primary_image: '/assets/images/dest_jaipur.jpg',
    secondary_images: [
      '/assets/images/categories/cat_cultural.jpg',
      '/assets/images/categories/cat_sightseeing.jpg',
      '/assets/images/col_luxury.jpg'
    ],
    company_name: 'Jaipur Heritage Walks',
    badges: ['Bestseller', 'Skip The Line', 'Instant Confirmation'],
    highlights: [
      'Skip ticket counter queue at Suraj Pol entrance',
      'Explore Sheesh Mahal, Diwan-e-Khas & Maota Lake vistas',
      'Certified Rajput history guide with audio assistance',
      'Fascinating legends of Raja Man Singh & Rajput dynasty'
    ],
    inclusions: [
      'Reserved Skip-the-line Amber Fort admission ticket',
      '2-Hour government-licensed English/Hindi tour guide',
      'Access to Sheesh Mahal, Diwan-e-Aam, and Zenana Palace',
      'All monument service charges'
    ],
    exclusions: [
      'Elephant ride or Jeep ride to the top rampart (available on spot)',
      'Camera fee at ticket counter (if applicable)',
      'Hotel pickup & drop-off'
    ],
    meeting_point: 'Suraj Pol (Sun Gate) Ticket Window #2, Amber Fort, Jaipur. Guide will have your name placard.',
    description: 'Explore the grand 16th-century hill fortress of Amer with reserved entrance tickets. Discover the dazzling Sheesh Mahal (Mirror Palace) where thousands of mirrors reflect single candlelights, Sukh Niwas, and panoramic ramparts overlooking Maota Lake.'
  },
  {
    id: 12,
    title: 'Old Pink City Heritage Walking Tour & Bazaar Street Food Crawl',
    slug: 'old-pink-city-heritage-walking-street-food',
    category: 'cultural',
    city: 'Jaipur',
    country: 'India',
    location: 'Hawa Mahal Rd, Badi Choupad, Jaipur 302002',
    duration_minutes: 180,
    duration_text: '3h',
    price: 1299,
    original_price: 1800,
    discount_percent: 28,
    rating: 4.9,
    reviews_count: 640,
    primary_image: '/assets/images/categories/cat_cultural.jpg',
    secondary_images: [
      '/assets/images/dest_jaipur.jpg',
      '/assets/images/categories/cat_food.jpg',
      '/assets/images/col_weekend.jpg'
    ],
    company_name: 'Pink City Cultural Guild',
    badges: ['Top Rated', 'Food Included', 'Small Group'],
    highlights: [
      'Taste iconic Pyaz Kachori, creamy Lassi & Ghewar in Johari Bazaar',
      'Stroll through ancient artisan alleys and hidden Havelis',
      'Prime photography vantage point in front of Hawa Mahal',
      'Local culinary expert storyteller guide'
    ],
    inclusions: [
      '5+ authentic food tasting stops at heritage eateries',
      'Famous Lassiwala clay-pot sweet lassi',
      'Expert cultural storytelling host in English/Hindi',
      'Bottled mineral water'
    ],
    exclusions: [
      'Monument entry tickets',
      'Personal shopping purchases in bazaars',
      'Cab transfers to meeting point'
    ],
    meeting_point: 'Tattoo Cafe / Wind View Cafe entrance, directly opposite Hawa Mahal, Badi Choupad, Jaipur.',
    description: 'Immerse yourself in authentic vibrant culture on a guided walking tour through the pink sandstone bazaars, sampling centuries-old street delicacies and photographing iconic Rajput landmarks.'
  },
  {
    id: 13,
    title: 'Nahargarh Fort Sunset 4x4 Open Jeep Safari & Cycle Trail',
    slug: 'nahargarh-fort-sunset-jeep-safari',
    category: 'adventure',
    city: 'Jaipur',
    country: 'India',
    location: 'Nahargarh Fort Rd, Aravalli Hills, Jaipur 302002',
    duration_minutes: 210,
    duration_text: '3h 30m',
    price: 1850,
    original_price: 2500,
    discount_percent: 26,
    rating: 4.9,
    reviews_count: 510,
    primary_image: '/assets/images/exp_atv_biking.jpg',
    secondary_images: [
      '/assets/images/dest_jaipur.jpg',
      '/assets/images/exp_jeep_safari.jpg',
      '/assets/images/col_adventure.jpg'
    ],
    company_name: 'Aravalli Offroad Safaris',
    badges: ['Adventure Pick', 'Scenic Sunset', 'Tea Included'],
    highlights: [
      'Rugged 4x4 open Jeep drive across Aravalli hills ridges',
      'Breathtaking sunset vistas over the entire illuminated Pink City',
      'Complimentary evening tea & traditional Rajasthani snacks',
      'Pass by stepwells (Baori) where Rang De Basanti was filmed'
    ],
    inclusions: [
      'Open-top 4x4 modified safari Jeep with skilled mountain driver',
      'Guided stop at iconic Nahargarh Stepwell (Baori)',
      'Evening masala chai and local snacks at Padao viewpoint',
      'Nahargarh hill wildlife eco-entry fees'
    ],
    exclusions: [
      'Alcoholic drinks at Padao restaurant',
      'Wax museum entry tickets inside fort'
    ],
    meeting_point: 'Kanak Vrindavan Garden main parking gate, Amer Road, Jaipur.',
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
    secondary_images: [
      '/assets/images/categories/cat_sightseeing.jpg',
      '/assets/images/categories/cat_cultural.jpg',
      '/assets/images/col_family.jpg'
    ],
    company_name: 'Royal Rajasthan Travels',
    badges: ['Bestseller', 'AC Private Cab', 'Free Hotel Pickup'],
    highlights: [
      'Dedicated AC Sedan cab with courteous professional chauffeur',
      'Covers Amber Fort, Jal Mahal, City Palace, Jantar Mantar & Hawa Mahal',
      'Flexible customizable itinerary with door-to-door hotel pickup',
      'Complimentary mineral water and sanitizer onboard'
    ],
    inclusions: [
      'Private air-conditioned Sedan (Swift Dzire / Etios) for full day (8 hours)',
      'Hotel pickup and drop-off anywhere in Jaipur city limits',
      'Fuel, toll charges, parking fees, and driver allowances',
      'Stop at Jal Mahal photo vantage point & Patrika Gate'
    ],
    exclusions: [
      'Monument entrance tickets (composite ticket recommended)',
      'Meals, snacks, and personal tour guide hire at monuments'
    ],
    meeting_point: 'Doorstep pickup from your hotel, railway station, or airport in Jaipur at your chosen time.',
    description: 'Experience the ultimate full-day exploration of Jaipur UNESCO World Heritage monuments in an air-conditioned private vehicle with flexible timing and personalized hotel pickup.'
  },
  {
    id: 15,
    title: 'Chokhi Dhani Ethnic Village Cultural Evening, Folk Dance & Buffet Dinner',
    slug: 'chokhi-dhani-cultural-evening-buffet-dinner',
    category: 'cultural',
    city: 'Jaipur',
    country: 'India',
    location: '12 Miles, Tonk Road, Via Vatika, Jaipur 303905',
    duration_minutes: 240,
    duration_text: '4h',
    price: 3799,
    original_price: 4900,
    discount_percent: 22,
    rating: 4.7,
    reviews_count: 2150,
    primary_image: '/assets/images/categories/cat_sightseeing.jpg',
    secondary_images: [
      '/assets/images/dest_jaipur.jpg',
      '/assets/images/exp_candlelight_dinner.jpg',
      '/assets/images/col_family.jpg'
    ],
    company_name: 'Chokhi Dhani Hospitality',
    badges: ['Family Favorite', 'Royal Thali Buffet', 'Live Shows'],
    highlights: [
      'Grand Rajasthani royal thali vegetarian feast dinner',
      'Live Kalbelia folk dances, fire acrobatics & puppet theater',
      'Camel & bullock cart village rides, mehndi & palmistry',
      'Enchanting rural Rajasthani village architecture'
    ],
    inclusions: [
      'Admission entry ticket to Chokhi Dhani 5-Star Ethnic Resort',
      'Royal Rajasthani Multi-Course Thali dinner (unlimited servings)',
      'Access to all live cultural folk dances, fire shows, and puppet shows',
      '1 complimentary camel ride or bullock cart ride ticket per guest'
    ],
    exclusions: [
      'Alcoholic beverages and special imported drinks',
      'Transportation cab to Tonk Road (available as taxi add-on)'
    ],
    meeting_point: 'Chokhi Dhani Main Reception & Welcome Gate, 12 Miles, Tonk Road, Jaipur. Open from 05:00 PM onwards.',
    description: 'Step into a recreated traditional Rajasthani village fair with vibrant cultural folk performances, acrobats, camel rides, and an authentic royal multi-course Rajasthani dinner.'
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
    secondary_images: [
      '/assets/images/dest_dubai.jpg',
      '/assets/images/exp_jeep_safari.jpg'
    ],
    company_name: 'Arabian Adventures Co',
    badges: ['Bestseller', 'Free Cancellation', 'Buffet Dinner'],
    highlights: [
      'High-adrenaline 4x4 dune bashing across red desert dunes',
      '30-Min Quad Biking & Sandboarding included',
      'Belly dance, fire show, Tanoura & 5-star BBQ dinner'
    ],
    inclusions: [
      'Hotel pickup & drop-off in luxury 4x4 Land Cruiser',
      'Dune bashing in high red dunes (Lahbab)',
      'International BBQ buffet dinner with vegetarian & non-veg options',
      'Camel ride, henna painting, live belly dance & Tanoura show'
    ],
    exclusions: [
      'Alcoholic beverages',
      'VIP table waiter service (optional add-on)'
    ],
    meeting_point: 'Doorstep pickup from any hotel or residence in Dubai city.',
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
    secondary_images: [
      '/assets/images/categories/cat_sightseeing.jpg',
      '/assets/images/col_luxury.jpg'
    ],
    company_name: 'Emaar Tourism',
    badges: ['Iconic Landmark', 'Instant Confirmation'],
    highlights: [
      'World fastest double-deck elevators travel at 10m/sec',
      'Outdoor observation terrace overlooking Dubai Fountain',
      'High-powered telescopes for panoramic skyline views'
    ],
    inclusions: [
      'Reserved time-slot admission ticket to Levels 124 & 125',
      'Access to outdoor viewing telescope terrace',
      'Free high-speed Wi-Fi throughout observation deck'
    ],
    exclusions: [
      'Hotel transfers',
      'Access to Level 148 VIP lounge'
    ],
    meeting_point: 'Lower Ground Floor, Dubai Mall (At The Top entrance counter).',
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
    secondary_images: [
      '/assets/images/dest_goa.jpg',
      '/assets/images/categories/cat_water_sports.jpg'
    ],
    company_name: 'Goa Ocean Thrills',
    badges: ['Super Saver', 'Free Cancellation', 'Video Included'],
    highlights: [
      'PADI certified instructor guided underwater scuba dive',
      'Parasailing, Jet Ski, Banana, Bumper & Speed Boat ride',
      'Complimentary underwater HD video & photos'
    ],
    inclusions: [
      'Boat cruise to Grand Island with dolphin sighting',
      'Scuba diving with instructor and breathing apparatus',
      '5 Water sports: Parasailing, Jet Ski, Banana, Bumper & Speedboat',
      'Breakfast, buffet lunch, beers/soft drinks on boat'
    ],
    exclusions: [
      'Wet suit hire',
      'Hotel drop-off outside North Goa belt'
    ],
    meeting_point: 'Calangute / Baga beach pickup points at 07:30 AM.',
    description: 'Dive into crystal-clear waters with PADI certified dive instructors, followed by Parasailing, Jet Ski ride, Banana ride, Bumper ride, and Speedboat thrill ride.'
  }
];

function ActivityDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const { addToast } = useToast();

  const idOrSlug = params.id;
  const initialDate = searchParams.get('date') || '';

  // Local Activity State
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Booking Form State
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [bookingDate, setBookingDate] = useState(initialDate || tomorrow);
  const [selectedSlot, setSelectedSlot] = useState('09:00 AM (Morning Slot)');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Load Activity Data
  useEffect(() => {
    let isMounted = true;
    const fetchActivity = async () => {
      setLoading(true);
      try {
        // Try backend API first
        if (idOrSlug && !isNaN(idOrSlug)) {
          try {
            const res = await activitiesService.getActivityById(idOrSlug);
            if (isMounted && res.success && res.data) {
              const bData = res.data;
              const localMatch = ALL_ACTIVITIES.find(a =>
                a.id.toString() === idOrSlug?.toString() ||
                a.slug === idOrSlug
              );

              // Merge backend data with local catalog so no images or rich content are missing
              const merged = {
                ...(localMatch || {}),
                ...bData,
                primary_image: bData.primary_image || localMatch?.primary_image || '/assets/images/dest_jaipur.jpg',
                secondary_images: (Array.isArray(bData.secondary_images) && bData.secondary_images.length > 0)
                  ? bData.secondary_images
                  : (localMatch?.secondary_images || [
                      '/assets/images/dest_jaipur.jpg',
                      '/assets/images/categories/cat_cultural.jpg',
                      '/assets/images/categories/cat_sightseeing.jpg',
                      '/assets/images/exp_atv_biking.jpg',
                      '/assets/images/col_luxury.jpg'
                    ]),
                badges: bData.badges || localMatch?.badges || ['Instant Confirmation', 'Top Rated', 'Free Cancellation'],
                highlights: bData.highlights || localMatch?.highlights || [
                  'Skip-the-line Admission Access',
                  'Professional English-speaking Guide',
                  'Instant Mobile Confirmation Voucher'
                ],
                inclusions: bData.inclusions || localMatch?.inclusions || [
                  'Guaranteed admission ticket entry',
                  'Licensed expert tour host or guide',
                  'All local taxes & booking charges included'
                ],
                exclusions: bData.exclusions || localMatch?.exclusions || [
                  'Hotel transfers (unless option selected)',
                  'Personal meals, drinks & gratuities'
                ],
                meeting_point: bData.meeting_point || localMatch?.meeting_point || `${bData.location || bData.city}, Meeting Point`
              };

              setActivity(merged);
              setLoading(false);
              return;
            }
          } catch (_) {
            // Ignore backend error and fall back to local database
          }
        }

        // Match local catalog by ID or Slug
        const match = ALL_ACTIVITIES.find(a =>
          a.id.toString() === idOrSlug?.toString() ||
          a.slug === idOrSlug
        ) || ALL_ACTIVITIES.find(a => a.city.toLowerCase() === 'jaipur');

        if (isMounted) {
          setActivity(match || ALL_ACTIVITIES[0]);
        }
      } catch (err) {
        console.error('Failed to load activity details:', err);
        if (isMounted) {
          setActivity(ALL_ACTIVITIES[0]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchActivity();
    return () => { isMounted = false; };
  }, [idOrSlug]);

  // Price Calculations
  const adultPrice = activity?.price || 1499;
  const childPrice = Math.round(adultPrice * 0.65);
  const subtotal = (adultCount * adultPrice) + (childCount * childPrice);
  const platformDiscount = Math.round(subtotal * 0.05);
  const grandTotal = subtotal - platformDiscount;

  // Toggle Wishlist
  const handleToggleWishlist = () => {
    setIsWishlisted(prev => !prev);
    if (!isWishlisted) {
      addToast('Added to your Saved Wishlist ❤️', 'success');
    } else {
      addToast('Removed from wishlist', 'info');
    }
  };

  // Share Experience Link
  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard! 📋', 'success');
    }
  };

  // Handle Booking Submission
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      addToast('Please login to complete booking', 'info');
      return;
    }

    addToast(`🎉 Reservation confirmed for "${activity.title}" on ${bookingDate} for ₹${grandTotal.toLocaleString('en-IN')}! Check your email for voucher.`, 'success');
  };

  const galleryImages = useMemo(() => {
    const list = [];
    if (activity?.primary_image) {
      list.push(activity.primary_image);
    }
    if (Array.isArray(activity?.secondary_images)) {
      activity.secondary_images.forEach(img => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }

    const cityFallbacks = {
      jaipur: [
        '/assets/images/dest_jaipur.jpg',
        '/assets/images/categories/cat_cultural.jpg',
        '/assets/images/categories/cat_sightseeing.jpg',
        '/assets/images/exp_atv_biking.jpg',
        '/assets/images/col_luxury.jpg'
      ],
      dubai: [
        '/assets/images/dest_dubai.jpg',
        '/assets/images/exp_camel_safari.jpg',
        '/assets/images/exp_jeep_safari.jpg',
        '/assets/images/col_luxury.jpg',
        '/assets/images/categories/cat_sightseeing.jpg'
      ],
      goa: [
        '/assets/images/dest_goa.jpg',
        '/assets/images/exp_parasailing.jpg',
        '/assets/images/categories/cat_water_sports.jpg',
        '/assets/images/col_adventure.jpg',
        '/assets/images/categories/cat_sightseeing.jpg'
      ],
      manali: [
        '/assets/images/dest_manali.jpg',
        '/assets/images/exp_atv_biking.jpg',
        '/assets/images/categories/cat_adventure.jpg',
        '/assets/images/col_adventure.jpg',
        '/assets/images/dest_rishikesh.jpg'
      ],
      rishikesh: [
        '/assets/images/dest_rishikesh.jpg',
        '/assets/images/categories/cat_adventure.jpg',
        '/assets/images/categories/cat_spiritual.jpg',
        '/assets/images/col_adventure.jpg',
        '/assets/images/dest_manali.jpg'
      ],
      paris: [
        '/assets/images/categories/cat_sightseeing.jpg',
        '/assets/images/categories/cat_cultural.jpg',
        '/assets/images/categories/cat_romantic.jpg',
        '/assets/images/dest_dubai.jpg',
        '/assets/images/categories/cat_food.jpg'
      ]
    };

    const cKey = (activity?.city || 'jaipur').toLowerCase();
    const defaults = cityFallbacks[cKey] || [
      '/assets/images/dest_jaipur.jpg',
      '/assets/images/categories/cat_cultural.jpg',
      '/assets/images/categories/cat_sightseeing.jpg',
      '/assets/images/exp_atv_biking.jpg',
      '/assets/images/col_luxury.jpg'
    ];

    defaults.forEach(item => {
      if (list.length < 5 && !list.includes(item)) {
        list.push(item);
      }
    });

    while (list.length < 5) {
      list.push(list[0] || '/assets/images/dest_jaipur.jpg');
    }

    return list;
  }, [activity]);

  if (loading || !activity) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <Compass size={48} className="animate-spin" style={{ color: '#0D9488', marginBottom: '16px' }} />
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Loading Experience Details...</div>
      </div>
    );
  }

  return (
    <div className="act-detail-page">
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="act-nav-header">
        <div className="act-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/" className="act-brand-logo">
              <span className="act-logo-icon">
                <Compass size={22} />
              </span>
              <span>TRAVEL<span style={{ color: '#0D9488' }}>.</span></span>
            </Link>

            <nav className="act-nav-links">
              <Link href="/" className="act-nav-link">Home</Link>
              <Link href="/listing" className="act-nav-link active">Tours &amp; Attractions</Link>
              <Link href={`/listing?destination=${activity.city}`} className="act-nav-link">
                {activity.city} Tours
              </Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href={`/listing?destination=${activity.city}`}
              className="act-btn-back"
            >
              <ArrowLeft size={14} />
              <span>Back to {activity.city} Tours</span>
            </Link>

            {isAuthenticated ? (
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#D6F5EE' }}>
                👋 {user?.first_name || user?.email?.split('@')[0]}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                style={{
                  background: '#0D9488',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. BREADCRUMBS RIBBON */}
      <section className="act-breadcrumbs-ribbon">
        <div className="act-container">
          <div className="act-breadcrumbs">
            <Link href="/">Home</Link>
            <ChevronRight size={12} />
            <Link href="/listing">Tours &amp; Attractions</Link>
            <ChevronRight size={12} />
            <Link href={`/listing?destination=${activity.city}`}>{activity.city}</Link>
            <ChevronRight size={12} />
            <span className="act-breadcrumbs-current">{activity.title}</span>
          </div>
        </div>
      </section>

      {/* 3. HERO GALLERY & TITLE BLOCK */}
      <section className="act-hero-section">
        <div className="act-container">
          <div className="act-title-row">
            <div>
              <div className="act-category-badge">
                <Sparkles size={12} />
                <span>{activity.category?.replace('-', ' ')}</span>
              </div>
              <h1 className="act-title">{activity.title}</h1>
              <div className="act-meta-row">
                <span className="act-rating-pill">★ {activity.rating}</span>
                <span style={{ fontWeight: '750', color: '#0F172A' }}>Very Good</span>
                <span>({activity.reviews_count} verified traveler reviews)</span>
                <span>•</span>
                <span className="act-meta-item">
                  <MapPin size={14} style={{ color: '#0D9488' }} />
                  {activity.location || `${activity.city}, ${activity.country}`}
                </span>
                <span>•</span>
                <span className="act-meta-item">
                  <Clock size={14} style={{ color: '#333F70' }} />
                  Duration: {activity.duration_text}
                </span>
              </div>
            </div>

            <div className="act-actions-group">
              <button
                type="button"
                onClick={handleShare}
                className="act-btn-action"
                title="Share this experience"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`act-btn-action ${isWishlisted ? 'active' : ''}`}
                title="Save to wishlist"
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* MAKEMYTRIP 5-IMAGE PHOTO COLLAGE */}
          <div className="act-gallery-grid">
            {/* 1. Large Main Hero Image (Spans 2 rows on the left) */}
            <div className="act-gallery-main">
              <img
                src={galleryImages[0] || '/assets/images/dest_jaipur.jpg'}
                alt={activity.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/dest_jaipur.jpg';
                }}
              />
            </div>

            {/* 2. Top-Center Tile */}
            <div className="act-gallery-cell">
              <img
                src={galleryImages[1] || '/assets/images/categories/cat_cultural.jpg'}
                alt={`${activity.title} view 2`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/categories/cat_cultural.jpg';
                }}
              />
            </div>

            {/* 3. Top-Right Tile */}
            <div className="act-gallery-cell">
              <img
                src={galleryImages[2] || '/assets/images/categories/cat_sightseeing.jpg'}
                alt={`${activity.title} view 3`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/categories/cat_sightseeing.jpg';
                }}
              />
            </div>

            {/* 4. Bottom-Center Tile */}
            <div className="act-gallery-cell">
              <img
                src={galleryImages[3] || '/assets/images/exp_atv_biking.jpg'}
                alt={`${activity.title} view 4`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/exp_atv_biking.jpg';
                }}
              />
            </div>

            {/* 5. Bottom-Right Tile with View All Overlay Button */}
            <div className="act-gallery-cell act-gallery-last">
              <img
                src={galleryImages[4] || '/assets/images/col_luxury.jpg'}
                alt={`${activity.title} view 5`}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/images/col_luxury.jpg';
                }}
              />
              <button
                type="button"
                onClick={handleShare}
                className="act-gallery-view-all"
                title="View all photos"
              >
                <Eye size={15} />
                <span>View All 18 Photos</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN TWO-COLUMN CONTENT & BOOKING SECTION */}
      <section className="act-container">
        <div className="act-main-layout">

          {/* ========================================================================= */}
          {/* LEFT COLUMN: DETAILED EXPERIENCE GUIDE */}
          {/* ========================================================================= */}
          <div className="act-left-content">

            {/* STICKY NAVIGATION TABS */}
            <div className="act-sticky-tabs">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'highlights', label: 'Highlights' },
                { id: 'inclusions', label: 'Inclusions & Exclusions' },
                { id: 'itinerary', label: 'What to Expect' },
                { id: 'meeting', label: 'Meeting Point' },
                { id: 'reviews', label: 'Traveler Reviews' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    const el = document.getElementById(`section-${tab.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`act-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 1. KEY HIGHLIGHTS BOX */}
            <div id="section-highlights" className="act-card-section">
              <div className="act-card-header">
                <Sparkles size={20} style={{ color: '#0D9488' }} />
                <h3 className="act-card-title">Activity Highlights</h3>
              </div>
              <div className="act-highlights-grid">
                {(activity.highlights || [
                  'Skip the long general ticket queues with fast-track entry',
                  'Professional licensed English & Hindi speaking tour guide',
                  '100% Mobile voucher accepted - no printing necessary',
                  'Flexible cancellation available up to 24 hours before activity'
                ]).map((h, i) => (
                  <div key={i} className="act-highlight-item">
                    <div className="act-highlight-icon">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. OVERVIEW DESCRIPTION */}
            <div id="section-overview" className="act-card-section">
              <div className="act-card-header">
                <Info size={20} style={{ color: '#333F70' }} />
                <h3 className="act-card-title">Experience Overview</h3>
              </div>
              <p className="act-card-desc">
                {activity.description}
              </p>
              <p className="act-card-desc">
                Discover the rich history, vibrant colors, and architectural brilliance of {activity.city} with this curated tour experience. Designed to ensure hassle-free admission and immersive storytelling, this experience offers memorable photo opportunities and cultural insights led by local destination specialists.
              </p>
            </div>

            {/* 3. INCLUSIONS & EXCLUSIONS */}
            <div id="section-inclusions" className="act-card-section">
              <div className="act-card-header">
                <ShieldCheck size={20} style={{ color: '#10B981' }} />
                <h3 className="act-card-title">Inclusions &amp; Exclusions</h3>
              </div>
              <div className="act-inc-exc-grid">
                <div className="act-inc-box">
                  <div className="act-inc-title">
                    <CheckCircle2 size={18} />
                    <span>What is Included</span>
                  </div>
                  <ul className="act-inc-list">
                    {(activity.inclusions || [
                      'Guaranteed admission ticket entry',
                      'Professional certified tour guide',
                      'All local taxes and booking fees included',
                      'Complimentary digital route map and itinerary guide'
                    ]).map((inc, i) => (
                      <li key={i} className="act-inc-item">
                        <Check size={14} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="act-exc-box">
                  <div className="act-exc-title">
                    <X size={18} />
                    <span>What is Excluded</span>
                  </div>
                  <ul className="act-inc-list">
                    {(activity.exclusions || [
                      'Hotel pickup and drop-off (unless selected as add-on)',
                      'Personal souvenir shopping & food expenses',
                      'Gratuities / tips for guide or driver'
                    ]).map((exc, i) => (
                      <li key={i} className="act-exc-item">
                        <X size={14} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. ITINERARY / WHAT TO EXPECT */}
            <div id="section-itinerary" className="act-card-section">
              <div className="act-card-header">
                <Clock size={20} style={{ color: '#333F70' }} />
                <h3 className="act-card-title">What to Expect &amp; Itinerary</h3>
              </div>
              <div className="act-itinerary-timeline">
                <div className="act-itinerary-step">
                  <div className="act-itinerary-dot">1</div>
                  <div className="act-itinerary-header">Arrival &amp; Quick Check-In</div>
                  <div className="act-itinerary-meta">Duration: 15 Minutes</div>
                  <p className="act-itinerary-text">
                    Meet your tour host at the designated meeting point. Present your mobile voucher for immediate verification and receive your skip-the-line entrance pass.
                  </p>
                </div>

                <div className="act-itinerary-step">
                  <div className="act-itinerary-dot">2</div>
                  <div className="act-itinerary-header">Guided Monument Exploration</div>
                  <div className="act-itinerary-meta">Duration: ~1.5 Hours</div>
                  <p className="act-itinerary-text">
                    Walk through the primary courtyards, historical halls, and iconic viewpoints. Listen to fascinating anecdotes about Rajput royalty, battle strategies, and intricate architecture.
                  </p>
                </div>

                <div className="act-itinerary-step">
                  <div className="act-itinerary-dot">3</div>
                  <div className="act-itinerary-header">Photography &amp; Leisure Time</div>
                  <div className="act-itinerary-meta">Duration: 45 Minutes</div>
                  <p className="act-itinerary-text">
                    Capture panoramic photos overlooking the city skyline, browse local artisan stalls, or enjoy traditional refreshments before concluding the tour.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. MEETING POINT */}
            <div id="section-meeting" className="act-card-section">
              <div className="act-card-header">
                <MapPin size={20} style={{ color: '#0D9488' }} />
                <h3 className="act-card-title">Meeting Point &amp; Directions</h3>
              </div>
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                  📍 {activity.meeting_point || activity.location || `${activity.city}, Rajasthan`}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  Please arrive 15 minutes prior to the scheduled departure time. Look out for the travel representative holding the TRAVEL placard.
                </div>
              </div>

              {/* Verified Operator Box */}
              <div className="act-operator-box">
                <div className="act-operator-icon">
                  <Building size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>
                    Certified Local Operator
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '850', color: '#0F172A' }}>
                    {activity.company_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                    ✓ 100% Verified License &amp; Safety Insured
                  </div>
                </div>
              </div>
            </div>

            {/* 6. TRAVELER REVIEWS */}
            <div id="section-reviews" className="act-card-section">
              <div className="act-card-header">
                <Star size={20} style={{ color: '#EAB308' }} />
                <h3 className="act-card-title">Traveler Ratings &amp; Reviews</h3>
              </div>

              <div className="act-reviews-summary-row">
                <div className="act-score-big">
                  <div className="act-score-number">{activity.rating}</div>
                  <div className="act-score-stars">★★★★★</div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#166534' }}>
                    Based on {activity.reviews_count} Reviews
                  </div>
                </div>

                <div className="act-review-bars">
                  {[
                    { label: 'Guide & Host Experience', pct: '96%' },
                    { label: 'Value for Money', pct: '92%' },
                    { label: 'Ease of Booking & Entry', pct: '98%' },
                    { label: 'Safety & Punctuality', pct: '95%' }
                  ].map((bar, i) => (
                    <div key={i} className="act-bar-row">
                      <span style={{ width: '170px' }}>{bar.label}</span>
                      <div className="act-bar-track">
                        <div className="act-bar-fill" style={{ width: bar.pct }}></div>
                      </div>
                      <span style={{ width: '38px', textAlign: 'right' }}>{bar.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Verified Reviews */}
              {[
                {
                  name: 'Pooja Verma',
                  date: 'September 2026',
                  rating: 5,
                  comment: `Superb experience in ${activity.city}! Skip-the-line worked like a charm and saved us almost an hour under the sun. Our guide explained the intricate history brilliantly.`
                },
                {
                  name: 'Rahul Singhania',
                  date: 'August 2026',
                  rating: 5,
                  comment: `Booking through this platform was seamless. The instant mobile voucher was accepted immediately. Highly recommended for family travelers!`
                },
                {
                  name: 'David Miller',
                  date: 'July 2026',
                  rating: 4.8,
                  comment: `One of the best excursions we did in India. Professional coordination and prompt support. The views were breathtaking!`
                }
              ].map((rev, idx) => (
                <div key={idx} className="act-review-item">
                  <div className="act-review-header">
                    <div>
                      <div className="act-review-author">{rev.name}</div>
                      <div className="act-review-date">{rev.date} • Verified Booking</div>
                    </div>
                    <div style={{ color: '#EAB308', fontSize: '13px', fontWeight: '800' }}>
                      ★ {rev.rating}.0
                    </div>
                  </div>
                  <p className="act-review-comment">{rev.comment}</p>
                </div>
              ))}
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: STICKY BOOKING RESERVATION WIDGET */}
          {/* ========================================================================= */}
          <aside className="act-right-sidebar">
            <div className="act-booking-widget">

              {/* Price Banner */}
              <div className="act-price-banner">
                <div className="act-price-from">Price starting from</div>
                <div className="act-price-digits-row">
                  <span className="act-price-main">₹{adultPrice.toLocaleString('en-IN')}</span>
                  {activity.original_price && (
                    <span className="act-price-original">
                      ₹{activity.original_price.toLocaleString('en-IN')}
                    </span>
                  )}
                  {activity.discount_percent > 0 && (
                    <span className="act-discount-tag">
                      {activity.discount_percent}% OFF
                    </span>
                  )}
                </div>
                <div className="act-price-subtext">
                  Per person • Taxes and monument charges included
                </div>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBookingSubmit}>
                {/* 1. Date Picker */}
                <div className="act-form-field">
                  <label className="act-form-label">Select Date</label>
                  <div className="act-form-input-wrap">
                    <Calendar size={18} style={{ color: '#333F70', marginRight: '10px' }} />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="act-form-input"
                    />
                  </div>
                </div>

                {/* 2. Slot Picker */}
                <div className="act-form-field">
                  <label className="act-form-label">Select Preferred Time Slot</label>
                  <div className="act-slots-grid">
                    {[
                      '09:00 AM (Morning Slot)',
                      '01:30 PM (Afternoon Slot)',
                      '04:30 PM (Sunset Golden Hour)'
                    ].map((slot, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`act-slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                      >
                        <span>{slot}</span>
                        {selectedSlot === slot && <Check size={14} style={{ color: '#333F70' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Ticket / Guest Counter */}
                <div className="act-form-field">
                  <label className="act-form-label">Select Tickets / Guests</label>

                  {/* Adults */}
                  <div className="act-guest-row">
                    <div className="act-guest-info">
                      <span className="act-guest-name">Adult (Age 12+)</span>
                      <span className="act-guest-price">₹{adultPrice.toLocaleString('en-IN')} each</span>
                    </div>
                    <div className="act-counter-controls">
                      <button
                        type="button"
                        onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                        disabled={adultCount <= 1}
                        className="act-btn-counter"
                      >
                        -
                      </button>
                      <span className="act-counter-num">{adultCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultCount(prev => prev + 1)}
                        className="act-btn-counter"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="act-guest-row">
                    <div className="act-guest-info">
                      <span className="act-guest-name">Child (Age 4 - 11)</span>
                      <span className="act-guest-price">₹{childPrice.toLocaleString('en-IN')} each (35% OFF)</span>
                    </div>
                    <div className="act-counter-controls">
                      <button
                        type="button"
                        onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                        disabled={childCount <= 0}
                        className="act-btn-counter"
                      >
                        -
                      </button>
                      <span className="act-counter-num">{childCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildCount(prev => prev + 1)}
                        className="act-btn-counter"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Summary Breakdown */}
                <div className="act-total-breakdown">
                  <div className="act-breakdown-row">
                    <span>Tickets Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="act-breakdown-row" style={{ color: '#16A34A' }}>
                    <span>Special Online Discount</span>
                    <span>-₹{platformDiscount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="act-breakdown-row total">
                    <span>Total Amount</span>
                    <span style={{ color: '#0D9488' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Primary Booking Button */}
                <button
                  type="submit"
                  className="act-btn-book"
                >
                  <Lock size={16} />
                  <span>PROCEED TO BOOK • ₹{grandTotal.toLocaleString('en-IN')}</span>
                </button>
              </form>

              {/* Trust Badges */}
              <div className="act-trust-badge-row">
                <div className="act-trust-pill">
                  <CheckCircle2 size={15} style={{ color: '#0D9488', flexShrink: 0 }} />
                  <span>⚡ Instant Booking Confirmation &amp; QR Voucher</span>
                </div>
                <div className="act-trust-pill">
                  <ShieldCheck size={15} style={{ color: '#059669', flexShrink: 0 }} />
                  <span>🛡️ Free Cancellation up to 24 hours in advance</span>
                </div>
                <div className="act-trust-pill">
                  <Lock size={15} style={{ color: '#333F70', flexShrink: 0 }} />
                  <span>🔒 256-Bit SSL Encrypted &amp; Secure Payment</span>
                </div>
              </div>

              {/* Need Assistance Pill */}
              <div style={{ marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={15} style={{ color: '#0D9488', flexShrink: 0 }} />
                <span>Need booking support? Call <strong>+91 1800-2026-TOUR</strong></span>
              </div>

            </div>
          </aside>

        </div>
      </section>

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

export default function ActivityDetailPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
          <div style={{ textAlign: 'center', color: '#64748B', fontWeight: '800' }}>
            Loading Activity...
          </div>
        </div>
      }
    >
      <ActivityDetailContent />
    </Suspense>
  );
}
