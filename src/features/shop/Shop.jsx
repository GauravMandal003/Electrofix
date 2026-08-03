// Shop.jsx - Master Orchestrator for the ElectroFix Shop Module
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, ShoppingBag, Grid, ShieldCheck, ArrowRight, Star, Search, X, Flame, History, Trash2, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, Check, Wrench, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import sub-views
import { INITIAL_PRODUCTS, CATEGORIES, BRANDS, getFallbackProductImage } from '../../utils/shopData';
import ShopHome from './ShopHome';
import ProductDetails from './ProductDetails';
import CartView from './CartView';
import CheckoutView from './CheckoutView';
import OrderSuccessView from './OrderSuccessView';
import MyOrdersView from './MyOrdersView';
import LoginRequiredView from './LoginRequiredView';
import WishlistView from './WishlistView';

// Helper to enrich products with modelNumber, sparePartName, and guaranteed high quality images
const enrichProduct = (p) => {
  const brandShort = (p.brand || 'EF').substring(0, 3).toUpperCase();
  const idUpper = (p.id || '').toUpperCase();
  const modelNumber = p.modelNumber || `EF-${brandShort}-${idUpper}-2026`;
  const sparePartName = p.category === "Genuine Spare Parts" ? p.name : "";
  const fallbackImg = getFallbackProductImage(p.category, p.name);
  const image = (p.image && typeof p.image === 'string' && p.image.trim() !== '') 
    ? p.image 
    : fallbackImg;
  const gallery = (Array.isArray(p.gallery) && p.gallery.length > 0)
    ? p.gallery.map(g => (g && typeof g === 'string' && g.trim() !== '') ? g : image)
    : [image];
  return { ...p, modelNumber, sparePartName, image, gallery };
};

const TRENDING_SEARCHES = [
  "PCB Motherboard",
  "FrostVortex AC",
  "Washing Machine Motor",
  "Smart Touch Switch",
  "Copper Wire",
  "Smart LED Bulb"
];

