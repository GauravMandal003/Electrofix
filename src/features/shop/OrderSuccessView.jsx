// OrderSuccessView.jsx - Post-Purchase Confirmation and summary
import { CheckCircle, Truck, Calendar, ArrowRight, FileText, ShieldCheck, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

export default function OrderSuccessView({
  order,
  onContinueShopping,
  onTrackOrder
}) {
  if (!order) return null;

  const {
    orderId = 'EF-ORD-10001',
    date = new Date().toLocaleDateString(),
    estimatedDays = 3,
    shippingAddress = {},
    costs = {},
    paymentDetails = {},
    items = [],
    withInstallation = false
  } = order;

  // Calculate estimated delivery date based on order creation
  const getDeliveryDateStr = () => {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + (estimatedDays || 3));
    return delivery.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const paymentId = paymentDetails?.transactionId || order?.transactionId || `DEMO_${Math.floor(Date.now() / 1000)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6 animate-fade-in">
      {/* Confetti Banner */}
      <div className="text-center space-y-3.5">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-md">
          <CheckCircle className="h-10 w-10 animate-bounce" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            Payment Status: SUCCESS (Demo Mode)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 tracking-tight">
            Order Successfully Placed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Thank you for shopping with ElectroFix. Your order has been confirmed and locked for delivery.
          </p>
        </div>
      </div>

      {/* Quick Order Info Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
            <p className="text-xs font-mono font-bold text-slate-900 truncate">{orderId}</p>
            <p className="text-[10px] text-slate-400">Date: {date}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Delivery Date</span>
            <p className="text-xs font-bold text-slate-900">{getDeliveryDateStr()}</p>
            <p className="text-[10px] text-slate-400">Status: Preparing for dispatch</p>
          </div>
        </div>
      </div>

      {/* Item Summary Receipt */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordered Products</h3>
          <span className="text-xs text-slate-400 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
        </div>
        
        {/* Item rows */}
        <div className="space-y-3.5 divide-y divide-slate-100">
          {items.map((item, idx) => {
            const product = item.product || item;
            const price = item.withInstallation ? (product.price || 0) + 49 : (product.price || 0);
            return (
              <div key={idx} className="flex justify-between items-center text-xs pt-3 first:pt-0">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-900">{product.name || 'Component / Accessory'}</p>
                  <div className="flex gap-2 items-center text-[10px] text-slate-400 font-medium">
                    {product.brand && <span>Brand: {product.brand}</span>}
                    {product.brand && <span>•</span>}
                    <span>Qty: {item.quantity || 1}</span>
                    {item.withInstallation && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-bold flex items-center gap-0.5">🛠️ Expert Installation</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-950">₹{(price * (item.quantity || 1)).toLocaleString('en-IN')}</span>
              </div>
            );
          })}
        </div>

        {/* Pricing totals */}
        <div className="space-y-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-mono text-slate-900">₹{(costs.subtotal || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>GST / Sales Tax (5%)</span>
            <span className="font-mono text-slate-900">₹{(costs.taxes || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="font-mono text-slate-900">{costs.deliveryFee === 0 ? 'FREE' : `₹${costs.deliveryFee}`}</span>
          </div>
          {costs.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Promo Discount</span>
              <span className="font-mono">-₹{costs.discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-3 border-t border-slate-200">
            <span>Grand Total</span>
            <span className="font-mono text-base text-blue-600">₹{(costs.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Details Grid: Customer Info, Shipping Address & Payment ID */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Customer & Shipping Information */}
          <div className="p-3.5 rounded-xl bg-slate-50 space-y-1.5 border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <MapPin className="h-3 w-3 text-blue-500" /> Customer & Shipping Info
            </span>
            <p className="font-bold text-slate-900 text-xs">{shippingAddress.fullname || 'ElectroFix Customer'}</p>
            {shippingAddress.email && (
              <p className="text-slate-600 flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 text-slate-400 shrink-0" /> {shippingAddress.email}
              </p>
            )}
            {shippingAddress.phone && (
              <p className="text-slate-600 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400 shrink-0" /> {shippingAddress.phone}
              </p>
            )}
            <p className="text-slate-600 pt-0.5">
              {[shippingAddress.address, shippingAddress.city, shippingAddress.state, shippingAddress.zipcode].filter(Boolean).join(', ')}
            </p>
          </div>

          {/* Payment Details & Demo Payment ID */}
          <div className="p-3.5 rounded-xl bg-slate-50 space-y-1.5 border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-emerald-500" /> Payment Confirmation
            </span>
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-900 text-xs uppercase">{paymentDetails.method || paymentDetails.paymentMethod || 'Demo Payment'}</p>
              <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                SUCCESS
              </span>
            </div>
            
            <div className="pt-1 space-y-0.5">
              <p className="text-[10px] text-slate-400 font-medium">Demo Payment ID:</p>
              <p className="font-mono text-[11px] font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 truncate select-all">
                {paymentId}
              </p>
            </div>

            {paymentDetails.selectedBank && (
              <p className="text-[10px] text-slate-600">Bank: <span className="font-semibold text-slate-800">{paymentDetails.selectedBank}</span></p>
            )}

            <div className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mt-1">
              <ShieldCheck className="h-3 w-3" /> Fully Insured Components
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onTrackOrder}
          className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <FileText className="h-4.5 w-4.5" />
          <span>Track Order Status</span>
        </button>
        <button
          onClick={onContinueShopping}
          className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-600/10"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
