// ShopHome.jsx - Product Listings with modern Collapsible E-Commerce Sidebar and Advanced Filters
import { useState, useEffect } from 'react';
import { 
  Search, Filter, Star, Eye, Heart, ShoppingCart, 
  ShieldCheck, Tag, Wrench, Sparkles, ArrowUpDown, 
  Clock, ChevronDown, ChevronUp, SlidersHorizontal, Check, X, Loader2 
} from 'lucide-react';
import { CATEGORIES, BRANDS, getFallbackProductImage } from '../../utils/shopData';

// Helper to enrich products with modelNumber and sparePartName
const enrichProduct = (p) => {
  const brandShort = (p.brand || 'EF').substring(0, 3).toUpperCase();
  const idUpper = (p.id || '').toUpperCase();
  const modelNumber = p.modelNumber || `EF-${brandShort}-${idUpper}-2026`;
  const sparePartName = p.category === "Genuine Spare Parts" ? p.name : "";
  return { ...p, modelNumber, sparePartName };
};

const highlightMatch = (text, query) => {
  if (!text || typeof text !== 'string') return text || '';
  if (!query || !query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-yellow-100 text-slate-900 font-semibold px-0.5 rounded">{part}</mark> 
          : part
      )}
    </span>
  );
};

export default function ShopHome({
  products = [],
  wishlist = [],
  onViewDetails,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  recentlyViewed = [],
  onViewOrders,
  searchQuery = '',
  setSearchQuery,
  pendingAdds = {}
}) {
  // Advanced Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Section collapsing states
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    brands: false,
    price: false,
    rating: false,
    availability: false,
    discount: false,
  });

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMaxPrice(1000);
    setMinRating(0);
    setInStockOnly(false);
    setMinDiscount(0);
    setSortBy('popular');
    if (setSearchQuery) {
      setSearchQuery('');
    }
  };

  // Dynamic Product counts computation based on the entire list
  const getCategoryCounts = () => {
    const counts = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  };

  const getBrandCounts = () => {
    const counts = {};
    products.forEach(p => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  };

  const getRatingCounts = () => {
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    products.forEach(p => {
      if (p.rating >= 4) counts[4]++;
      if (p.rating >= 3) counts[3]++;
      if (p.rating >= 2) counts[2]++;
      if (p.rating >= 1) counts[1]++;
    });
    return counts;
  };

  const getDiscountCounts = () => {
    const counts = { 10: 0, 20: 0, 30: 0, 40: 0 };
    products.forEach(p => {
      const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
      if (discount >= 10) counts[10]++;
      if (discount >= 20) counts[20]++;
      if (discount >= 30) counts[30]++;
      if (discount >= 40) counts[40]++;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const brandCounts = getBrandCounts();
  const ratingCounts = getRatingCounts();
  const discountCounts = getDiscountCounts();
  const inStockCount = products.filter(p => p.stock > 0).length;

  // Enriched and Filtered Products
  const enrichedProducts = products.map(enrichProduct);

  const filteredProducts = enrichedProducts
    .filter((p) => {
      // Search matches (Matches by product name, brand, category, model number, description, or spare part name)
      const matchesSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sparePartName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
      const matchesPrice = p.price <= maxPrice;
      const matchesRating = p.rating >= minRating;
      const matchesStock = !inStockOnly || p.stock > 0;
      
      const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
      const matchesDiscount = discountPercent >= minDiscount;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock && matchesDiscount;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.popularity - a.popularity;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      if (sortBy === 'newest') return (b.newest ? 1 : 0) - (a.newest ? 1 : 0);
      return 0;
    });

  // Check if any filter is active
  const isFilterActive = selectedCategory !== 'all' || 
                        selectedBrand !== 'all' || 
                        maxPrice !== 1000 || 
                        minRating !== 0 || 
                        inStockOnly || 
                        minDiscount !== 0 ||
                        searchQuery !== '';

  const gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Redesigned Hero Banner Section (No top search bar) */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-slate-900" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="h-3 w-3" /> Genuine Spares & Spares Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight leading-tight">
            Original Electronics & Factory Spare Parts
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl">
            Purchase brand-new premium appliances, certified electrical wiring components, smart switches, and original OEM replacement spare parts.
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-100/50 border border-slate-200/50">
        <div className="flex items-center gap-2.5 px-3 py-1">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">100% Genuine Parts</p>
            <p className="text-[10px] text-slate-500">Original manufacturer spares</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1">
          <Wrench className="h-5 w-5 text-blue-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">Expert Installation</p>
            <p className="text-[10px] text-slate-500">Optional technician fitment</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1">
          <Clock className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">30-Day Guarantee</p>
            <p className="text-[10px] text-slate-500">Hassle-free return policy</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-1">
          <Tag className="h-5 w-5 text-indigo-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">Wholesale Pricing</p>
            <p className="text-[10px] text-slate-500">Unmatched prices direct to you</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout with Full Width Grid */}
      <div className="space-y-6">
        
        {/* Top Actions: Result Counter, Sorting */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm gap-4">
          
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">
              Showing <span className="font-extrabold text-slate-800">{filteredProducts.length}</span> products 
              {searchQuery && <span> for "<span className="font-semibold text-blue-600">{searchQuery}</span>"</span>}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[160px]"
            >
              <option value="popular">Popularity (High - Low)</option>
              <option value="rating">Rating (Highest First)</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

        </div>

        {/* Product Listing Area */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 bg-white/50 shadow-sm">
              <Filter className="h-12 w-12 mx-auto text-slate-300 stroke-1 animate-pulse" />
              <h4 className="text-base font-extrabold text-slate-900">No products found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your exact search criteria. Try clearing search query or adjusting left filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/15 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                Reset All Filters & Search
              </button>
            </div>
          ) : (
            <div className={gridColsClass}>
              {filteredProducts.map((product) => {
                const isWishlisted = wishlist.some(item => item.id === product.id);
                const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

                // Stock status computation
                let stockStatusColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
                let stockStatusLabel = "In Stock";
                if (product.stock === 0) {
                  stockStatusColor = "text-red-600 bg-red-50 border-red-100";
                  stockStatusLabel = "Out of Stock";
                } else if (product.stock <= 5) {
                  stockStatusColor = "text-amber-600 bg-amber-50 border-amber-100";
                  stockStatusLabel = `Only ${product.stock} Left!`;
                }

                return (
                  <div
                    key={product.id}
                    className="group relative rounded-3xl border border-slate-200/60 p-5 bg-white flex flex-col justify-between hover:shadow-xl hover:border-slate-300 transition-all duration-300 animate-fade-in"
                  >
                    <div>
                      {/* Image wrapper with heart and discount badge */}
                      <div 
                        onClick={() => onViewDetails(product)}
                        className="relative aspect-[4/3] rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-[1.01] transition-transform overflow-hidden select-none cursor-pointer"
                      >
                        <img
                          src={product.image || getFallbackProductImage(product.category, product.name)}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-100"
                          onError={(e) => {
                            if (e.target.dataset.triedFallback) {
                              e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                            } else {
                              e.target.dataset.triedFallback = "true";
                              e.target.src = getFallbackProductImage(product.category, product.name);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Discount badge */}
                        <span className="absolute top-3 left-3 text-[10px] text-white font-extrabold bg-blue-600 px-2.5 py-1 rounded-full shadow-md">
                          SAVE {discountPercent}%
                        </span>

                        {/* Stock Warning tag */}
                        <span className={`absolute bottom-3 left-3 text-[9px] font-extrabold border px-2 py-0.5 rounded-md shadow-sm ${stockStatusColor}`}>
                          {stockStatusLabel}
                        </span>

                        {/* Wishlist Heart toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(product);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md shadow-md border transition-colors cursor-pointer z-10 ${
                            isWishlisted
                              ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                              : 'bg-white/80 hover:bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
                        </button>
                      </div>

                      {/* Brand & Category Details */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <span>{product.brand}</span>
                        <span>{product.category}</span>
                      </div>

                      {/* Rating summary */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                        <span className="text-[10px] text-slate-400">({product.reviews.length} reviews)</span>
                      </div>

                      <h3 
                        onClick={() => onViewDetails(product)}
                        className="font-display text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                      >
                        {highlightMatch(product.name, searchQuery)}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-1 font-mono text-[10px]">
                        Model: {highlightMatch(product.modelNumber, searchQuery)}
                      </p>
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {highlightMatch(product.description, searchQuery)}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      {/* Pricing row */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-extrabold text-slate-950">₹{product.price}</span>
                        <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-4 gap-2">
                        <button
                          onClick={() => onViewDetails(product)}
                          className="col-span-1 flex items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => onAddToCart(product)}
                          disabled={product.stock === 0 || !!pendingAdds[product.id]}
                          className="col-span-2 py-3 bg-slate-900 text-white rounded-2xl text-xs font-extrabold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pendingAdds[product.id] ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => onViewDetails(product)}
                          disabled={product.stock === 0}
                          className="col-span-1 py-3 bg-blue-600 text-white rounded-2xl text-xs font-extrabold hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-md shadow-blue-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      {/* Recently Viewed Products Drawer inside main list */}
      {recentlyViewed.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Your Recently Viewed Products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentlyViewed.map((p) => (
              <div
                key={`recent-${p.id}`}
                onClick={() => onViewDetails(p)}
                className="p-3 bg-white border border-slate-100 hover:border-slate-300 hover:shadow-md rounded-2xl cursor-pointer flex items-center gap-3 transition-all animate-fade-in"
              >
                <img
                  src={p.image || getFallbackProductImage(p.category, p.name)}
                  alt={p.name}
                  className="w-10 h-10 object-cover rounded-lg shrink-0 bg-slate-100"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.target.dataset.triedFallback) {
                      e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                    } else {
                      e.target.dataset.triedFallback = "true";
                      e.target.src = getFallbackProductImage(p.category, p.name);
                    }
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] font-mono text-blue-600 font-extrabold mt-0.5">₹{p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
