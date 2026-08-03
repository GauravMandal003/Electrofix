import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, ShieldCheck, Award, Recycle, HeartHandshake, UserCheck, 
  CheckCircle2, Clock, CreditCard, Sparkles, MapPin, Users, Check, 
  Compass, Leaf, ArrowRight, Shield, Laptop, Smartphone,
  Tv, Headphones
} from 'lucide-react';

// Reusable image loader component with skeleton loading & multi-level fallbacks
function RepairImage({ 
  primaryUrl, 
  fallbackUrls = [], 
  alt, 
  className = "", 
  fallbackIcon: FallbackIcon = Wrench, 
  title = ""
}) {
  const [urlIndex, setUrlIndex] = useState(0);
  const allUrls = [primaryUrl, ...fallbackUrls].filter(Boolean);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (urlIndex < allUrls.length - 1) {
      setUrlIndex(prev => prev + 1);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const currentUrl = allUrls[urlIndex];

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex flex-col items-center justify-center gap-2 z-10">
          <Wrench className="h-5 w-5 text-slate-400 animate-spin" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Loading...</span>
        </div>
      )}

      {/* Main Image or Fallback Card */}
      {!hasError ? (
        <img
          src={currentUrl}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex flex-col items-center justify-center p-4 text-center text-slate-800 space-y-1">
          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 shadow-xs">
            <FallbackIcon className="h-5 w-5" />
          </div>
          <p className="font-display font-bold text-xs text-slate-900">{title || 'ElectroFix Repair Services'}</p>
          <p className="text-[10px] text-slate-500 font-medium">Certified Technicians & Diagnostic Labs</p>
        </div>
      )}
    </div>
  );
}

