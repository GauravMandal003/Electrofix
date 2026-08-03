// MyOrdersView.jsx - Order History, Tracker progress, Cancelations, Returns & Invoice modal
import { useState } from 'react';
import { ShoppingBag, FileText, Download, CheckCircle2, Clock, Truck, ShieldCheck, XCircle, ArrowRight, CornerUpLeft, Trash2, ShieldAlert, Printer, AlertTriangle, Eye, ChevronRight } from 'lucide-react';
import { getFallbackProductImage } from '../../utils/shopData';

export default function MyOrdersView({
  orders,
  onCancelOrder,
  onReturnOrder,
  onSimulateStatus, // helper prop for advancing tracking steps
  onBackToShop
}) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [returnOrderObj, setReturnOrderObj] = useState(null);
  const [returnReason, setReturnReason] = useState('defective');
  const [returnType, setReturnType] = useState('refund');
  const [returnNotes, setReturnNotes] = useState('');

  // Tracking steps definition
  const TRACKING_STEPS = ["Confirmed", "Processing", "Dispatched", "Out for Delivery", "Delivered"];

  const getStepIndex = (status) => {
    return TRACKING_STEPS.indexOf(status);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!returnOrderObj) return;
    
    onReturnOrder(returnOrderObj.orderId, {
      reason: returnReason,
      type: returnType,
      notes: returnNotes
    });

    setReturnOrderObj(null);
    setReturnNotes('');
    alert("Your return/replacement request has been successfully filed. A pick-up technician will contact you shortly.");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <h2 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
          <ShoppingBag className="h-5.5 w-5.5 text-blue-600" />
          <span>My Orders & Spares Tracking</span>
          <span className="text-sm font-bold text-slate-400">({orders.length} orders)</span>
        </h2>
        <button
          onClick={onBackToShop}
          className="text-xs font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-wider cursor-pointer"
        >
          Back to catalog
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 bg-slate-50/50">
          <FileText className="h-12 w-12 mx-auto text-slate-300 stroke-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">No purchase history found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't placed any electrical spare parts or product orders yet. Visit our shop to browse our extensive inventory.
            </p>
          </div>
          <button
            onClick={onBackToShop}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Go To Shop
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const stepIdx = getStepIndex(order.status);
            const isCancelled = order.status === 'Cancelled';
            const isReturned = order.status === 'Return Requested';

            return (
              <div
                key={order.orderId}
                className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 space-y-6 shadow-sm hover:shadow-md transition-all animate-fade-in"
              >
                {/* Order Top Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID Reference</p>
                    <p className="text-sm font-mono font-bold text-slate-900">{order.orderId}</p>
                    <p className="text-xs text-slate-500 font-medium">Placed on: {order.date}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status badge */}
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      isCancelled
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : isReturned
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : order.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {order.status}
                    </span>

                    {/* Invoice button */}
                    <button
                      onClick={() => setSelectedInvoice(order)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Invoice</span>
                    </button>

                    {/* Simulate advancement helper button */}
                    {!isCancelled && !isReturned && order.status !== 'Delivered' && (
                      <button
                        onClick={() => onSimulateStatus(order.orderId)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 flex items-center gap-1 text-[10px] font-bold transition-all cursor-pointer"
                        title="Simulate package tracking progression"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Advance Status</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tracking Progress Stepper (Only if not cancelled or returned) */}
                {!isCancelled && !isReturned && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shipment Delivery Progress</p>
                    
                    {/* Stepper visual bar */}
                    <div className="relative flex justify-between items-center w-full max-w-xl mx-auto pt-2">
                      <div className="absolute top-4.5 left-2 right-2 h-1 bg-slate-100 -z-10" />
                      <div 
                        className="absolute top-4.5 left-2 h-1 bg-emerald-500 -z-10 transition-all duration-500"
                        style={{ width: `${(stepIdx / (TRACKING_STEPS.length - 1)) * 100}%` }}
                      />

                      {TRACKING_STEPS.map((step, idx) => {
                        const isDone = stepIdx >= idx;
                        const isActive = stepIdx === idx;
                        return (
                          <div key={step} className="flex flex-col items-center gap-1.5 shrink-0 text-center">
                            <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center border font-mono text-[10px] font-bold shadow-sm transition-all ${
                              isActive 
                                ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100 animate-pulse' 
                                : isDone 
                                ? 'bg-emerald-500 text-white border-emerald-500' 
                                : 'bg-white text-slate-300 border-slate-200'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : isDone ? 'text-slate-800' : 'text-slate-300'}`}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled Alert Banner */}
                {isCancelled && (
                  <div className="p-4 rounded-xl border border-red-100 bg-red-50/40 text-red-800 text-xs flex items-start gap-2.5">
                    <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-bold">Order Cancelled & Refracted</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">
                        This order has been successfully marked as cancelled. Any payments captured through card or UPI protocols have been auto-dispatched for refund back into the initial payment method (3-5 banking days).
                      </p>
                    </div>
                  </div>
                )}

                {/* Returned Alert Banner */}
                {isReturned && (
                  <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 text-amber-800 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="font-bold">Return Processing Registered</p>
                      <p className="text-[11px] leading-relaxed mt-0.5">
                        Your request for a physical return/replacement is actively handled by our regional dispatchers. A certified ElectroFix technician will contact you to perform the return inspection.
                      </p>
                    </div>
                  </div>
                )}

                {/* Purchased items card lists */}
                <div className="space-y-3.5 divide-y divide-slate-100 bg-slate-50/30 p-4 rounded-2xl border border-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0">
                      <img
                        src={item.product.image || getFallbackProductImage(item.product.category, item.product.name)}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (e.target.dataset.triedFallback) {
                            e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                          } else {
                            e.target.dataset.triedFallback = "true";
                            e.target.src = getFallbackProductImage(item.product.category, item.product.name);
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-slate-400 font-medium font-mono">Quantity: {item.quantity} × ₹{item.product.price}</p>
                        {item.withInstallation && (
                          <span className="text-[9px] text-blue-600 font-bold block">🛠️ Registered Installation Service</span>
                        )}
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-950">₹{(item.withInstallation ? item.product.price + 49 : item.product.price) * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Actions: Cancel or Return trigger buttons */}
                <div className="flex justify-between items-center pt-2 text-xs font-bold text-slate-500">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Total Value</span>
                    <span className="text-sm font-extrabold text-slate-950 font-mono">₹{order.costs.total}</span>
                  </div>

                  <div className="flex gap-2">
                    {/* Cancel Order enabled ONLY if not Delivered, Cancelled or Returned */}
                    {!isCancelled && !isReturned && order.status !== 'Delivered' && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to cancel this order? This will cancel technician tasks and issue a refund.")) {
                            onCancelOrder(order.orderId);
                          }
                        }}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl transition-all text-xs font-bold cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}

                    {/* Return Order enabled ONLY if status is Delivered */}
                    {order.status === 'Delivered' && (
                      <button
                        onClick={() => setReturnOrderObj(order)}
                        className="px-4 py-2 border border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 rounded-xl transition-all text-xs font-bold cursor-pointer flex items-center gap-1.5"
                      >
                        <CornerUpLeft className="h-3.5 w-3.5" />
                        <span>Return or Replace</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* RENDER INVOICE MODAL SHEET */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-150 animate-in zoom-in-95">
            {/* Modal Close */}
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <Trash2 className="h-5 w-5 rotate-45" /> {/* Close Cross indicator */}
            </button>

            {/* Printable Frame Area */}
            <div id="printable-invoice" className="space-y-6">
              
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold font-display text-blue-600 tracking-tight">ELECTROFIX CARE</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Premium Spares & Technical Services</p>
                  <p className="text-[9px] text-slate-400">License ID: EF-TX-583-Z89 | Tax No: GST-NY-7491-0</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tax Invoice Receipt</p>
                  <p className="text-xs font-mono font-extrabold text-slate-900">{selectedInvoice.orderId}</p>
                  <p className="text-[10px] text-slate-500">Date Issued: {selectedInvoice.date}</p>
                </div>
              </div>

              {/* Billing and Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] text-slate-500 leading-normal">
                <div className="space-y-1 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billing & Shipping To:</span>
                  <p className="font-extrabold text-slate-900 text-xs">{selectedInvoice.shippingAddress.fullname}</p>
                  <p>{selectedInvoice.shippingAddress.address}</p>
                  <p>{selectedInvoice.shippingAddress.city}, {selectedInvoice.shippingAddress.state} {selectedInvoice.shippingAddress.zipcode}</p>
                  <p>Contact: {selectedInvoice.shippingAddress.phone}</p>
                  <p className="truncate">Email: {selectedInvoice.shippingAddress.email}</p>
                </div>
                <div className="space-y-1 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment & Logistics Details:</span>
                  <p className="font-bold text-slate-800">Method: <span className="uppercase text-slate-950 font-mono">{selectedInvoice.paymentDetails.method}</span></p>
                  <p className="font-mono text-[10px]">Credential Tag: {selectedInvoice.paymentDetails.last4}</p>
                  <p>Shipping Option: {selectedInvoice.estimatedDays === 1 ? 'Next-Day Rush' : selectedInvoice.estimatedDays === 2 ? 'Express Carrier' : 'Standard Ground'}</p>
                  <p className="text-emerald-600 font-bold flex items-center gap-1 mt-1.5 text-[10px]"><ShieldCheck className="h-3.5 w-3.5" /> Direct Original Parts Warranty Protected</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200">
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {selectedInvoice.items.map((item, idx) => {
                      const base = item.product.price;
                      const unit = item.withInstallation ? base + 49 : base;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/20">
                          <td className="p-3">
                            <p className="font-extrabold text-slate-900">{item.product.name}</p>
                            <p className="text-[10px] text-slate-400">Brand: {item.product.brand}</p>
                            {item.withInstallation && (
                              <p className="text-[9px] text-blue-600 font-bold flex items-center gap-0.5">🛠️ Includes technician installation setup</p>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono text-slate-500">₹{unit}</td>
                          <td className="p-3 text-center font-mono text-slate-800">{item.quantity}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">₹{unit * item.quantity}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cost Calculations Box */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2 text-xs font-semibold text-slate-600 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-slate-950">₹{selectedInvoice.costs.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span className="font-mono font-bold text-slate-950">₹{selectedInvoice.costs.taxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Surcharge</span>
                    <span className="font-mono font-bold text-slate-950">₹{selectedInvoice.costs.deliveryFee}</span>
                  </div>
                  {selectedInvoice.costs.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>Promo Discount</span>
                      <span className="font-mono font-bold">-₹{selectedInvoice.costs.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                    <span>Total Transacted</span>
                    <span className="font-mono text-blue-600 text-sm">₹{selectedInvoice.costs.total}</span>
                  </div>
                </div>
              </div>

              {/* Footnote */}
              <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400 leading-normal">
                <p>This is a computer-generated tax invoice. No signature required. Thank you for choosing ElectroFix Care!</p>
                <p>For support, contact <span className="font-bold text-slate-600">support@electrofix.com</span> or call toll-free ElectroFix Helpline.</p>
              </div>

            </div>

            {/* Print and Download Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 mt-6">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENDER RETURN MODAL POPUP */}
      {returnOrderObj && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleReturnSubmit} className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <h3 className="font-display text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <CornerUpLeft className="h-5 w-5 text-amber-600" />
              <span>Return / Replacement Claim Request</span>
            </h3>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-150 text-[11px] text-slate-500 font-medium">
              Claiming on Order: <span className="font-mono font-bold text-slate-800">{returnOrderObj.orderId}</span>
            </div>

            <div className="space-y-3">
              {/* Claim Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requested Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnType('refund')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      returnType === 'refund' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Full Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => setReturnType('replacement')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      returnType === 'replacement' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Product Replacement
                  </button>
                </div>
              </div>

              {/* Return Reason */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reason for Claim</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="defective">Defective / Faulty Spare Part</option>
                  <option value="incorrect">Wrong Size / Model Discrepancy</option>
                  <option value="damaged">Damaged in Transit / Cracked Plastic</option>
                  <option value="unneeded">No Longer Required</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Elaborate Damage / Return details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tell us what's wrong with the part/device so we can alert the dispatch team..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnOrderObj(null)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer text-slate-500"
              >
                Cancel Claim
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Submit Return File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
