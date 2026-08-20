import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, DeliveryStatus } from '../../store/useStore';
import { formatCurrency, formatDateTime, timeAgo, speakPaymentConfirmation, playSuccessSound } from '../../utils/helpers';
import { StatusBadge, LiveBadge } from '../../components/ui/Badge';
import {
  Search, ChevronDown, ChevronUp, User, Phone, Mail,
  CheckCircle, Package, XCircle, RefreshCw,
  Bell, ShoppingBag, Lock
} from 'lucide-react';

const STATUS_ACTIONS: Record<string, { label: string; next: DeliveryStatus; color: string }[]> = {
  ordered: [
    { label: '👨‍🍳 Start Preparing', next: 'preparing', color: 'from-yellow-600 to-amber-600' },
    { label: '❌ Cancel', next: 'cancelled', color: 'from-red-600 to-rose-600' },
  ],
  preparing: [
    { label: '🔔 Mark Ready', next: 'ready', color: 'from-purple-600 to-violet-600' },
    { label: '❌ Cancel', next: 'cancelled', color: 'from-red-600 to-rose-600' },
  ],
  ready: [
    { label: '✅ Mark Delivered', next: 'delivered', color: 'from-green-600 to-emerald-600' },
  ],
};

export const AdminOrders: React.FC = () => {
  const { selectedInstitution, getInstitutionOrders, updateOrder } = useStore();
  const orders = getInstitutionOrders(selectedInstitution?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders
    .filter(o => o.paymentStatus === 'paid')
    .filter(o => statusFilter === 'all' || o.deliveryStatus === statusFilter)
    .filter(o => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return o.orderId.toLowerCase().includes(q) ||
        o.userName.toLowerCase().includes(q) ||
        o.userPhone.includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q));
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusUpdate = async (orderId: string, newStatus: DeliveryStatus, amount: number, orderOrderId: string) => {
    setUpdatingOrder(orderId);
    await new Promise(r => setTimeout(r, 600));

    const updates: any = { deliveryStatus: newStatus, updatedAt: new Date().toISOString() };
    if (newStatus === 'delivered') {
      updates.locked = true;
      updates.deliveredAt = new Date().toISOString();
      playSuccessSound();
      speakPaymentConfirmation(amount, orderOrderId);
    }
    updateOrder(orderId, updates);
    setUpdatingOrder(null);

    if (newStatus === 'delivered') {
      setExpandedOrder(null);
    }
  };

  const counts = {
    ordered: filteredOrders.filter(o => o.deliveryStatus === 'ordered').length,
    preparing: filteredOrders.filter(o => o.deliveryStatus === 'preparing').length,
    ready: filteredOrders.filter(o => o.deliveryStatus === 'ready').length,
    delivered: filteredOrders.filter(o => o.deliveryStatus === 'delivered').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ordered': return <ShoppingBag className="w-4 h-4" />;
      case 'preparing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'ready': return <Bell className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Live Orders</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage and process canteen orders</p>
        </div>
        <LiveBadge label={`${filteredOrders.filter(o => ['ordered','preparing','ready'].includes(o.deliveryStatus)).length} Active`} />
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'ordered', label: 'New Orders', icon: <ShoppingBag className="w-4 h-4" />, color: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
          { key: 'preparing', label: 'Preparing', icon: <RefreshCw className="w-4 h-4" />, color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' },
          { key: 'ready', label: 'Ready', icon: <Bell className="w-4 h-4" />, color: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
          { key: 'delivered', label: 'Delivered', icon: <CheckCircle className="w-4 h-4" />, color: 'border-green-500/40 bg-green-500/10 text-green-400' },
        ].map(item => (
          <motion.button
            key={item.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter(statusFilter === item.key ? 'all' : item.key)}
            className={`rounded-2xl border p-4 text-left transition-all ${statusFilter === item.key ? item.color : 'border-white/10 bg-white/5'}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${statusFilter === item.key ? '' : 'text-gray-400'}`}>
              {item.icon}
              <span className="text-xs font-semibold">{item.label}</span>
            </div>
            <p className={`text-2xl font-black ${statusFilter === item.key ? '' : 'text-white'}`}>
              {counts[item.key as keyof typeof counts] || 0}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search orders, customers, items..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        >
          <option value="all">All Status</option>
          <option value="ordered">Ordered</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredOrders.map((order, i) => {
            const isExpanded = expandedOrder === order.id;
            const isDelivered = order.deliveryStatus === 'delivered';
            const isCancelled = order.deliveryStatus === 'cancelled';
            const actions = STATUS_ACTIONS[order.deliveryStatus] || [];
            const isUpdating = updatingOrder === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isDelivered
                    ? 'bg-gray-900/30 border-gray-600/20 opacity-70'
                    : isCancelled
                    ? 'bg-red-900/15 border-red-500/15 opacity-60'
                    : order.deliveryStatus === 'ready'
                    ? 'bg-purple-500/5 border-purple-500/30 shadow-lg shadow-purple-500/5'
                    : order.deliveryStatus === 'ordered'
                    ? 'bg-blue-500/5 border-blue-500/25'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {/* Order Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-white/3 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDelivered ? 'bg-gray-700' : isCancelled ? 'bg-red-900/40' :
                      order.deliveryStatus === 'ready' ? 'bg-purple-500/20' :
                      order.deliveryStatus === 'preparing' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {isUpdating ? (
                        <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
                      ) : getStatusIcon(order.deliveryStatus)}
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-white text-sm">#{order.orderId}</span>
                        <StatusBadge status={order.deliveryStatus} pulse={!isDelivered && !isCancelled} />
                        {isDelivered && <Lock className="w-3 h-3 text-gray-500" />}
                      </div>
                      <p className="text-gray-300 text-xs mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" /> {order.userName}
                        <span className="text-gray-500">•</span>
                        <Phone className="w-3 h-3" /> {order.userPhone}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        {order.items.map(i => `${i.name} ×${i.quantity}`).join(' • ')}
                      </p>
                    </div>

                    {/* Amount & Time */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-black text-sm">{formatCurrency(order.amount)}</p>
                      <p className="text-gray-400 text-xs">{timeAgo(order.createdAt)}</p>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 mt-1 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-white/8 p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Customer Details */}
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Customer Details</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-white">{order.userName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-white">{order.userPhone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-300 text-xs">{order.userEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Payment Details</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Status</span>
                            <StatusBadge status={order.paymentStatus} />
                          </div>
                          {order.upiTransactionId && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">TXN ID</span>
                              <span className="text-white font-mono text-xs">{order.upiTransactionId}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Method</span>
                            <span className="text-white">{order.paymentMethod || 'UPI'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Placed</span>
                            <span className="text-white text-xs">{formatDateTime(order.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white/5 rounded-xl p-3 mb-4">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Order Items</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🍽️</span>
                              <div>
                                <p className="text-white text-sm font-medium">{item.name}</p>
                                <p className="text-gray-400 text-xs">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                              </div>
                            </div>
                            <span className="text-violet-300 font-bold text-sm">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/10 mt-3 pt-2 flex justify-between">
                        <span className="text-gray-400 text-sm">Total</span>
                        <span className="text-white font-black">{formatCurrency(order.amount)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {actions.length > 0 && !isDelivered && !isCancelled && (
                      <div className="flex gap-2 flex-wrap">
                        {actions.map(action => (
                          <motion.button
                            key={action.next}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStatusUpdate(order.id, action.next, order.amount, order.orderId)}
                            disabled={isUpdating}
                            className={`flex-1 min-w-[140px] py-2.5 bg-gradient-to-r ${action.color} rounded-xl font-semibold text-white text-sm shadow-lg disabled:opacity-60 flex items-center justify-center gap-2`}
                          >
                            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {isDelivered && (
                      <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <Lock className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-green-300 font-semibold text-sm">Order Permanently Locked</p>
                          <p className="text-gray-400 text-xs">Delivered at {order.deliveredAt ? formatDateTime(order.deliveredAt) : 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No orders found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
