import { motion } from 'motion/react';
import { Heart, ShoppingCart, Trash2, Grid, ArrowRight } from 'lucide-react';
import { getFallbackProductImage } from '../../utils/shopData';

export default function WishlistView({ 
  wishlist, 
  onAddToCart, 
  onRemoveFromWishlist, 
  onBackToShop, 
  onViewDetails 
}) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            <span>My Wishlist</span>
            <span className="text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full font-mono">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Products you saved for future consideration. Add them to your cart at any time.
          </p>
        </div>

        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all uppercase tracking-wider shadow-sm"
        >
          <Grid className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </button>
      </div>

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-24 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/30 max-w-lg mx-auto px-6 space-y-5"
        >
          <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-100 shadow-sm animate-pulse">
            <Heart className="h-8 w-8" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-extrabold text-slate-900">Your wishlist is empty</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Explore our catalog of certified electrical spare parts and premium home appliances to add favorites!
            </p>
          </div>
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-blue-600/10 transition-all hover:scale-[1.02]"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
            >
              <div className="relative aspect-video bg-slate-50 overflow-hidden cursor-pointer flex items-center justify-center p-4 border-b border-slate-50" onClick={() => onViewDetails(product)}>
                <img
                  src={product.image || getFallbackProductImage(product.category, product.name)}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    if (e.target.dataset.triedFallback) {
                      e.target.src = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";
                    } else {
                      e.target.dataset.triedFallback = "true";
                      e.target.src = getFallbackProductImage(product.category, product.name);
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromWishlist(product);
                  }}
                  className="absolute top-3 right-3 h-8.5 w-8.5 bg-white/90 backdrop-blur-xs hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-100 rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50/50 px-2 py-0.5 rounded-md">
                    {product.brand}
                  </span>
                  <h3 
                    onClick={() => onViewDetails(product)}
                    className="font-sans font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors line-clamp-2 leading-snug"
                  >
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-slate-400">Price</span>
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs hover:shadow-sm"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