const SYNTHETIC_PRODUCTS = [
  {
    id: "synth-sam-1",
    name: "Samsung 55\" Crystal 4K Ultra HD Smart TV",
    brand: "Samsung",
    category: "Televisions",
    price: 649,
    originalPrice: 799,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=500&q=80",
    description: "Experience vibrant lifelike colors and smart home connectivity with Samsung's Crystal Processor 4K technology.",
    rating: 4.8,
    reviews: [ { id: 1, name: "Gaurav M.", rating: 5, comment: "Crisp and clear screen, perfect integration!" } ],
    specs: { "Resolution": "4K Ultra HD", "Refresh Rate": "60 Hz", "Smart Platform": "Tizen OS" },
    features: ["Crystal Processor 4K", "Smart TV with Alexa Built-in", "HDR10+ support"],
    stock: 5,
    newest: true,
    popularity: 98
  },
  {
    id: "synth-sam-2",
    name: "Samsung 345L Convertible Double-Door Refrigerator",
    brand: "Samsung",
    category: "Refrigerators",
    price: 799,
    originalPrice: 949,
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80",
    description: "Convertible 5-in-1 digital inverter refrigerator with twin cooling plus technology for ultimate freshness.",
    rating: 4.7,
    reviews: [ { id: 1, name: "Sarah L.", rating: 4, comment: "Very quiet compressor and great storage size!" } ],
    specs: { "Capacity": "345 Liters", "Defrost Type": "Frost Free", "Convertible": "Yes, 5-in-1" },
    features: ["Twin Cooling Plus", "Digital Inverter Technology", "Convertible Freezer"],
    stock: 3,
    newest: false,
    popularity: 92
  },
  {
    id: "synth-sam-3",
    name: "Samsung 8.0 Kg AI EcoBubble Front Load Washing Machine",
    brand: "Samsung",
    category: "Washing Machines",
    price: 529,
    originalPrice: 659,
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=500&q=80",
    description: "AI-powered front loader with EcoBubble technology and hygiene steam cycles to clean fabrics deeply and gently.",
    rating: 4.9,
    reviews: [ { id: 1, name: "David K.", rating: 5, comment: "Fabulous washing machine! Very efficient." } ],
    specs: { "Capacity": "8.0 Kg", "Spin Speed": "1400 RPM", "Tech": "EcoBubble" },
    features: ["AI Control", "EcoBubble Technology", "Hygiene Steam Cycle"],
    stock: 4,
    newest: true,
    popularity: 97
  },
  {
    id: "synth-sam-4",
    name: "Samsung Genuine Inverter AC PCB Motherboard",
    brand: "Samsung",
    category: "Genuine Spare Parts",
    price: 119,
    originalPrice: 149,
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=80",
    description: "Certified replacement inverter board PCB for Samsung split air conditioners. Essential for control loop and compressor regulation.",
    rating: 4.6,
    reviews: [ { id: 1, name: "Technician John", rating: 5, comment: "Genuine parts always fit perfectly and solve code errors." } ],
    specs: { "Part Type": "Main Control PCB Board", "Compatibility": "Samsung Inverter ACs", "Warranty": "6 Months" },
    features: ["OEM Certified Parts", "Pre-programmed microcontrollers", "Flame retardant circuit board"],
    stock: 12,
    newest: false,
    popularity: 88
  },
  {
    id: "synth-sam-5",
    name: "Samsung Refrigerator Door Seal Gasket",
    brand: "Samsung",
    category: "Genuine Spare Parts",
    price: 24,
    originalPrice: 35,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    description: "Replacement magnetic door gasket for Samsung refrigerators. Restores airtight insulation and reduces energy loss.",
    rating: 4.5,
    reviews: [],
    specs: { "Part Type": "Door Gasket", "Compatibility": "Samsung Refrigerator", "Material": "Flexible PVC & Magnets" },
    features: ["Perfect airtight compression", "Easy slide-in install", "Mildew resistant magnetic strip"],
    stock: 15,
    newest: false,
    popularity: 75
  },
  {
    id: "synth-fan-1",
    name: "WindControl AeroTech 1200mm Ceiling Fan",
    brand: "WindControl",
    category: "Ceiling Fans",
    price: 69,
    originalPrice: 89,
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=500&q=80",
    description: "Premium high-speed fan with aerodynamic blades, silent copper motor, and a sleek matte finish.",
    rating: 4.8,
    reviews: [],
    specs: { "Blade Sweep": "1200 mm", "Power Consumption": "50W", "Speed": "380 RPM" },
    features: ["Aero Blade tech", "100% Copper Motor", "Super quiet air delivery"],
    stock: 10,
    newest: true,
    popularity: 91
  },
  {
    id: "synth-fan-2",
    name: "WindControl Table Breeze Oscillation Fan",
    brand: "WindControl",
    category: "Ceiling Fans",
    price: 49,
    originalPrice: 65,
    image: "https://images.unsplash.com/photo-1618944847023-38aa001235f0?auto=format&fit=crop&w=500&q=80",
    description: "Compact desktop fan with wider coverage, low noise, and three distinct speed settings.",
    rating: 4.5,
    reviews: [],
    specs: { "Type": "Table Fan", "Speeds": "3-Speed Selection", "Blade Count": "3-Leaf" },
    features: ["Wide angle swing", "Finger-safe grille", "Portable design"],
    stock: 8,
    newest: false,
    popularity: 84
  },
  {
    id: "synth-fan-3",
    name: "VoltGuard Heavy Duty Fan Capacitor 2.5uF",
    brand: "VoltGuard",
    category: "Genuine Spare Parts",
    price: 9,
    originalPrice: 15,
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=500&q=80",
    description: "Premium high-reliability start/run capacitor for ceiling fans and table fans. Restores full rotational speed.",
    rating: 4.9,
    reviews: [],
    specs: { "Capacitance": "2.5 uF", "Voltage rating": "440V AC", "Frequency": "50/60 Hz" },
    features: ["Metalized polypropylene film", "Leak proof sealing", "Instant startup speed boost"],
    stock: 35,
    newest: false,
    popularity: 94
  },
  {
    id: "synth-fan-4",
    name: "WindControl Replacement Ceiling Fan Motor",
    brand: "WindControl",
    category: "Genuine Spare Parts",
    price: 35,
    originalPrice: 49,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
    description: "Heavy-duty 100% pure copper motor stator replacement for 1200mm/1400mm ceiling fans.",
    rating: 4.6,
    reviews: [],
    specs: { "Motor Type": "AC Induction Motor", "Winding": "Dual-row copper wire", "Warranty": "1 Year" },
    features: ["Double ball bearings", "Low temperature rise", "Extremely long lifetime"],
    stock: 14,
    newest: false,
    popularity: 82
  },
  {
    id: "synth-fan-5",
    name: "Apex 5-Speed Step Fan Regulator",
    brand: "ApexWire",
    category: "Wiring Accessories",
    price: 15,
    originalPrice: 22,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80",
    description: "Modular 5-speed hum-free step rotary regulator for ceiling fans. Fits standard electrical switch plates.",
    rating: 4.7,
    reviews: [],
    specs: { "Regulator Type": "Hum-free Electronic Step", "Modules": "1-Module", "Max Load": "100W" },
    features: ["Hum-free capacitor technology", "Crisp mechanical click steps", "Aesthetic glossy finish"],
    stock: 20,
    newest: false,
    popularity: 89
  },
  {
    id: "synth-lg-1",
    name: "LG Smart Inverter 1.5 Ton Split AC",
    brand: "LG",
    category: "Air Conditioners",
    price: 489,
    originalPrice: 629,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80",
    description: "LG Dual Cool AC with active energy control, HD air filter, and quiet operation.",
    rating: 4.8,
    reviews: [],
    specs: { "Capacity": "1.5 Ton", "Star Rating": "5 Star" },
    features: ["Dual Rotatory Compressor", "Super Convertible 5-in-1", "Auto Clean evaps"],
    stock: 7,
    newest: true,
    popularity: 96
  },
  {
    id: "synth-sony-1",
    name: "Sony Bravia 65-Inch 4K UHD LED TV",
    brand: "Sony",
    category: "Televisions",
    price: 899,
    originalPrice: 1099,
    image: "https://images.unsplash.com/photo-1552975084-6e027cd345c2?auto=format&fit=crop&w=500&q=80",
    description: "Bring theater quality home with Sony Bravia. Dynamic contrast booster, HDR processing, and rich sound.",
    rating: 4.9,
    reviews: [],
    specs: { "Size": "65 Inch", "Processor": "X1 4K HDR Processor" },
    features: ["Triluminos Pro Color Display", "Google TV platform", "Dolby Audio Integration"],
    stock: 2,
    newest: false,
    popularity: 99
  }
];

