import { ArrowRight, ShieldCheck, PenTool as Tool, Sparkles, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/images/repair_hero_image_1783083038934.jpg';

export default function Hero() {

  return (
    <section
      id="home"
      className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white"
    >
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Decorative Blur Spheres */}
      <div className="absolute top-20 right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-400/10 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left: Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 text-center lg:text-left">
            
            {/* Promo Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 self-center lg:self-start px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 uppercase tracking-wider"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              <span>Certified Electronics & Appliance Mechanics</span>
            </motion.div>

            {/* Core Value Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
              >
                Don't Throw It Away. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Let's Fix It Together.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                ElectroFix is your premium partner for professional diagnostics, micro-soldering, and rapid repairs. We fix smartphones, laptops, gaming consoles, and major household appliances.
              </motion.p>
            </div>

            {/* CTA Actions */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/services"
                className="group flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] transition-all"
                id="hero-book-repair-btn"
              >
                <Tool className="h-4 w-4 text-blue-400 group-hover:rotate-12 transition-transform" />
                <span>Book a Repair</span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/sell-used"
                className="flex items-center justify-center gap-2 px-8 py-4 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm hover:shadow active:scale-[0.98] transition-all"
                id="hero-sell-appliance-btn"
              >
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Sell Your Used Devices</span>
              </Link>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <span className="block font-display text-2xl font-bold text-slate-900">45k+</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Devices Restored</span>
              </div>
              <div className="border-x border-slate-100 px-4">
                <span className="block font-display text-2xl font-bold text-slate-900 flex items-center justify-center lg:justify-start gap-1">
                  4.9 <Star className="h-4 w-4 fill-amber-400 text-amber-400 inline" />
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Rating</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-bold text-slate-900">35 Min</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Fixing Time</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Right: High Fidelity Responsive Image */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full max-w-[460px] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-slate-950"
            >
              <img 
                src={heroImage} 
                alt="ElectroFix Workbench" 
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80";
                }}
              />
              {/* Overlay glow/border effects */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-white px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider font-extrabold shadow-lg flex items-center gap-1.5 select-none">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                <span>DIAGNOSTICS ACTIVE</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
