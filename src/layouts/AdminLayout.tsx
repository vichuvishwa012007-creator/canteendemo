import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  BarChart3, ShoppingBag, Menu, ChefHat, LogOut,
  Shield, TrendingUp, Bell, ChevronRight, Star
} from 'lucide-react';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminMenu } from '../pages/admin/AdminMenu';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';
import { AdminReviewsModal } from '../pages/admin/AdminReviewsModal';
import { LiveBadge } from '../components/ui/Badge';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'orders', label: 'Live Orders', icon: ShoppingBag, badge: true },
  { id: 'menu', label: 'Menu', icon: ChefHat },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

// Renders inst.logo as an <img> when it's a file path/URL, otherwise as emoji text
const InstitutionLogo: React.FC<{ logo: string; alt: string }> = ({ logo, alt }) => {
  const isImagePath = logo.startsWith('/') || logo.startsWith('http');
  if (isImagePath) {
    return <img src={logo} alt={alt} className="w-full h-full object-cover" />;
  }
  return <>{logo}</>;
};

export const AdminLayout: React.FC = () => {
  const {
    adminPage, setAdminPage, sidebarOpen, setSidebarOpen,
    logout, selectedInstitution, currentUser, getInstitutionOrders,
    getInstitutionReviews, getInstitutionRating
  } = useStore();

  const [reviewsOpen, setReviewsOpen] = useState(false);

  const orders = getInstitutionOrders(selectedInstitution?.id || '');
  const activeOrderCount = orders.filter(o =>
    o.paymentStatus === 'paid' && ['ordered', 'preparing', 'ready'].includes(o.deliveryStatus)
  ).length;

  const institutionReviews = getInstitutionReviews(selectedInstitution?.id || '');
  const institutionRating = getInstitutionRating(selectedInstitution?.id || '');

  const renderPage = () => {
    switch (adminPage) {
      case 'dashboard': return <AdminDashboard />;
      case 'orders': return <AdminOrders />;
      case 'menu': return <AdminMenu />;
      case 'analytics': return <AdminAnalytics />;
      default: return <AdminDashboard />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/8">
        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-black text-white">SmartCanteen</div>
          <div className="text-xs text-gray-400">Admin Portal</div>
        </div>
      </div>

      {/* Institution */}
      {selectedInstitution && (
        <div className="px-4 py-4 border-b border-white/8">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: `${selectedInstitution.color}25` }}>
              <InstitutionLogo logo={selectedInstitution.logo} alt={selectedInstitution.name} />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{selectedInstitution.name}</p>
              <p className="text-gray-400 text-xs">{selectedInstitution.code}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = adminPage === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setAdminPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && activeOrderCount > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {activeOrderCount > 9 ? '9+' : activeOrderCount}
                </span>
              )}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
            </motion.button>
          );
        })}

        {/* Reviews — opens a modal instead of switching pages, so it's usable from anywhere */}
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setReviewsOpen(true); setSidebarOpen(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        >
          <Star className="w-4 h-4 flex-shrink-0" />
          <span>Reviews</span>
          {institutionReviews.length > 0 && (
            <span className="ml-auto bg-yellow-500/25 text-yellow-300 text-xs font-bold rounded-full px-2 py-0.5 flex-shrink-0">
              {institutionReviews.length}
            </span>
          )}
        </motion.button>
      </nav>

      {/* Admin Info & Logout */}
      <div className="border-t border-white/8 p-4 space-y-3">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
          <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center text-sm font-bold text-white">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
            <p className="text-gray-400 text-xs truncate">{currentUser?.email}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0614] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white/3 border-r border-white/8 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#0f0a1e] border-r border-white/10 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0a0614]/95 backdrop-blur-xl border-b border-white/8 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="font-bold text-white text-sm capitalize">
                  {NAV_ITEMS.find(n => n.id === adminPage)?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-400">{selectedInstitution?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LiveBadge />
              {activeOrderCount > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/15 border border-orange-500/30 rounded-xl"
                >
                  <Bell className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-300 text-xs font-semibold">{activeOrderCount} pending</span>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            key={adminPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </main>
      </div>

      {/* Reviews Modal — lives at the layout level so it works from every admin page */}
      <AdminReviewsModal
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        reviews={institutionReviews}
        averageRating={institutionRating.average}
      />
    </div>
  );
};

export default AdminLayout;