import { Hammer, ShieldCheck, Github, Twitter, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Footer Info and links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo & Vision Block */}
          <div className="md:col-span-5 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-left focus:outline-none group inline-block"
              id="footer-logo-btn"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Hammer className="h-5 w-5" />
              </div>
              <div>
                <span className="font-display text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                  Electro<span className="text-blue-500">Fix</span>
                </span>
                <div className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-[-2px]">
                  <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
                  <span>Certified Repair</span>
                </div>
              </div>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              We extend the lifecycles of modern electronics. From smartphones to refrigerators, we troubleshoot, align, and micro-solder systems to promote ecological sustainability and household savings.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors cursor-pointer block" id="footer-link-home">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors cursor-pointer block" id="footer-link-services">
                  Services Catalog & Quote
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-white transition-colors cursor-pointer block" id="footer-link-shop">
                  Refurbished Shop & Cart
                </Link>
              </li>
              <li>
                <Link to="/sell-used" className="hover:text-white transition-colors cursor-pointer block" id="footer-link-sell">
                  Sell Used Devices
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors cursor-pointer block" id="footer-link-about">
                  About Us & Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors cursor-pointer block" id="footer-link-contact">
                  Contact & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Certification / Coverage area */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-400">Coverage Guarantee</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every repair ticket, refurbished laptop, and smartphone sold includes an unconditional <strong>12-Month mechanical and micro-soldering warranty</strong>. 100% parts covered, no diagnostics fees.
            </p>
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">
                ELECTROFIX CERTIFIED WORKSHOP
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} ElectroFix Inc. All rights reserved globally.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