const highlightMatch = (text, query) => {
  if (!text || typeof text !== 'string') return <span>{text || ''}</span>;
  if (!query || !query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-yellow-100 text-slate-900 font-bold px-0.5 rounded">{part}</mark> 
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default function Shop() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Unified persistent State hooks
  const [products, setProducts] = useState(() => {
    const local = localStorage.getItem('ef_products');
    return local ? JSON.parse(local) : INITIAL_PRODUCTS;
  });

  const [selectedProduct, setSelectedProduct] = useState(() => {
    if (id) {
      const allList = [...(localStorage.getItem('ef_products') ? JSON.parse(localStorage.getItem('ef_products')) : INITIAL_PRODUCTS), ...SYNTHETIC_PRODUCTS];
      return allList.find(p => p.id === id) || null;
    }
    return null;
  });

  // Core Views: 'home' | 'details' | 'cart' | 'checkout' | 'success' | 'orders' | 'wishlist' | 'login-required'
  const location = useLocation();
  const getRouteView = (pathname, idParam) => {
    if (idParam || pathname.startsWith('/products/') || pathname.includes('/products/')) {
      return 'details';
    }
    if (pathname === '/shop/cart') return 'cart';
    if (pathname === '/shop/orders') return 'orders';
    if (pathname === '/shop/checkout') return 'checkout';
    if (pathname === '/shop/success') return 'success';
    if (pathname === '/shop/wishlist') return 'wishlist';
    if (pathname === '/shop/login-required') return 'login-required';
    return 'home';
  };
  const view = getRouteView(location.pathname, id);

  // Redefine setView to route to appropriate paths instead of setting local state
  const setView = (newView, targetId = null) => {
    if (newView === 'details') {
      const pid = targetId || selectedProduct?.id || id;
      if (pid) {
        navigate(`/products/${pid}`);
      } else {
        navigate('/shop');
      }
    } else if (newView === 'home') {
      navigate('/shop');
    } else if (newView === 'cart') {
      navigate('/shop/cart');
    } else if (newView === 'orders') {
      navigate('/shop/orders');
    } else if (newView === 'checkout') {
      navigate('/shop/checkout');
    } else if (newView === 'success') {
      navigate('/shop/success');
    } else if (newView === 'wishlist') {
      navigate('/shop/wishlist');
    } else if (newView === 'login-required') {
      navigate('/shop/login-required');
    } else {
      navigate('/shop');
    }
  };

  // Keep selectedProduct state synchronized with the route id parameter
  useEffect(() => {
    if (id) {
      const allList = [...products, ...SYNTHETIC_PRODUCTS];
      const match = allList.find(p => p.id === id);
      if (match) {
        setSelectedProduct(match);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
  }, [id, products]);

  const [cart, setCart] = useState(() => {
    const local = localStorage.getItem('ef_cart');
    return local ? JSON.parse(local) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const local = localStorage.getItem('ef_wishlist');
    return local ? JSON.parse(local) : [];
  });

  const [orders, setOrders] = useState(() => {
    const local = localStorage.getItem('ef_orders');
    return local ? JSON.parse(local) : [];
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [ordersFetchTrigger, setOrdersFetchTrigger] = useState(0);

  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const local = localStorage.getItem('ef_recently_viewed');
    return local ? JSON.parse(local) : [];
  });

  const [appliedPromo, setAppliedPromo] = useState('');
  const [recentlyPlacedOrder, setRecentlyPlacedOrder] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [isBuyNowFlow, setIsBuyNowFlow] = useState(false);

  // Cart click lock, loading status, and toast notification states
  const [pendingAdds, setPendingAdds] = useState({});
  const lastClickTimeRef = useRef(0);
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'info' | 'error' }

  // Auto-clear toast notification after 3.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync state on global logout event
  useEffect(() => {
    const handleLogoutEvent = () => {
      setCart([]);
      setWishlist([]);
      setOrders([]);
      setRecentlyViewed([]);
      setView('home');
    };
    window.addEventListener('ef_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('ef_logout', handleLogoutEvent);
    };
  }, []);

  // Protected views check
  useEffect(() => {
    const isLoggedOut = !localStorage.getItem('ef_auth_user') || localStorage.getItem('ef_logged_out') === 'true';
    if (isLoggedOut && (view === 'checkout' || view === 'orders' || view === 'wishlist')) {
      setView('login-required');
    }
  }, [view]);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => {
    const local = localStorage.getItem('ef_recent_searches');
    return local ? JSON.parse(local) : ["Inverter AC", "PCB Motherboard", "Smart Switch", "9W LED Bulb"];
  });

  const searchContainerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ef_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const addRecentSearch = (query) => {
    if (!query || !query.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== query.toLowerCase().trim());
      return [query.trim(), ...filtered].slice(0, 6);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeRecentSearchItem = (e, itemToRemove) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((s) => s !== itemToRemove));
  };

  const handleSearchSubmit = (queryStr) => {
    const q = (queryStr !== undefined ? queryStr : searchQuery).trim();
    setSearchQuery(q);
    if (q) {
      addRecentSearch(q);
    }
    setShowSuggestions(false);
    setActiveIndex(-1);
    setView('home');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleProductSuggestionClick = (product) => {
    setSelectedProduct(product);
    // Add to recently viewed
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
    setShowSuggestions(false);
    setActiveIndex(-1);
    setView('details', product.id);
  };

  const handleSelectSuggestion = (item) => {
    if (item.type === 'product' || item.type === 'sparePart') {
      handleProductSuggestionClick(item.value);
    } else if (item.type === 'category') {
      handleSearchSubmit(item.value);
    } else if (item.type === 'trending' || item.type === 'query') {
      handleSearchSubmit(item.value);
    }
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  // Autocomplete computation
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingCategories = trimmedQuery
    ? CATEGORIES.filter(cat => cat.toLowerCase().includes(trimmedQuery)).slice(0, 3)
    : [];

  const allAvailableProducts = [...products, ...SYNTHETIC_PRODUCTS].map(enrichProduct);

  const matchingProducts = trimmedQuery
    ? allAvailableProducts.filter(p => {
        const matchesName = p.name.toLowerCase().includes(trimmedQuery);
        const matchesBrand = p.brand.toLowerCase().includes(trimmedQuery);
        const matchesCategory = p.category.toLowerCase().includes(trimmedQuery);
        const matchesModel = p.modelNumber.toLowerCase().includes(trimmedQuery);
        const matchesSpare = p.sparePartName && p.sparePartName.toLowerCase().includes(trimmedQuery);
        const matchesDesc = p.description && p.description.toLowerCase().includes(trimmedQuery);
        return matchesName || matchesBrand || matchesCategory || matchesModel || matchesSpare || matchesDesc;
      }).slice(0, 5)
    : [];

  const matchingSpareParts = trimmedQuery
    ? allAvailableProducts.filter(p => {
        const isSparePartCat = p.category === "Genuine Spare Parts";
        const matchesQuery = p.name.toLowerCase().includes(trimmedQuery) ||
                             p.brand.toLowerCase().includes(trimmedQuery) ||
                             trimmedQuery.includes("spare") ||
                             trimmedQuery.includes("part");
        return isSparePartCat && matchesQuery;
      }).slice(0, 4)
    : [];

  const popularKeywords = [
    "Samsung Smart TV", "Samsung Refrigerator", "Samsung Washing Machine", "Samsung Spare Parts",
    "Ceiling Fan", "Table Fan", "Fan Capacitor", "Fan Motor", "Fan Regulator",
    "PCB Motherboard", "FrostVortex AC", "Copper Wire", "Smart LED Bulb", "Washing Machine Motor"
  ];

  const matchingTrending = trimmedQuery
    ? popularKeywords.filter(k => k.toLowerCase().includes(trimmedQuery) && k.toLowerCase() !== trimmedQuery).slice(0, 4)
    : TRENDING_SEARCHES;

  // Build the flat index list for clean, index-based keyboard/mouse interaction
  let currentFlatIndex = 0;
  const flatItems = [];

  if (trimmedQuery) {
    flatItems.push({
      id: 'query-term',
      type: 'query',
      value: searchQuery,
      label: `Search for "${searchQuery}"`,
      icon: 'search',
      index: currentFlatIndex++
    });
  }

  const categoriesWithIndex = matchingCategories.map(cat => ({
    id: `cat-${cat}`,
    type: 'category',
    value: cat,
    label: cat,
    icon: 'grid',
    index: currentFlatIndex++
  }));
  categoriesWithIndex.forEach(item => flatItems.push(item));

  const addedProdIds = new Set();
  const sparesWithIndex = [];
  matchingSpareParts.forEach(p => {
    if (!addedProdIds.has(p.id)) {
      addedProdIds.add(p.id);
      const item = {
        id: `spare-${p.id}`,
        type: 'sparePart',
        value: p,
        label: p.name,
        icon: 'wrench',
        index: currentFlatIndex++
      };
      sparesWithIndex.push(item);
      flatItems.push(item);
    }
  });

  const prodsWithIndex = [];
  matchingProducts.forEach(p => {
    if (!addedProdIds.has(p.id)) {
      addedProdIds.add(p.id);
      const item = {
        id: `prod-${p.id}`,
        type: 'product',
        value: p,
        label: p.name,
        icon: 'box',
        index: currentFlatIndex++
      };
      prodsWithIndex.push(item);
      flatItems.push(item);
    }
  });

  const trendingWithIndex = matchingTrending.map(item => ({
    id: `trend-${item}`,
    type: 'trending',
    value: item,
    label: item,
    icon: 'flame',
    index: currentFlatIndex++
  }));
  trendingWithIndex.forEach(item => flatItems.push(item));

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('ef_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ef_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync cart across multiple browser tabs automatically via storage events
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'ef_cart') {
        try {
          const parsed = event.newValue ? JSON.parse(event.newValue) : [];
          console.log('[Shop] [MULTI_TAB_SYNC] Synced cart updated from another browser tab.');
          setCart(parsed);
        } catch (err) {
          console.error('[Shop] Failed to parse multi-tab storage update for cart:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('ef_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('ef_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ef_recently_viewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Fetch products and orders from Express API on mount / view shift
  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Error fetching products:', err));

    const token = localStorage.getItem('ef_auth_token');
    const lastUser = localStorage.getItem('ef_auth_user');

    if (view === 'orders') {
      setIsLoadingOrders(true);
      setOrdersError(null);
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    let emailQuery = '';
    if (lastUser) {
      try {
        const parsed = JSON.parse(lastUser);
        if (parsed && parsed.email) {
          emailQuery = `?email=${encodeURIComponent(parsed.email)}`;
        }
      } catch (e) {
        // ignore parse error
      }
    }

    fetch(`/api/orders${emailQuery}`, { headers })
      .then(res => {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('ef_auth_token');
          localStorage.removeItem('ef_auth_user');
          throw new Error('Your session has expired. Please log in again.');
        }
        if (!res.ok) {
          throw new Error('Failed to retrieve your orders. Please try again.');
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setOrders(data);
        } else if (data && data.error) {
          throw new Error(data.error);
        } else {
          setOrders([]);
        }
      })
      .catch(err => {
        console.error('Error fetching orders:', err);
        if (view === 'orders') {
          setOrdersError(err.message || 'Failed to load orders.');
        }
      })
      .finally(() => {
        if (view === 'orders') {
          setIsLoadingOrders(false);
        }
      });
  }, [view, ordersFetchTrigger]);

  // View Details and append to Recently Viewed list
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    
    // Add to recently viewed (prevent duplicates, max 5 items)
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 5);
    });
    
    setView('details', product.id);
  };

  // Add item to shopping cart (handles option for buy with installation)
  const handleAddToCart = (product, buyWithInstallation = false) => {
    const now = Date.now();
    // 5. Debounce or throttle rapid clicks (300-500ms)
    if (now - lastClickTimeRef.current < 500) {
      console.log(`[Shop] Rapid click throttled for product: ${product.id}`);
      return;
    }

    // 8. Ignore repeated clicks while request is pending
    if (pendingAdds[product.id]) {
      console.log(`[Shop] Click ignored. Product ${product.id} add operation is currently pending.`);
      return;
    }

    lastClickTimeRef.current = now;
    console.log(`[Shop] [ON_CLICK] User clicked Add to Cart for product: "${product.name}" (ID: ${product.id})`);

    // 6. Disable the Add to Cart button immediately after click until the operation completes.
    setPendingAdds((prev) => ({ ...prev, [product.id]: true }));

    // Simulate network delay / slow network operation to test loading state and prevent race conditions perfectly
    setTimeout(() => {
      console.log(`[Shop] [ACTION_EXECUTE] Committing atomic cart state update for product: ${product.id}`);
      
      // 9. Use unique productId check before inserting into the cart.
      // 10. If the product already exists in the cart, increase quantity by exactly 1 only, never duplicate.
      // 11. Use atomic updates to prevent race conditions.
      // 18. Prevent duplicate items caused by hot reload or component re-rendering.
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) => item.product.id === product.id && item.withInstallation === buyWithInstallation
        );

        if (existingIndex > -1) {
          const updatedCart = prevCart.map((item, idx) => {
            if (idx === existingIndex) {
              return { ...item, quantity: item.quantity + 1 };
            }
            return item;
          });
          console.log(`[Shop] [ATOMIC_UPDATE] Incremented quantity of "${product.name}" in cart to ${updatedCart[existingIndex].quantity}.`);
          return updatedCart;
        } else {
          console.log(`[Shop] [ATOMIC_UPDATE] Added brand new item "${product.name}" to cart.`);
          return [...prevCart, { product, quantity: 1, withInstallation: buyWithInstallation }];
        }
      });

      // Clear pending state
      setPendingAdds((prev) => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });

      // 19. Add proper console logging to verify only one Add to Cart action is executed per click.
      console.log(`[Shop] [SUCCESS] Add to Cart handler successfully completed for product: "${product.name}"`);

      // Show beautiful non-blocking toast
      setToast({
        message: `Successfully added ${product.name} to your shopping cart!`,
        type: 'success'
      });
    }, 450); // slow network simulation (450ms)
  };

  // Immediate Buy CTA
  const handleBuyNow = (product, buyWithInstallation = false) => {
    // "Buy Now" should immediately open the Checkout page with ONLY the selected product
    setCheckoutItems([{ product, quantity: 1, withInstallation: buyWithInstallation }]);
    setIsBuyNowFlow(true);
    setSelectedProduct(product);

    const isLoggedIn = !!localStorage.getItem('ef_auth_user') && localStorage.getItem('ef_logged_out') !== 'true';
    if (!isLoggedIn) {
      setView('login-required');
    } else {
      setView('checkout');
    }
  };

  // Update item quantity inside cart
  const handleUpdateQuantity = (productId, buyWithInstallation, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId && item.withInstallation === buyWithInstallation) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  // Remove item completely from cart
  const handleRemoveItem = (productId, buyWithInstallation) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.withInstallation === buyWithInstallation)));
  };

  // Save item for later (moves item from cart and stores it in wishlist)
  const handleSaveForLater = (cartItem) => {
    const inWishlist = wishlist.some((p) => p.id === cartItem.product.id);
    if (!inWishlist) {
      setWishlist((prev) => [...prev, cartItem.product]);
    }
    // Remove from cart
    handleRemoveItem(cartItem.product.id, cartItem.withInstallation);
    setToast({
      message: `Moved ${cartItem.product.name} to your wishlist!`,
      type: 'success'
    });
  };

  // Toggle installation addon in cart row
  const handleToggleInstallation = (productId) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, withInstallation: !item.withInstallation };
        }
        return item;
      })
    );
  };

  // Toggle item in Wishlist directly
  const handleToggleWishlist = (product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      setToast({
        message: `Removed ${product.name} from your wishlist.`,
        type: 'info'
      });
    } else {
      setWishlist((prev) => [...prev, product]);
      setToast({
        message: `Added ${product.name} to your wishlist!`,
        type: 'success'
      });
    }
  };

  // Submit reviews and recalculate ratings on real backend database
  const handleAddReview = (productId, newReview) => {
    fetch(`/api/products/${productId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    })
      .then(res => res.json())
      .then(savedReview => {
        // Refresh products list from server
        fetch('/api/products')
          .then(res => {
            if (!res.ok) return null;
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) return null;
            return res.json();
          })
          .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
              setProducts(data);
              const currentProd = data.find(p => p.id === productId);
              if (currentProd) setSelectedProduct(currentProd);
            }
          });
      })
      .catch(err => {
        console.error('Error submitting review:', err);
        // Local state fallback
        setProducts((prevProducts) => {
          return prevProducts.map((p) => {
            if (p.id === productId) {
              const updatedReviews = [newReview, ...p.reviews];
              const newAvg = (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1);
              return {
                ...p,
                reviews: updatedReviews,
                rating: Number(newAvg)
              };
            }
            return p;
          });
        });
      });
  };

  // Handle Secure checkout order success
  const handleOrderSuccess = (placedOrder) => {
    setOrders((prev) => [placedOrder, ...prev]);
    setRecentlyPlacedOrder(placedOrder);
    if (!isBuyNowFlow) {
      setCart([]); // Clear shopping cart ONLY if NOT a Buy Now flow
    }
    setAppliedPromo(''); // Reset promo
    setView('success');
  };

  // Cancel order (before delivered) via API
  const handleCancelOrder = (orderId) => {
    fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to cancel order');
        return res.json();
      })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: 'Cancelled' } : o))
        );
      })
      .catch(err => console.error('Error cancelling order:', err));
  };

  // Returns/Replacements requested via API
  const handleReturnOrder = (orderId, returnClaim) => {
    fetch(`/api/orders/${orderId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnClaim)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to submit return request');
        return res.json();
      })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: 'Return Requested', returnClaim } : o))
        );
      })
      .catch(err => console.error('Error submitting return:', err));
  };

  // Advance shipment tracking progress (Simulation helper!) via API
  const handleSimulateStatus = (orderId) => {
    fetch(`/api/orders/${orderId}/simulate`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to advance shipment status');
        return res.json();
      })
      .then((data) => {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: data.status } : o))
        );
      })
      .catch(err => console.error('Error simulating status:', err));
  };

  const handleApplyPromo = (promoCode) => {
    setAppliedPromo(promoCode);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section id="shop-module" className="pt-28 pb-20 bg-slate-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Module Nav toolbar / Header Buttons */}
        <div className="flex flex-col lg:flex-row items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
            <h1 className="font-display text-xl font-extrabold text-slate-900 tracking-tight cursor-pointer" onClick={() => { setView('home'); setSearchQuery(''); }}>
              ElectroFix <span className="text-blue-600">Storefront</span>
            </h1>
          </div>

          {/* Integrated Modern E-Commerce Search Bar */}
          <div ref={searchContainerRef} className="w-full lg:flex-1 max-w-2xl mx-0 lg:mx-8 relative z-40">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for products, brands, spare parts, accessories..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  if (view !== 'home') setView('home');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (activeIndex >= 0 && activeIndex < flatItems.length) {
                      const selectedItem = flatItems[activeIndex];
                      handleSelectSuggestion(selectedItem);
                    } else {
                      handleSearchSubmit(searchQuery);
                    }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                  }
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder-slate-400 focus:outline-none transition-all text-xs font-semibold shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions drop-down menu */}
            {showSuggestions && (flatItems.length > 0 || (searchQuery === '' && recentSearches.length > 0)) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-slide-down">
                <div className="p-2 max-h-[440px] overflow-y-auto scrollbar-thin divide-y divide-slate-100">
                  
                  {/* Option 1: Live Query Term */}
                  {trimmedQuery && flatItems.find(i => i.type === 'query') && (() => {
                    const item = flatItems.find(i => i.type === 'query');
                    return (
                      <div className="pb-2">
                        <div
                          onClick={() => handleSelectSuggestion(item)}
                          onMouseEnter={() => setActiveIndex(item.index)}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                            activeIndex === item.index 
                              ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600' 
                              : 'text-slate-700 font-semibold hover:bg-slate-50'
                          }`}
                        >
                          <Search className={`h-4 w-4 ${activeIndex === item.index ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-xs">Search for "<span className="font-extrabold">{searchQuery}</span>"</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Option 2: Suggested Categories */}
                  {categoriesWithIndex.length > 0 && (
                    <div className="py-2.5">
                      <div className="px-3.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Related Categories
                      </div>
                      <div className="space-y-0.5">
                        {categoriesWithIndex.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectSuggestion(item)}
                            onMouseEnter={() => setActiveIndex(item.index)}
                            className={`flex items-center justify-between px-3.5 py-2 rounded-xl cursor-pointer transition-all ${
                              activeIndex === item.index 
                                ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 pl-2.5' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 text-xs font-semibold">
                              <Grid className={`h-4 w-4 ${activeIndex === item.index ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span>{highlightMatch(item.label, searchQuery)}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Category</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Option 3: Matching Spare Parts */}
                  {sparesWithIndex.length > 0 && (
                    <div className="py-2.5">
                      <div className="px-3.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Suggested Spare Parts
                      </div>
                      <div className="space-y-1">
                        {sparesWithIndex.map((item) => {
                          const p = item.value;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleSelectSuggestion(item)}
                              onMouseEnter={() => setActiveIndex(item.index)}
                              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                                activeIndex === item.index 
                                  ? 'bg-blue-50 border-l-4 border-blue-600 pl-2.5' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-9 h-9 object-cover rounded-lg shrink-0 border border-slate-100"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getFallbackProductImage(p.category, p.name);
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">Spare Part</span>
                                  <span className="text-[9px] font-bold text-slate-400">{p.brand}</span>
                                </div>
                                <p className={`text-xs font-bold truncate mt-1 ${activeIndex === item.index ? 'text-blue-700' : 'text-slate-800'}`}>
                                  {highlightMatch(p.name, searchQuery)}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-blue-600">₹{p.price}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Option 4: Matching Products */}
                  {prodsWithIndex.length > 0 && (
                    <div className="py-2.5">
                      <div className="px-3.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Matching Products
                      </div>
                      <div className="space-y-1">
                        {prodsWithIndex.map((item) => {
                          const p = item.value;
                          return (
                            <div
                              key={item.id}
                              onClick={() => handleSelectSuggestion(item)}
                              onMouseEnter={() => setActiveIndex(item.index)}
                              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                                activeIndex === item.index 
                                  ? 'bg-blue-50 border-l-4 border-blue-600 pl-2.5' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-9 h-9 object-cover rounded-lg shrink-0 border border-slate-100"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = getFallbackProductImage(p.category, p.name);
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                                  {p.brand} | {p.category}
                                </p>
                                <p className={`text-xs font-bold truncate mt-0.5 ${activeIndex === item.index ? 'text-blue-700' : 'text-slate-800'}`}>
                                  {highlightMatch(p.name, searchQuery)}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-blue-600">₹{p.price}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Option 5: Recent Searches */}
                  {searchQuery === '' && recentSearches.length > 0 && (
                    <div className="py-2">
                      <div className="flex items-center justify-between px-3.5 pb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Recent Searches
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[9px] font-bold text-slate-400 hover:text-red-500 uppercase cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {recentSearches.map((term) => (
                          <div
                            key={`recent-item-${term}`}
                            onClick={() => handleSearchSubmit(term)}
                            className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600">
                              <History className="h-3.5 w-3.5 text-slate-400" />
                              <span>{term}</span>
                            </div>
                            <button
                              onClick={(e) => removeRecentSearchItem(e, term)}
                              className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                              title="Delete search"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Option 6: Trending / Suggested Searches */}
                  {trendingWithIndex.length > 0 && (
                    <div className="py-2.5">
                      <div className="px-3.5 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Trending Searches
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 p-1">
                        {trendingWithIndex.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectSuggestion(item)}
                            onMouseEnter={() => setActiveIndex(item.index)}
                            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border ${
                              activeIndex === item.index 
                                ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' 
                                : 'bg-slate-50 border-slate-100 text-slate-700 font-semibold hover:bg-slate-100'
                            }`}
                          >
                            <Flame className={`h-4 w-4 shrink-0 ${activeIndex === item.index ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                            <span className="truncate text-xs">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Option 7: No matches found */}
                  {searchQuery !== '' && flatItems.length <= 1 && (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No matching products or categories. Press Enter to search "{searchQuery}" on ElectroFix anyway.
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* Quick-toggle bar buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
            <button
              onClick={() => setView('home')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                view === 'home' || view === 'details'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Catalog</span>
            </button>

            <button
              onClick={() => setView('cart')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                view === 'cart'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setView('wishlist')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                view === 'wishlist'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setView('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                view === 'orders'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>My Orders</span>
              {orders.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono">
                  {orders.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Render View Routing */}
        <div className="transition-all duration-300">
          {view === 'home' && (
            <ShopHome
              products={[...products, ...SYNTHETIC_PRODUCTS]}
              wishlist={wishlist}
              onViewDetails={handleViewDetails}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              recentlyViewed={recentlyViewed}
              onViewOrders={() => setView('orders')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              pendingAdds={pendingAdds}
            />
          )}
 
          {view === 'details' && selectedProduct && (
            <ProductDetails
              product={selectedProduct}
              allProducts={[...products, ...SYNTHETIC_PRODUCTS]}
              wishlist={wishlist}
              onBack={() => setView('home')}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
              onToggleWishlist={handleToggleWishlist}
              onAddReview={handleAddReview}
              onSelectProduct={handleViewDetails}
              pendingAdds={pendingAdds}
            />
          )}

          {view === 'cart' && (
            <CartView
              cart={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onSaveForLater={handleSaveForLater}
              onToggleInstallation={handleToggleInstallation}
              onProceedToCheckout={() => {
                setCheckoutItems(cart);
                setIsBuyNowFlow(false);
                const isLoggedIn = !!localStorage.getItem('ef_auth_user') && localStorage.getItem('ef_logged_out') !== 'true';
                if (!isLoggedIn) {
                  setView('login-required');
                } else {
                  setView('checkout');
                }
              }}
              onBackToShop={() => setView('home')}
              appliedPromo={appliedPromo}
              onApplyPromo={handleApplyPromo}
            />
          )}

          {view === 'login-required' && (
            <LoginRequiredView
              onBack={() => {
                if (selectedProduct) {
                  setView('details');
                } else {
                  setView('cart');
                }
              }}
              redirectUrl={
                selectedProduct 
                  ? `/products/${selectedProduct.id}` 
                  : (isBuyNowFlow ? '/shop' : '/shop/cart')
              }
            />
          )}

          {view === 'checkout' && (
            <CheckoutView
              cart={checkoutItems}
              appliedPromo={appliedPromo}
              onOrderSuccess={handleOrderSuccess}
              onCancel={() => setView(isBuyNowFlow ? 'home' : 'cart')}
              cancelLabel={isBuyNowFlow ? "Back to Shop" : "Return to Cart"}
              userEmail={
                (() => {
                  try {
                    const u = localStorage.getItem('ef_auth_user');
                    return u ? JSON.parse(u).email || '' : '';
                  } catch (e) {
                    return '';
                  }
                })()
              }
            />
          )}

          {view === 'success' && recentlyPlacedOrder && (
            <OrderSuccessView
              order={recentlyPlacedOrder}
              onContinueShopping={() => {
                setRecentlyPlacedOrder(null);
                setView('home');
              }}
              onTrackOrder={() => {
                setRecentlyPlacedOrder(null);
                setView('orders');
              }}
            />
          )}

          {view === 'orders' && (
            <div className="space-y-8 animate-fade-in">
              {isLoadingOrders ? (
                <div className="py-24 text-center space-y-4">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-slate-500">Retrieving your orders...</p>
                </div>
              ) : ordersError ? (
                <div className="py-16 text-center border border-slate-200 rounded-3xl space-y-4 bg-slate-50/50 max-w-lg mx-auto">
                  <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-600 border border-rose-100">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 px-4">
                    <h4 className="text-sm font-bold text-slate-900">Failed to load orders</h4>
                    <p className="text-xs text-slate-500">{ordersError}</p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setOrdersFetchTrigger(prev => prev + 1);
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Try Again
                    </button>
                    {ordersError.includes('session') && (
                      <button
                        onClick={() => setView('login-required')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Login
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <MyOrdersView
                  orders={orders}
                  onCancelOrder={handleCancelOrder}
                  onReturnOrder={handleReturnOrder}
                  onSimulateStatus={handleSimulateStatus}
                  onBackToShop={() => setView('home')}
                />
              )}
            </div>
          )}

          {view === 'wishlist' && (
            <WishlistView
              wishlist={wishlist}
              onAddToCart={handleAddToCart}
              onRemoveFromWishlist={handleToggleWishlist}
              onBackToShop={() => setView('home')}
              onViewDetails={handleViewDetails}
            />
          )}
        </div>

      </div>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-[9999] pointer-events-none"
          >
            <div className="bg-slate-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-slate-800 pointer-events-auto max-w-sm">
              <Check className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-100">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
