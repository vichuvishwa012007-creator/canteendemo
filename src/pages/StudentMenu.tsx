import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import {
  Search, Plus, Minus, ShoppingCart, LogOut, Clock,
  Leaf, Flame, Package, ChevronRight, User, History, Star
} from 'lucide-react';
import { LiveBadge } from '../components/ui/Badge';
import { ReviewModal } from './ReviewModal';

// Determines whether an institution "logo" value is an image path/URL
// (e.g. "/images/SAEC 150x150.avif") vs. a literal emoji/character.
const isImageLogo = (logo?: string) => {
  if (!logo) return false;
  return logo.startsWith('/') || logo.startsWith('http://') || logo.startsWith('https://') || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(logo);
};

export const StudentMenu: React.FC = () => {
  const {
    currentUser, selectedInstitution, getInstitutionMenu,
    cart, addToCart, updateCartQuantity, getCartTotal, getCartCount,
    setPage, logout, cartOpen, setCartOpen, addReview
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const menuItems = getInstitutionMenu(selectedInstitution?.id || '');

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchVeg = !vegOnly || item.veg;
      return matchSearch && matchCategory && matchVeg && item.available;
    });
  }, [menuItems, searchQuery, activeCategory, vegOnly]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(menuItems.map(i => i.category))];
    return cats;
  }, [menuItems]);

  const getCartItemQty = (itemId: string) => {
    return cart.find(c => c.menuItem.id === itemId)?.quantity || 0;
  };

  // Saves the review to the store so the admin dashboard can read it via
  // getInstitutionReviews(selectedInstitution.id).
  const handleReviewSubmit = async (rating: number, reviewText: string) => {
    if (!currentUser || !selectedInstitution) {
      console.error('Cannot submit review: user not logged in or no institution selected');
      return;
    }

    addReview({
      id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      institutionId: selectedInstitution.id,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      reviewText,
      createdAt: new Date().toISOString(),
    });
  };

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  return (
    <div className="min-h-screen bg-[#0a0614] text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0614]/95 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {selectedInstitution && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xl overflow-hidden shrink-0"
                  style={{ backgroundColor: `${selectedInstitution.color}25`, border: `1px solid ${selectedInstitution.color}40` }}
                >
                  {isImageLogo(selectedInstitution.logo) ? (
                    <img
                      src={selectedInstitution.logo}
                      alt={selectedInstitution.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    selectedInstitution.logo
                  )}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base font-bold text-white leading-tight truncate">
                  {selectedInstitution?.name || 'SmartCanteen'}
                </h1>
                <div className="flex items-center gap-2">
                  <LiveBadge label="LIVE" className="text-xs" />
                  <span className="text-xs text-gray-400 whitespace-nowrap">{menuItems.filter(i => i.available).length} items available</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setReviewOpen(true)}
                title="Rate & Review"
                className="p-2.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-yellow-400 transition-all"
              >
                <Star className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage('student-orders')}
                className="p-2.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white transition-all"
              >
                <History className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logout()}
                className="p-2.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* User greeting */}
          {currentUser && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-400">Hi, <span className="text-violet-300 font-medium">{currentUser.name}</span></span>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search food, snacks, beverages..."
              className="w-full bg-white/8 border border-white/12 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white/8 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1 ${
                vegOnly ? 'bg-green-600 text-white' : 'bg-white/8 text-gray-400 border border-white/10'
              }`}
            >
              <Leaf className="w-3 h-3" /> Veg
            </button>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No items found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item, i) => {
              const qty = getCartItemQty(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${item.veg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {item.veg ? '🟢' : '🔴'}
                      </span>
                      {item.popular && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white text-xs font-bold flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" /> Hot
                        </span>
                      )}
                    </div>

                    {/* Prep time */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
                      <Clock className="w-3 h-3 text-gray-300" />
                      <span className="text-xs text-gray-300">{item.prepTime}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-bold text-white text-sm leading-tight mb-0.5 truncate">{item.name}</h3>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-1">{item.description}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-white">{formatCurrency(item.price)}</span>

                      {qty === 0 ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(item)}
                          className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </motion.button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCartQuantity(item.id, qty - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-600/30 border border-violet-500/40 text-violet-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </motion.button>
                          <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(item)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-600 text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart FAB */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-4 right-4 z-50 max-w-lg mx-auto"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCartOpen(true)}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-4 shadow-2xl shadow-violet-500/40 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full text-xs font-bold text-white flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
                <span className="font-semibold text-white">{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-lg">{formatCurrency(cartTotal)}</span>
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0f0a1e] border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-violet-400" />
                  Your Cart
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-all">
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.map(item => (
                  <div key={item.menuItem.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                    <img src={item.menuItem.image} alt={item.menuItem.name}
                      className="w-14 h-14 rounded-lg object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{item.menuItem.name}</p>
                      <p className="text-violet-300 font-bold text-sm">{formatCurrency(item.menuItem.price)} × {item.quantity}</p>
                      <p className="text-white font-black text-sm">{formatCurrency(item.menuItem.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-600 text-white transition-all">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-white/10 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Subtotal ({cartCount} items)</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Platform fee</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-white font-black text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setCartOpen(false); setPage('student-checkout'); }}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-bold text-white text-lg shadow-2xl shadow-violet-500/30"
                >
                  Proceed to Checkout → {formatCurrency(cartTotal)}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        institutionName={selectedInstitution?.name}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default StudentMenu;