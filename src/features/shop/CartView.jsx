// CartView.jsx - Shopping Cart Overview and Totals
import { useState } from 'react';
import { Trash2, Heart, Plus, Minus, Tag, ShieldCheck, ArrowRight, ShoppingBag, Check } from 'lucide-react';
import { getFallbackProductImage } from '../../utils/shopData';

export default function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onSaveForLater, // moves item to wishlist
  onToggleInstallation, // handles adding installation service
  onProceedToCheckout,
  onBackToShop,
  promoDiscount,
  appliedPromo,
  onApplyPromo
}) {
  const [couponCode, setCouponCode] = useState('');
  const [promoSuccessMsg, setPromoSuccessMsg] = useState('');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Calculations
  const rawSubtotal = cart.reduce((acc, item) => {
    let itemCost = item.product.price;
    if (item.withInstallation) {
      itemCost += 49;
    }
    return acc + (itemCost * item.quantity);
  }, 0);

  // Taxes (5%)
  const taxes = Math.round(rawSubtotal * 0.05);

  // Shipping defaults to free standard unless upgraded at checkout
  const shippingCharge = appliedPromo === 'FREESHIP' ? 0 : 0;

  // Coupon Discounts
  let discountAmount = 0;
  if (appliedPromo === 'FIX20') {
    discountAmount = Math.round(rawSubtotal * 0.20);
  } else if (appliedPromo === 'SAVE50') {
    discountAmount = rawSubtotal >= 200 ? 50 : 0;
  }

  const grandTotal = rawSubtotal + taxes + shippingCharge - discountAmount;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'FIX20') {
      onApplyPromo('FIX20');
      setPromoSuccessMsg("PROMO SAVED: 20% discount applied!");
    } else if (code === 'SAVE50') {
      if (rawSubtotal < 200) {
        alert("Coupon 'SAVE50' requires a minimum purchase amount of ₹200 before taxes.");
      } else {
        onApplyPromo('SAVE50');
        setPromoSuccessMsg("PROMO SAVED: ₹50 discount applied!");
      }
    } else if (code === 'FREESHIP') {
      onApplyPromo('FREESHIP');
      setPromoSuccessMsg("PROMO SAVED: Free express delivery unlocked!");
    } else {
      alert("Invalid Code. Try: 'FIX20' for 20% off or 'SAVE50' for ₹50 off (on orders > ₹200)!");
    }
    setCouponCode('');
    setTimeout(() => {
      setPromoSuccessMsg('');
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-150 pb-4">
        <h2 className="text-xl font-extrabold font-display text-slate-900 flex items-center gap-2">
          <ShoppingBag className="h-5.5 w-5.5 text-blue-600" />
          <span>Shopping Cart</span>
          <span className="text-sm font-bold text-slate-400">({cartCount} items)</span>
        </h2>
        <button
          onClick={onBackToShop}
          className="text-xs font-extrabold text-blue-600 hover:text-blue-700 uppercase tracking-wider cursor-pointer"
        >
          Add more products
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 bg-slate-50/50">
          <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 stroke-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">Your shopping cart is empty</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ready to construct or fix? Browse our catalog for original spare parts, switches, wiring accessories, or appliances.
            </p>
          </div>
          <button
            onClick={onBackToShop}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cart items list */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const basePrice = item.product.price;
              const unitPrice = item.withInstallation ? basePrice + 49 : basePrice;
              const totalItemPrice = unitPrice * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.withInstallation ? 'install' : 'standard'}`}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-sm animate-fade-in"
                >
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.product.image || getFallbackProductImage(item.product.category, item.product.name)}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-100"
                      onError={(e) => {
                        if (e.target.dataset.triedFallback) {
                          e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                        } else {
                          e.target.dataset.triedFallback = "true";
                          e.target.src = getFallbackProductImage(item.product.category, item.product.name);
                        }
                      }}
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block mb-0.5">
                        {item.product.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">Brand: {item.product.brand}</p>
                      
                      {/* Buy with installation tag */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => onToggleInstallation(item.product.id)}
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
                            item.withInstallation
                              ? 'bg-blue-50 border-blue-100 text-blue-600'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <span>🛠️ {item.withInstallation ? 'Installation Added (+₹49)' : 'Add Professional Installation (+₹49)'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Prices */}
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-6 sm:gap-10 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.withInstallation, -1)}
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-800 font-mono w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.withInstallation, 1)}
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-slate-950 font-mono">₹{totalItemPrice}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-400 font-mono">₹{unitPrice} each</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSaveForLater(item)}
                        className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                        title="Save for Later (Wishlist)"
                      >
                        <Heart className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.withInstallation)}
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-100 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing calculations card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Cart Summary</h3>
              
              {/* Promo input */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Have a promo code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. FIX20, SAVE50"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none uppercase bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccessMsg && (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><Check className="h-3 w-3" /> {promoSuccessMsg}</p>
                )}
                {appliedPromo && !promoSuccessMsg && (
                  <p className="text-[10px] text-slate-500">Promo <span className="font-mono font-bold text-blue-600">[{appliedPromo}]</span> currently applied.</p>
                )}
              </form>

              {/* Price list */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-mono font-bold text-slate-950">₹{rawSubtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST/Sales Tax (5%)</span>
                  <span className="font-mono font-bold text-slate-950">₹{taxes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ground Eco-Shipping</span>
                  <span className="text-emerald-600 font-bold uppercase tracking-wider">FREE</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Coupon Savings</span>
                    <span className="font-mono">-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-3 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="font-mono text-base">₹{grandTotal}</span>
                </div>
              </div>

              {/* Secure Checkout button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/15 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Secure Bank-Grade Gateway</span>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 text-[11px] text-blue-800 leading-relaxed space-y-1">
              <p className="font-extrabold uppercase tracking-wider text-[9px] text-blue-600 flex items-center gap-1">💡 Super Saving Tip</p>
              <p>Apply coupon <span className="font-mono font-bold">FIX20</span> to save 20% flat discount on your total spare parts order! No minimum amount required.</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
