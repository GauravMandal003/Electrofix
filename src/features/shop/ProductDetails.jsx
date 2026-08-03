// ProductDetails.jsx - Highly Polished E-Commerce Product Details Page
import { useState, useEffect } from 'react';
import { getFallbackProductImage } from '../../utils/shopData';
import { 
  Star, Check, ShoppingCart, Heart, ShieldCheck, MapPin, Truck, 
  ChevronRight, Award, User, RefreshCw, Send, ArrowLeft, Wrench, 
  Loader2, Share2, Info, Calendar, BadgePercent, PackageCheck, 
  RotateCcw, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductDetails({
  product,
  allProducts = [],
  wishlist = [],
  onBack,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onAddReview,
  onSelectProduct,
  pendingAdds = {}
}) {
  const [activeImage, setActiveImage] = useState(product.gallery?.[0] || product.image);
  const [zipcode, setZipcode] = useState('');
  const [zipCheckResult, setZipCheckResult] = useState(null);
  const [isCheckingZip, setIsCheckingZip] = useState(false);
  const [buyWithInstallation, setBuyWithInstallation] = useState(false);
  
  // Hover Zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Share action state
  const [shareCopied, setShareCopied] = useState(false);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Sync active image when product changes
  useEffect(() => {
    setActiveImage(product.gallery?.[0] || product.image);
    setZipCheckResult(null);
    setZipcode('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  // Wishlist check
  const isWishlisted = wishlist.some(item => item.id === product.id);

  // Related products
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Zoom position calculator
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  // Share product link
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    });
  };

  // Zip Code check simulation
  const handleZipCheck = (e) => {
    e.preventDefault();
    if (!zipcode.trim() || zipcode.trim().length < 5) {
      setZipCheckResult({ success: false, text: "Invalid pin code. Please enter 5 digits." });
      return;
    }
    setIsCheckingZip(true);
    setZipCheckResult(null);
    setTimeout(() => {
      setIsCheckingZip(false);
      const lastDigit = zipcode.charAt(zipcode.length - 1);
      if (lastDigit === '0' || lastDigit === '9') {
        setZipCheckResult({ success: false, text: "Standard delivery unavailable for this pin code." });
      } else {
        setZipCheckResult({
          success: true,
          standard: "Free Delivery by Wednesday, July 8",
          express: "Express Courier delivery available in 4-6 hours."
        });
      }
    }, 600);
  };

  // Review Submission
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      alert("Please fill out both your name and review comment.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: reviewerName.trim(),
      rating: Number(reviewerRating),
      comment: reviewerComment.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    onAddReview(product.id, newReview);
    setReviewSuccessMsg("Thank you! Your verified customer review has been published.");
    setReviewerName('');
    setReviewerComment('');
    setReviewerRating(5);
    setTimeout(() => {
      setReviewSuccessMsg('');
    }, 4000);
  };

  // Default values for detailed specifications/highlights to enrich the UX
  const enrichedHighlights = product.highlights || [
    "High-efficiency peak performance with dynamic auto-regulation",
    "Smart-home compatible with responsive digital connectivity",
    "Heavy-duty rustproof chassis designed for extreme climate durability",
    "Certified original equipment manufacturer (OEM) grade component parts",
    "Eco-friendly star rating for minimal electricity/resource footprints"
  ];

  const enrichedWhatsInBox = product.whatsInBox || [
    "1 Main Appliance / Accessory Unit",
    "Power Connector Cable",
    "Universal Remote Controller with batteries included",
    "Premium Heavy-Duty Wall Mount Bracket Kit",
    "Official Brand Warranty Certificate card",
    "Comprehensive Step-by-Step Installation & Setup Manual"
  ];

  const enrichedSpecs = product.specs || {
    "Brand": product.brand,
    "Category": product.category,
    "Model Number": product.modelNumber || `EF-${product.brand.substring(0,3).toUpperCase()}-${product.id.toUpperCase()}`,
    "Power Source": "Standard AC 220-240V",
    "Workmanship Limit": "12 Months Comprehensive Warranty"
  };

  // Review math
  const reviewCount = product.reviews?.length || 0;
  const avgRating = reviewCount > 0 
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : product.rating || 4.5;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer transition-all"
          >
            <Share2 className="h-4 w-4" />
            <span>{shareCopied ? 'Link Copied!' : 'Share Product'}</span>
          </button>

          <button
            onClick={() => onToggleWishlist(product)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              isWishlisted
                ? 'bg-red-50 border-red-100 text-red-500'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
          </button>
        </div>
      </div>

      {/* Main Container - Left: Gallery, Right: Details and Buy Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery with Hover Zoom */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative">
            {/* Main Interactive Zoom Image */}
            <div 
              className="relative aspect-[4/3] rounded-3xl bg-slate-50 border border-slate-200/60 overflow-hidden shadow-sm flex items-center justify-center cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={activeImage || getFallbackProductImage(product.category, product.name)}
                alt={product.name}
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-100 bg-slate-100 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                onError={(e) => {
                  if (e.target.dataset.triedFallback) {
                    e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                  } else {
                    e.target.dataset.triedFallback = "true";
                    e.target.src = getFallbackProductImage(product.category, product.name);
                  }
                }}
              />
              {/* Zoom hint overlay */}
              {!isZoomed && (
                <div className="absolute bottom-3 right-3 bg-slate-900/60 text-white text-[10px] font-semibold px-2 py-1 rounded-md backdrop-blur-sm pointer-events-none uppercase tracking-wider">
                  Hover to Zoom
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery Row */}
          {product.gallery && product.gallery.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 relative shrink-0 ${
                    activeImage === img ? 'border-blue-600 scale-[1.03] shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img || getFallbackProductImage(product.category, product.name)}
                    alt={`${product.name} ${i}`}
                    className="w-full h-full object-cover bg-slate-100"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (e.target.dataset.triedFallback) {
                        e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                      } else {
                        e.target.dataset.triedFallback = "true";
                        e.target.src = getFallbackProductImage(product.category, product.name);
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Highlights Section */}
          <div className="pt-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded"></span> Key Product Highlights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrichedHighlights.map((hl, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-600 leading-relaxed font-semibold">{hl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Title, Prices, Specifications & Interactive Sticky Buy Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {product.category}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                Brand: {product.brand}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 tracking-tight leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <span className="font-bold text-slate-800 ml-1">{avgRating}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-blue-600 hover:underline cursor-pointer">{reviewCount} Customer Reviews</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Model: {enrichedSpecs["Model Number"]}</span>
            </div>
          </div>

          {/* Pricing & Offerings */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Special Retail Price</span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-slate-950">₹{product.price}</span>
                <span className="text-base text-slate-400 line-through">₹{product.originalPrice}</span>
                <span className="text-xs text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100">
                  Save ₹{product.originalPrice - product.price} ({Math.round(((product.originalPrice - product.price)/product.originalPrice)*100)}% Off)
                </span>
              </div>
            </div>

            {/* EMI and COD Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-b border-slate-200/60 py-4">
              <div className="flex items-start gap-2">
                <BadgePercent className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">EMI starts at ₹49/mo</h4>
                  <p className="text-[10px] text-slate-500">No Cost EMI available on major bank credit cards.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <PackageCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Cash on Delivery (COD)</h4>
                  <p className="text-[10px] text-slate-500">COD eligibility and free returns policy applies.</p>
                </div>
              </div>
            </div>

            {/* Warranty badge */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Includes 1-Year Comprehensive Brand Warranty</span>
            </div>
          </div>

          {/* Interactive Sticky Checkout Box */}
          <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-lg space-y-5 lg:sticky lg:top-24">
            
            {/* Stock Availability status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Availability:</span>
              {product.stock > 0 ? (
                <span className={`text-xs font-bold border px-3 py-1 rounded-full ${
                  product.stock <= 3 
                    ? 'text-amber-600 bg-amber-50 border-amber-200' 
                    : 'text-emerald-600 bg-emerald-50 border-emerald-200'
                }`}>
                  {product.stock <= 3 ? `Only ${product.stock} left in stock - order soon` : 'In Stock & Ready to Ship'}
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  Temporarily Out of Stock
                </span>
              )}
            </div>

            {/* Installation Add-On option */}
            <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100 flex items-start gap-3 hover:shadow-sm transition-shadow">
              <input
                id="install-addon"
                type="checkbox"
                checked={buyWithInstallation}
                onChange={(e) => setBuyWithInstallation(e.target.checked)}
                className="h-4.5 w-4.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer mt-0.5"
              />
              <div className="space-y-1">
                <label htmlFor="install-addon" className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 cursor-pointer select-none">
                  <Wrench className="h-4 w-4 text-blue-600" /> Add Expert Home Installation (+₹49)
                </label>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Includes full mounting, testing, and direct 1-Year installer workmanship guarantee by certified technicians.
                </p>
              </div>
            </div>

            {/* Call to Actions (CTAs) */}
            <div className="space-y-3">
              <button
                onClick={() => onAddToCart(product, buyWithInstallation)}
                disabled={product.stock === 0 || !!pendingAdds[product.id]}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {pendingAdds[product.id] ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onBuyNow(product, buyWithInstallation)}
                disabled={product.stock === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-lg shadow-blue-600/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Proceed to Buy Now</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Delivery Estimator widget */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-blue-600" /> Check Delivery Pin-Code
              </h4>
              <form onSubmit={handleZipCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={5}
                  placeholder="Enter 5-digit zip code (e.g., 90210)"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-200 outline-none bg-white focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={isCheckingZip}
                  className="px-4 py-2.5 bg-slate-950 text-white font-bold rounded-xl text-xs hover:bg-slate-850 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCheckingZip ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Check'}
                </button>
              </form>

              {zipCheckResult && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-fade-in ${
                  zipCheckResult.success 
                    ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800 font-semibold' 
                    : 'bg-red-50/60 border-red-100 text-red-800'
                }`}>
                  {zipCheckResult.success ? (
                    <div className="space-y-1">
                      <p className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-emerald-600" /> {zipCheckResult.standard}</p>
                      <p className="flex items-center gap-1 text-[11px] text-emerald-600"><Wrench className="h-3.5 w-3.5" /> {zipCheckResult.express}</p>
                    </div>
                  ) : (
                    <p>{zipCheckResult.text}</p>
                  )}
                </div>
              )}
            </div>

            {/* Return Policy and Trust Indicators */}
            <div className="border-t border-slate-100 pt-4 grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-bold text-slate-800 uppercase">7 Days</p>
                <p className="text-[8px] text-slate-400">Easy Replacement</p>
              </div>
              <div className="space-y-1">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                  <Truck className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-bold text-slate-800 uppercase">Free</p>
                <p className="text-[8px] text-slate-400">Delivery</p>
              </div>
              <div className="space-y-1">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                  <Award className="h-4 w-4" />
                </div>
                <p className="text-[9px] font-bold text-slate-800 uppercase">1 Year</p>
                <p className="text-[8px] text-slate-400">Official Warranty</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information, Description & Specs Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-slate-100">
        
        {/* Specifications & Description */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Description Block */}
          <div className="space-y-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded"></span> Product Description
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description} This item undergoes strict calibration audits by certified ElectroFix service experts to guarantee flawless performance and energy regulation. Perfect for modern residential setups, offering ultimate safety, high efficiency, and comprehensive official brand warranty backup support.
            </p>
          </div>

          {/* Technical Specifications */}
          <div className="space-y-3">
            <h3 className="text-base font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <span className="h-4 w-1 bg-blue-600 rounded"></span> Technical Specifications
            </h3>
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-700 uppercase tracking-wider w-1/3">Feature Specification</th>
                    <th className="p-4 font-bold text-slate-700 uppercase tracking-wider">Manufacturer Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(enrichedSpecs).map(([key, val]) => (
                    <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">{key}</td>
                      <td className="p-4 font-bold text-slate-800">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* What's in the Box & Service / Installation Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                What's in the Box
              </h4>
              <ul className="space-y-2">
                {enrichedWhatsInBox.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                Service & Installation
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Free standard professional setup & demo by authorized brand engineers within 24-48 hours of product delivery. Our experts will install the component, perform complete diagnostics checks, and guide you through operations.
              </p>
              <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-2.5">
                <Wrench className="h-4 w-4 text-blue-600" />
                <span className="text-[11px] font-semibold text-slate-700">Optional extended warranty on installation.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Rating Cards Panel */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span> Customer Reviews
          </h3>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-4">
            <div>
              <p className="text-4xl font-extrabold text-slate-950 font-display">{avgRating}</p>
              <div className="flex text-amber-400 justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(avgRating) ? 'fill-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">{reviewCount} Verified Customer Ratings</p>
            </div>
          </div>

          {/* Submit New Review Form */}
          <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3.5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Share Your Experience</h4>
            {reviewSuccessMsg && (
              <div className="p-2.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg animate-fade-in font-semibold">
                {reviewSuccessMsg}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g., Gaurav"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</label>
                <select
                  value={reviewerRating}
                  onChange={(e) => setReviewerRating(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                >
                  <option value={5}>5★ Excellent</option>
                  <option value={4}>4★ Good</option>
                  <option value={3}>3★ Average</option>
                  <option value={2}>2★ Poor</option>
                  <option value={1}>1★ Terrible</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review Comment</label>
              <textarea
                rows={3}
                placeholder="Write your honest review feedback..."
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <Send className="h-3 w-3" />
              <span>Submit Verified Review</span>
            </button>
          </form>

          {/* List of Reviews */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 space-y-1.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" /> {rev.name}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{rev.date || 'Verified Purchase'}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className={`h-3 w-3 ${idx < rev.rating ? 'fill-amber-400' : 'text-slate-100'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{rev.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-5">
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="h-4 w-1 bg-blue-600 rounded"></span> Recommended Related Products
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const saving = Math.round(((p.originalPrice - p.price) / p.originalPrice)*100);
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="group cursor-pointer rounded-2xl border border-slate-200/60 p-4 hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between bg-white"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-50">
                      <img
                        src={p.image || getFallbackProductImage(p.category, p.name)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 bg-slate-100"
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
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.brand}</p>
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{p.name}</h4>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-extrabold text-slate-950">₹{p.price}</span>
                      <span className="text-[9px] text-slate-400 line-through">₹{p.originalPrice}</span>
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">-{saving}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
