import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Calendar, ShoppingBag, Package, Users, Wrench, ArrowRight } from 'lucide-react';

export default function GlobalSearchModal({ 
  isOpen, 
  onClose, 
  bookings = [], 
  orders = [], 
  products = [], 
  customers = [], 
  techs = [], 
  usedListings = [], 
  onNavigate 
}) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  const matchedBookings = cleanQuery ? bookings.filter(b => 
    b.bookingId?.toLowerCase().includes(cleanQuery) || 
    b.customerName?.toLowerCase().includes(cleanQuery) || 
    b.serviceType?.toLowerCase().includes(cleanQuery) || 
    b.phone?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedOrders = cleanQuery ? orders.filter(o => 
    o.orderId?.toLowerCase().includes(cleanQuery) || 
    o.shippingAddress?.fullname?.toLowerCase().includes(cleanQuery) || 
    o.email?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedProducts = cleanQuery ? products.filter(p => 
    p.name?.toLowerCase().includes(cleanQuery) || 
    p.id?.toLowerCase().includes(cleanQuery) || 
    p.brand?.toLowerCase().includes(cleanQuery) || 
    p.category?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedCustomers = cleanQuery ? customers.filter(c => 
    c.name?.toLowerCase().includes(cleanQuery) || 
    c.email?.toLowerCase().includes(cleanQuery) || 
    c.phone?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const matchedTechs = cleanQuery ? techs.filter(t => 
    t.name?.toLowerCase().includes(cleanQuery) || 
    t.areas?.toLowerCase().includes(cleanQuery)
  ).slice(0, 4) : [];

  const totalResults = matchedBookings.length + matchedOrders.length + matchedProducts.length + matchedCustomers.length + matchedTechs.length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="bg-white rounded-3xl border border-slate-150 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header Search Input */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input 
              type="text" 
              autoFocus
              placeholder="Global Search across Bookings, Orders, Products, Users, Technicians..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
              Esc
            </button>
          </div>

          {/* Search Results Area */}
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {!cleanQuery && (
              <div className="text-center py-10 space-y-2">
                <Search className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Start typing to search the entire database</p>
                <p className="text-[11px] text-slate-400">Search by Customer Name, Booking ID, Order ID, Product Model, Phone, Email, or Engineer</p>
              </div>
            )}

            {cleanQuery && totalResults === 0 && (
              <div className="text-center py-10 space-y-1">
                <p className="text-xs font-bold text-slate-700">No matching records found</p>
                <p className="text-[11px] text-slate-400">Try searching for a different keyword or ID</p>
              </div>
            )}

            {/* Bookings Section */}
            {matchedBookings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  <span>Bookings ({matchedBookings.length})</span>
                </div>
                <div className="space-y-1">
                  {matchedBookings.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onNavigate('bookings', b);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-900">{b.customerName || 'Anonymous'} • <span className="font-mono text-slate-500">{b.bookingId || b.id.substring(0,8)}</span></p>
                        <p className="text-[10px] text-slate-400">{b.serviceType} • {b.preferredDate} • <span className="font-bold text-slate-600">{b.status}</span></p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Section */}
            {matchedOrders.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <ShoppingBag className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Orders ({matchedOrders.length})</span>
                </div>
                <div className="space-y-1">
                  {matchedOrders.map(o => (
                    <button
                      key={o._id || o.orderId}
                      onClick={() => {
                        onNavigate('orders', o);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-100 hover:border-indigo-200 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-900">Order #{o.orderId} • ₹{o.costs?.total || o.total || 0}</p>
                        <p className="text-[10px] text-slate-400">{o.shippingAddress?.fullname || o.email} • Status: <span className="font-bold text-slate-600">{o.status}</span></p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {matchedProducts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Package className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Products ({matchedProducts.length})</span>
                </div>
                <div className="space-y-1">
                  {matchedProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onNavigate('products', p);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={p.image} alt="" className="h-8 w-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.brand} • {p.category} • <span className="font-bold text-slate-700">₹{p.price}</span></p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Users Section */}
            {matchedCustomers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Users className="h-3.5 w-3.5 text-amber-500" />
                  <span>Users ({matchedCustomers.length})</span>
                </div>
                <div className="space-y-1">
                  {matchedCustomers.map(c => (
                    <button
                      key={c.id || c._id}
                      onClick={() => {
                        onNavigate('customers', c);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 hover:border-amber-200 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-amber-900">{c.name} ({c.role || 'Customer'})</p>
                        <p className="text-[10px] text-slate-400">{c.email} • {c.phone || 'No phone'}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Technicians Section */}
            {matchedTechs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <Wrench className="h-3.5 w-3.5 text-purple-500" />
                  <span>Technicians ({matchedTechs.length})</span>
                </div>
                <div className="space-y-1">
                  {matchedTechs.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onNavigate('techs', t);
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-100 hover:border-purple-200 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800 group-hover:text-purple-900">{t.name} • Rating: ★{t.rating}</p>
                        <p className="text-[10px] text-slate-400">Areas: {t.areas} • Status: <span className="font-bold text-slate-700">{t.status}</span></p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
