import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Wrench, User, Phone, MapPin, Tag } from 'lucide-react';

export default function CreateBookingModal({ 
  isOpen, 
  onClose, 
  editingBooking = null, 
  techs = [], 
  categories = [], 
  onSubmit 
}) {
  const [formData, setFormData] = useState({
    bookingId: '',
    customerName: '',
    phone: '',
    email: '',
    serviceType: 'AC Overhaul & Servicing',
    preferredDate: new Date().toISOString().slice(0, 10),
    preferredTimeSlot: '10:00 AM - 12:00 PM',
    address: '',
    city: 'Seattle',
    status: 'Pending Approval',
    technician: '',
    notes: '',
    cost: '90'
  });

  useEffect(() => {
    if (editingBooking) {
      setFormData({
        bookingId: editingBooking.bookingId || editingBooking.id || '',
        customerName: editingBooking.customerName || '',
        phone: editingBooking.phone || '',
        email: editingBooking.email || '',
        serviceType: editingBooking.serviceType || 'AC Overhaul & Servicing',
        preferredDate: editingBooking.preferredDate || new Date().toISOString().slice(0, 10),
        preferredTimeSlot: editingBooking.preferredTimeSlot || '10:00 AM - 12:00 PM',
        address: editingBooking.address || '',
        city: editingBooking.city || 'Seattle',
        status: editingBooking.status || 'Pending Approval',
        technician: editingBooking.technician || '',
        notes: editingBooking.notes || '',
        cost: editingBooking.cost || '90'
      });
    } else {
      setFormData({
        bookingId: `EF-BOOK-${Math.floor(10000 + Math.random() * 90000)}`,
        customerName: '',
        phone: '',
        email: '',
        serviceType: 'AC Overhaul & Servicing',
        preferredDate: new Date().toISOString().slice(0, 10),
        preferredTimeSlot: '10:00 AM - 12:00 PM',
        address: '',
        city: 'Seattle',
        status: 'Pending Approval',
        technician: '',
        notes: '',
        cost: '90'
      });
    }
  }, [editingBooking, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl border border-slate-150 max-w-xl w-full p-6 space-y-4 relative shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                {editingBooking ? 'Edit Service Booking Record' : 'Create Manual Service Booking'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Fill out customer and appliance inspection details.</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Booking ID</label>
                <input 
                  type="text" 
                  required 
                  disabled={!!editingBooking}
                  value={formData.bookingId}
                  onChange={(e) => setFormData(p => ({ ...p, bookingId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Rahul Verma"
                  value={formData.customerName}
                  onChange={(e) => setFormData(p => ({ ...p, customerName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone Number</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Customer Email</label>
                <input 
                  type="email" 
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Service Appliance Category</label>
                <select 
                  value={formData.serviceType}
                  onChange={(e) => setFormData(p => ({ ...p, serviceType: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="AC Overhaul & Servicing">AC Overhaul & Servicing</option>
                  <option value="Washing Machine Spin Repair">Washing Machine Spin Repair</option>
                  <option value="Refrigerator Gas Refilling">Refrigerator Gas Refilling</option>
                  <option value="TV Motherboard Repair">TV Motherboard Repair</option>
                  <option value="Microwave Heating Coil Replacement">Microwave Heating Coil Replacement</option>
                  <option value="Laptop Chip Level Repair">Laptop Chip Level Repair</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Service Date</label>
                <input 
                  type="date" 
                  required 
                  value={formData.preferredDate}
                  onChange={(e) => setFormData(p => ({ ...p, preferredDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</label>
                <select 
                  value={formData.preferredTimeSlot}
                  onChange={(e) => setFormData(p => ({ ...p, preferredTimeSlot: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Doorstep Address</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Flat 302, MG Road, Indiranagar"
                  value={formData.address}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Current Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Technician Assigned">Technician Assigned</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Assign Field Engineer</label>
                <select 
                  value={formData.technician}
                  onChange={(e) => setFormData(p => ({ ...p, technician: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {techs.map(t => (
                    <option key={t.id} value={t.name}>{t.name} ({t.status})</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                {editingBooking ? 'Save Booking Changes' : 'Create Service Booking'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
