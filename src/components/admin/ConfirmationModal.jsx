import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, CheckCircle, Info } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "danger", // "danger" | "warning" | "success" | "info"
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 className="h-6 w-6 text-rose-600" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-600" />,
    success: <CheckCircle className="h-6 w-6 text-emerald-600" />,
    info: <Info className="h-6 w-6 text-blue-600" />
  };

  const bgIconMap = {
    danger: "bg-rose-50 border-rose-100",
    warning: "bg-amber-50 border-amber-100",
    success: "bg-emerald-50 border-emerald-100",
    info: "bg-blue-50 border-blue-100"
  };

  const btnMap = {
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-200",
    warning: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-200",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200",
    info: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-200"
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl border border-slate-150 max-w-sm w-full p-6 space-y-4 relative shadow-2xl overflow-hidden"
        >
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border ${bgIconMap[type]} shrink-0 flex items-center justify-center`}>
              {iconMap[type]}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 font-bold text-xs">
            <button 
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button 
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer ${btnMap[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
