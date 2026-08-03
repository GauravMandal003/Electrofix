import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Shield, Lock, CheckCircle2 } from 'lucide-react';

export default function CreateUserModal({ 
  isOpen, 
  onClose, 
  editingUser = null, 
  onSubmit 
}) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'Customer',
    blocked: false
  });

  useEffect(() => {
    if (editingUser) {
      setFormData({
        id: editingUser.id || editingUser._id || '',
        name: editingUser.name || '',
        email: editingUser.email || '',
        phone: editingUser.phone || '',
        role: editingUser.role || 'Customer',
        blocked: !!editingUser.blocked
      });
    } else {
      setFormData({
        id: `usr-${Date.now()}`,
        name: '',
        email: '',
        phone: '',
        role: 'Customer',
        blocked: false
      });
    }
  }, [editingUser, isOpen]);

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
          className="bg-white rounded-3xl border border-slate-150 max-w-md w-full p-6 space-y-4 relative shadow-2xl overflow-hidden"
        >
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {editingUser ? 'Edit User Account' : 'Register New User Account'}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage credentials and role permissions.</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ananya Sharma"
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="e.g. ananya@example.com"
                value={formData.email}
                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
              <input 
                type="text" 
                placeholder="e.g. +91 9876500011"
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Account Role / Access Level</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 focus:outline-none"
              >
                <option value="Customer">Customer (Standard User)</option>
                <option value="Technician">Technician (Field Service Engineer)</option>
                <option value="Admin">Admin (Manager)</option>
                <option value="Super Admin">Super Admin (Full Access)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input 
                type="checkbox" 
                id="blockedUserCheck"
                checked={formData.blocked}
                onChange={(e) => setFormData(p => ({ ...p, blocked: e.target.checked }))}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="blockedUserCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                Block this account from logging into ElectroFix
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
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
                {editingUser ? 'Save User Details' : 'Register User'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