export default function AboutUs() {
  // Why Choose ElectroFix - 8 Feature Cards
  const features = [
    {
      title: 'Certified Technicians',
      desc: 'Trained & background-verified experts for all major brands and appliances.',
      icon: UserCheck,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Genuine Spare Parts',
      desc: '100% authentic manufacturer-grade components with quality guarantee.',
      icon: Award,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      title: 'Affordable Pricing',
      desc: 'Upfront, transparent rates with no hidden inspection or service fees.',
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Fast Doorstep Service',
      desc: 'Express doorstep pick-up, diagnosis, and drop across major cities.',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Warranty on Repairs',
      desc: 'Up to 90 days complete repair warranty for complete peace of mind.',
      icon: ShieldCheck,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      title: 'Secure Online Payments',
      desc: 'Multiple payment options including UPI, Cards, COD, and Net Banking.',
      icon: Shield,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    },
    {
      title: 'Transparent Pricing',
      desc: 'Itemized digital estimates provided before any repair work commences.',
      icon: HeartHandshake,
      color: 'text-rose-600 bg-rose-50 border-rose-100',
    },
    {
      title: 'Eco-Friendly Recycling',
      desc: 'Responsible e-waste disposal and recycling for unrepairable devices.',
      icon: Recycle,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
  ];

  // Gallery Cards with multiple fallback URLs - each with unique, category-matched primary image
  const galleryItems = [
    {
      id: 'workshop',
      title: 'Diagnostic Lab & Workshop',
      subtitle: 'Modern testing equipment & ESD-safe workstations',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      fallbackUrls: [
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
      ],
      fallbackIcon: Wrench,
      colSpan: 'lg:col-span-2',
      badge: 'Certified Facilities'
    },
    {
      id: 'laptop',
      title: 'Laptop & Board Repair',
      subtitle: 'Micro-soldering & IC replacement experts',
      url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
      fallbackUrls: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
      ],
      fallbackIcon: Laptop,
      colSpan: 'lg:col-span-1',
      badge: 'Hardware Specialist'
    },
    {
      id: 'mobile',
      title: 'Smartphone Restoration',
      subtitle: 'Screen, battery, and water-damage recovery',
      url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
      fallbackUrls: [
        'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80'
      ],
      fallbackIcon: Smartphone,
      colSpan: 'lg:col-span-1',
      badge: 'Mobile Express'
    },
    {
      id: 'appliance',
      title: 'Home Appliances & TV Repair',
      subtitle: 'Smart TVs, ACs, Refrigerators & Washers',
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      fallbackUrls: [
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
      ],
      fallbackIcon: Tv,
      colSpan: 'lg:col-span-1',
      badge: 'Home Care'
    },
    {
      id: 'support',
      title: 'Dedicated Customer Support',
      subtitle: 'Prompt doorstep tracking & consultation',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      fallbackUrls: [
        'https://images.unsplash.com/photo-1580894732413-a70d22c974d6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=800&q=80'
      ],
      fallbackIcon: Headphones,
      colSpan: 'lg:col-span-1',
      badge: '24/7 Assistance'
    },
  ];

  // Statistics
  const stats = [
    { label: 'Repairs Completed', value: '5000+', icon: Wrench, color: 'from-blue-600 to-indigo-600' },
    { label: 'Customer Satisfaction', value: '98%', icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
    { label: 'Certified Technicians', value: '100+', icon: Users, color: 'from-purple-600 to-indigo-600' },
    { label: 'Cities Served', value: '50+', icon: MapPin, color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <section id="about-us" className="pt-28 pb-20 bg-slate-50/50 relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

        {/* 1. HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-4 py-1.5 rounded-full text-xs font-bold text-blue-700 tracking-wide uppercase shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Professional Electronics Repair Services Across India</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">
            Repair. Restore. <span className="text-blue-600">Reuse.</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
            ElectroFix is a trusted electronics repair platform that helps customers repair, maintain, buy, and sell electronic devices. Our mission is to reduce electronic waste while providing affordable, reliable, and high-quality repair solutions for homes and businesses.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Doorstep Pickup & Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>100% Genuine Spare Parts</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>90-Day Repair Warranty</span>
            </div>
          </div>
        </div>

        {/* 2. REPAIR WORKSHOP & FACILITIES GALLERY */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
              State-Of-The-Art Facilities
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Inside ElectroFix Operations
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2">
              Equipped with modern micro-soldering labs, ESD protection, and expert diagnostic technicians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-[16px] overflow-hidden border border-slate-200 bg-white shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
                  item.colSpan === 'lg:col-span-2' 
                    ? 'md:col-span-2 lg:col-span-2 h-[180px] sm:h-[200px]' 
                    : 'col-span-1 h-[180px] sm:h-[200px]'
                }`}
              >
                <RepairImage
                  primaryUrl={item.url}
                  fallbackUrls={item.fallbackUrls}
                  alt={item.title}
                  fallbackIcon={item.fallbackIcon}
                  title={item.title}
                  className="w-full h-full"
                />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/80 px-2.5 py-0.5 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                </div>

                {/* Subtle Semi-Transparent Bottom Overlay for Labels */}
                <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-transparent p-3.5 pt-7 text-white flex flex-col justify-end pointer-events-none">
                  <h3 className="font-display text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-200 font-medium line-clamp-1 leading-normal">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. OUR STORY SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              <span>Our Story</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Making Electronics Repair Simple, Transparent & Affordable
            </h2>

            <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              <p>
                ElectroFix was created to make electronics repair simple, transparent, and affordable. Instead of replacing expensive devices, we help customers extend the life of their smartphones, laptops, televisions, refrigerators, washing machines, air conditioners, and other home appliances through certified repair services.
              </p>
              <p>
                Our experienced technicians use genuine spare parts and modern diagnostic equipment to ensure every repair meets high quality standards.
              </p>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Multi-Brand Repair</p>
                  <p className="text-[11px] text-slate-500">All major Indian brands</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Certified Quality</p>
                  <p className="text-[11px] text-slate-500">Tested before delivery</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 aspect-4/3">
              <RepairImage
                primaryUrl="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                fallbackUrls={[
                  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
                  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
                ]}
                alt="ElectroFix Certified Technician repairing electronics"
                fallbackIcon={Wrench}
                title="Certified Electronics Workshop"
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none z-10" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-lg z-20">
                <p className="text-xs font-extrabold text-slate-900">Pan-India Repair Network</p>
                <p className="text-[11px] text-slate-600 font-medium">Serving households and businesses with reliable doorstep services.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MISSION & VISION SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg space-y-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-black text-white">
              Our Mission
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed font-medium">
              To provide fast, affordable, and trustworthy repair services while reducing electronic waste and encouraging sustainable technology usage across India.
            </p>
          </div>

          {/* Vision Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white shadow-lg space-y-4 relative overflow-hidden border border-slate-800">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="h-12 w-12 rounded-2xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display text-2xl font-black text-white">
              Our Vision
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              To become India's most trusted electronics repair and resale platform by delivering exceptional customer service, certified repairs, genuine spare parts, and innovative digital solutions.
            </p>
          </div>
        </div>

        {/* 5. WHY CHOOSE ELECTROFIX (8 Feature Cards) */}
        <div className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
              The ElectroFix Advantage
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
              Why Choose ElectroFix
            </h2>
            <p className="text-slate-500 text-sm">
              We combine technical mastery with prompt customer service for a seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-3 group"
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${feat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. STATISTICS SECTION */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 text-center">
            {stats.map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={`text-3xl sm:text-4xl font-black font-display bg-gradient-to-r ${st.color} bg-clip-text text-transparent`}>
                    {st.value}
                  </div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    {st.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. OUR PROMISE & SUSTAINABILITY SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Promise */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">Trust & Quality</span>
                <h3 className="font-display text-2xl font-bold text-slate-900">Our Promise</h3>
              </div>
            </div>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Every repair is handled with care, transparency, and professionalism. We are committed to delivering reliable service, quality workmanship, and complete customer satisfaction.
            </p>
          </div>

          {/* Sustainability Section */}
          <div className="p-8 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">Eco Commitment</span>
                <h3 className="font-display text-2xl font-bold text-emerald-950">Building a Greener Future</h3>
              </div>
            </div>
            <p className="text-emerald-900 text-sm sm:text-base leading-relaxed font-medium">
              Every repaired device reduces electronic waste. By repairing instead of replacing, our customers help conserve resources and create a cleaner environment.
            </p>
          </div>
        </div>

        {/* 8. FOOTER CTA SECTION */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
              Need a Repair Today?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base font-medium">
              Book a certified technician or explore our electronics store for genuine products and accessories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/services"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              <span>Book Repair</span>
            </Link>

            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-800/60 hover:bg-blue-800 text-white border border-blue-400/40 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Visit Shop</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
