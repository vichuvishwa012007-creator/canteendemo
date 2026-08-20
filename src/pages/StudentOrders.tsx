import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDateTime, timeAgo } from '../utils/helpers';
import { StatusBadge } from '../components/ui/Badge';
import { ArrowLeft, Package, ShoppingBag, ChevronRight, Lock, Clock, Receipt } from 'lucide-react';

export const StudentOrders: React.FC = () => {
  const { currentUser, orders, selectedInstitution, setPage, setActiveOrder } = useStore();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Scoped to the current user at the current institution. Previously this
  // had `|| true` tacked onto the userId check, which always evaluated to
  // true and leaked every student's order history (amounts, UPI txn IDs,
  // etc.) to any logged-in user.
  const myOrders = orders
    .filter(o => o.institutionId === selectedInstitution?.id && o.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const handleViewOrder = (order: typeof myOrders[0]) => {
    setActiveOrder(order);
    setPage('student-order-status');
  };

  return (
    <div className="min-h-screen bg-[#0a0614] text-white pb-8">
      <div className="sticky top-0 z-40 bg-[#0a0614]/95 backdrop-blur-xl border-b border-white/8 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => setPage('student-menu')} className="p-2 rounded-xl bg-white/8 hover:bg-white/15 text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Order History</h1>
            <p className="text-xs text-gray-400">{selectedInstitution?.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {myOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
            <p className="text-gray-400 mb-6">Place your first order from the menu</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPage('student-menu')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-white"
            >
              Browse Menu
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {myOrders.map((order, i) => {
              const isDelivered = order.deliveryStatus === 'delivered';
              const isCancelled = order.deliveryStatus === 'cancelled';
              const isExpanded = expandedOrder === order.id;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                    isDelivered
                      ? 'bg-gray-900/40 border-gray-600/25 opacity-75'
                      : isCancelled
                      ? 'bg-red-900/20 border-red-500/20 opacity-60'
                      : 'bg-white/5 border-white/10 hover:border-violet-500/30'
                  }`}
                >
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDelivered ? 'bg-gray-700' : isCancelled ? 'bg-red-900/40' : 'bg-violet-600/20'}`}>
                        {isDelivered ? <Lock className="w-4 h-4 text-gray-400" /> : <Receipt className="w-4 h-4 text-violet-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm ${isDelivered ? 'text-gray-400' : 'text-white'}`}>
                            Order #{order.orderId}
                          </p>
                          {isDelivered && <Lock className="w-3 h-3 text-gray-500" />}
                        </div>
                        <p className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`font-black text-sm ${isDelivered ? 'text-gray-500' : 'text-white'}`}>
                          {formatCurrency(order.amount)}
                        </p>
                        <StatusBadge status={order.deliveryStatus} className="text-xs" />
                      </div>
                      <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/8 px-4 py-4"
                    >
                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">🍽️</span>
                              <div>
                                <p className={`text-sm font-medium ${isDelivered ? 'text-gray-400' : 'text-white'}`}>{item.name}</p>
                                <p className="text-gray-500 text-xs">× {item.quantity}</p>
                              </div>
                            </div>
                            <p className={`text-sm font-semibold ${isDelivered ? 'text-gray-500' : 'text-violet-300'}`}>
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Bill Receipt - Black & White when delivered */}
                      <div className={`rounded-xl p-4 mb-4 ${isDelivered ? 'bg-gray-800/50 border border-gray-600/30' : 'bg-white/5 border border-white/10'}`}>
                        <div className="text-center mb-3">
                          <p className={`text-xs font-bold ${isDelivered ? 'text-gray-400' : 'text-gray-300'}`}>
                            ═══ RECEIPT ═══
                          </p>
                          <p className={`text-xs ${isDelivered ? 'text-gray-500' : 'text-gray-400'}`}>{selectedInstitution?.name}</p>
                          <p className={`text-xs ${isDelivered ? 'text-gray-600' : 'text-gray-500'}`}>{formatDateTime(order.createdAt)}</p>
                        </div>

                        <div className={`border-t border-dashed ${isDelivered ? 'border-gray-600' : 'border-white/15'} pt-2 space-y-1`}>
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span className={isDelivered ? 'text-gray-500' : 'text-gray-300'}>{item.name} x{item.quantity}</span>
                              <span className={isDelivered ? 'text-gray-400' : 'text-white'}>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className={`border-t border-dashed ${isDelivered ? 'border-gray-600' : 'border-white/15'} mt-2 pt-2`}>
                          <div className="flex justify-between">
                            <span className={`font-bold text-sm ${isDelivered ? 'text-gray-400' : 'text-white'}`}>TOTAL</span>
                            <span className={`font-black text-sm ${isDelivered ? 'text-gray-300' : 'text-white'}`}>{formatCurrency(order.amount)}</span>
                          </div>
                          <div className="flex justify-between mt-1 text-xs">
                            <span className={isDelivered ? 'text-gray-600' : 'text-gray-400'}>Payment</span>
                            <span className={isDelivered ? 'text-gray-500' : 'text-green-400'}>{order.paymentStatus === 'paid' ? '✓ PAID via UPI' : 'Pending'}</span>
                          </div>
                          {order.upiTransactionId && (
                            <div className="flex justify-between mt-1 text-xs">
                              <span className={isDelivered ? 'text-gray-600' : 'text-gray-400'}>TXN ID</span>
                              <span className={`font-mono ${isDelivered ? 'text-gray-500' : 'text-gray-300'}`}>{order.upiTransactionId}</span>
                            </div>
                          )}
                        </div>

                        {isDelivered && (
                          <div className="text-center mt-3 pt-2 border-t border-dashed border-gray-600">
                            <p className="text-gray-500 text-xs font-bold">✓ ORDER CLOSED • DELIVERED</p>
                            {order.deliveredAt && <p className="text-gray-600 text-xs">{formatDateTime(order.deliveredAt)}</p>}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isDelivered && !isCancelled && order.paymentStatus === 'paid' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleViewOrder(order)}
                          className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Track Live Order
                        </motion.button>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentOrders;