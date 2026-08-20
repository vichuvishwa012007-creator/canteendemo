import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDateTime, timeAgo } from '../utils/helpers';
import { StatusBadge, LiveBadge } from '../components/ui/Badge';
import {
  CheckCircle, Clock, ChefHat, Bell, Package, ShoppingBag,
  ArrowLeft, Shield, Lock, Wifi, AlertTriangle, RefreshCw
} from 'lucide-react';

const ORDER_STEPS = [
  { status: 'pending_payment', label: 'Pending Payment', icon: Clock, color: 'text-orange-400' },
  { status: 'ordered', label: 'Order Placed', icon: CheckCircle, color: 'text-blue-400' },
  { status: 'preparing', label: 'Preparing', icon: ChefHat, color: 'text-yellow-400' },
  { status: 'ready', label: 'Ready to Pickup', icon: Bell, color: 'text-purple-400' },
  { status: 'delivered', label: 'Delivered', icon: Package, color: 'text-green-400' },
];

const STATUS_ORDER = ['pending_payment', 'ordered', 'preparing', 'ready', 'delivered'];

export const StudentOrderStatus: React.FC = () => {
  const { activeOrder, orders, setPage, currentUser } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulseCount, setPulseCount] = useState(0);

  // Get the most recent active (non-delivered, non-cancelled, paid) order
  const myOrders = orders.filter(o => o.userId === currentUser?.id || o.userId === activeOrder?.userId);
  const displayOrder = activeOrder || myOrders.find(o => o.paymentStatus === 'paid' && o.deliveryStatus !== 'cancelled') || myOrders[0];

  // Refresh current time every second for anti-screenshot (live timestamp)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setPulseCount(p => p + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate status progression for demo
  useEffect(() => {
    if (!displayOrder || displayOrder.deliveryStatus === 'delivered' || displayOrder.deliveryStatus === 'cancelled') return;
    if (displayOrder.paymentStatus !== 'paid') return;

    const { updateOrder } = useStore.getState();
    if (displayOrder.deliveryStatus === 'ordered') {
      const t = setTimeout(() => {
        updateOrder(displayOrder.id, { deliveryStatus: 'preparing' });
      }, 15000);
      return () => clearTimeout(t);
    }
    if (displayOrder.deliveryStatus === 'preparing') {
      const t = setTimeout(() => {
        updateOrder(displayOrder.id, { deliveryStatus: 'ready' });
      }, 20000);
      return () => clearTimeout(t);
    }
  }, [displayOrder?.deliveryStatus, displayOrder?.id]);

  if (!displayOrder) {
    return (
      <div className="min-h-screen bg-[#0a0614] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Active Orders</h2>
          <p className="text-gray-400 mb-6">Place an order to track it here</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage('student-menu')}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-white"
          >
            Browse Menu
          </motion.button>
        </div>
      </div>
    );
  }

  const isDelivered = displayOrder.deliveryStatus === 'delivered';
  const isCancelled = displayOrder.deliveryStatus === 'cancelled';
  const isPending = displayOrder.paymentStatus !== 'paid';
  const currentStepIndex = STATUS_ORDER.indexOf(displayOrder.deliveryStatus);

  return (
    <div className={`min-h-screen text-white ${isDelivered ? 'bg-[#0a1a0a]' : isCancelled ? 'bg-[#1a0a0a]' : 'bg-[#0a0614]'}`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {isDelivered ? (
          <div className="absolute inset-0 bg-green-500/3" />
        ) : isCancelled ? (
          <div className="absolute inset-0 bg-red-500/3" />
        ) : (
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        )}
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setPage('student-menu')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={() => setPage('student-orders')} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
            All Orders
          </button>
        </div>

        {/* LIVE indicator - Anti-screenshot protection */}
        {!isDelivered && !isCancelled && !isPending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-green-500/10 border border-green-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <LiveBadge label="🟢 LIVE ORDER ACTIVE" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 text-xs font-bold">CONNECTED</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Live Timestamp:</span>
              <motion.span
                key={Math.floor(pulseCount / 2)}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-green-300 font-mono font-bold"
              >
                {currentTime.toLocaleTimeString('en-IN', { hour12: false })}
              </motion.span>
            </div>
            <div className="mt-2 text-xs text-gray-400 text-center">
              🛡️ Show this LIVE screen at counter — Screenshots rejected
            </div>
          </motion.div>
        )}

        {/* Delivered - locked state */}
        {isDelivered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 bg-gray-500/10 border border-gray-500/30 rounded-2xl p-4 text-center"
          >
            <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-300 font-bold">Order Permanently Locked</p>
            <p className="text-gray-500 text-xs mt-1">Food collected • Cannot be reused</p>
          </motion.div>
        )}

        {/* Cancelled state */}
        {isCancelled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center"
          >
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 font-bold">Order Cancelled</p>
            <p className="text-gray-500 text-xs mt-1">Contact canteen for refund queries</p>
          </motion.div>
        )}

        {/* Main Order Card */}
        <div className={`rounded-2xl border p-5 mb-5 transition-all duration-500 ${
          isDelivered
            ? 'bg-gray-900/50 border-gray-600/30 opacity-75'
            : isCancelled
            ? 'bg-red-900/20 border-red-500/20 opacity-60'
            : 'bg-white/5 border-white/10'
        }`}>
          {/* Order Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-black ${isDelivered ? 'text-gray-400' : 'text-white'}`}>
                Order #{displayOrder.orderId}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">{formatDateTime(displayOrder.createdAt)}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={displayOrder.deliveryStatus} pulse={!isDelivered && !isCancelled} />
              <p className={`text-lg font-black mt-1 ${isDelivered ? 'text-gray-400' : 'text-white'}`}>
                {formatCurrency(displayOrder.amount)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4">
            {displayOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍽️</span>
                  <div>
                    <p className={`text-sm font-semibold ${isDelivered ? 'text-gray-400' : 'text-white'}`}>{item.name}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${isDelivered ? 'text-gray-500' : 'text-violet-300'}`}>
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-3 flex justify-between">
            <div>
              <p className="text-xs text-gray-400">Payment</p>
              <StatusBadge status={displayOrder.paymentStatus} className="mt-1" />
            </div>
            {displayOrder.upiTransactionId && (
              <div className="text-right">
                <p className="text-xs text-gray-400">UPI Ref</p>
                <p className="text-xs text-white font-mono">{displayOrder.upiTransactionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Stepper */}
        {!isCancelled && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
            <h3 className="font-semibold text-white mb-5">Order Progress</h3>
            <div className="space-y-4">
              {ORDER_STEPS.filter(s => s.status !== 'pending_payment').map((step) => {
                const stepIndex = STATUS_ORDER.indexOf(step.status);
                const isCompleted = stepIndex <= currentStepIndex;
                const isActive = stepIndex === currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.status} className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      isCompleted
                        ? 'bg-violet-600 border-violet-500 shadow-lg shadow-violet-500/30'
                        : 'bg-white/5 border-white/20'
                    }`}>
                      {isActive && !isDelivered ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-4 h-4 text-violet-300" />
                        </motion.div>
                      ) : (
                        <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-sm ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                      {isActive && !isDelivered && (
                        <motion.p
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-xs text-violet-400"
                        >
                          In progress...
                        </motion.p>
                      )}
                      {isDelivered && step.status === 'delivered' && (
                        <p className="text-xs text-green-400">{displayOrder.deliveredAt ? timeAgo(displayOrder.deliveredAt) : 'Just now'}</p>
                      )}
                    </div>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Anti-scam instruction */}
        {!isDelivered && !isCancelled && !isPending && (
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <p className="text-violet-300 font-semibold text-sm">Show at Counter</p>
            </div>
            <p className="text-gray-400 text-xs">
              Present this <strong className="text-white">LIVE animated screen</strong> at the canteen counter.
              The canteen staff will verify your order and mark it as delivered.
              Old screenshots with frozen timestamps will be rejected.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isDelivered ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-bold">✅ Food Collected Successfully</p>
              <p className="text-gray-400 text-xs mt-1">Thank you for using SmartCanteen!</p>
            </div>
          ) : null}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage('student-menu')}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-white"
          >
            Order More Food
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPage('student-orders')}
            className="w-full py-3 bg-white/8 border border-white/15 rounded-xl font-medium text-gray-300 hover:text-white transition-all"
          >
            View All Orders
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default StudentOrderStatus;
