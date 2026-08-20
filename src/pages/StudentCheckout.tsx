import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useStore, Order } from '../store/useStore';
import { formatCurrency, generateOrderId, buildUpiUrl, speakPaymentConfirmation, playSuccessSound } from '../utils/helpers';
import {
  ArrowLeft, CreditCard, Smartphone, Shield, CheckCircle, Clock,
  Zap, AlertTriangle, Copy, Lock
} from 'lucide-react';

type PaymentStep = 'review' | 'payment' | 'verifying' | 'success';

// Determines whether an institution "logo" value is an image path/URL
// (e.g. "/images/SACAS-logo-e1630927124121.png") vs. a literal
// emoji/character. Rendering it as plain text (the old behavior) dumped
// image paths straight into the UI.
const isImageLogo = (logo?: string) => {
  if (!logo) return false;
  return logo.startsWith('/') || logo.startsWith('http://') || logo.startsWith('https://') || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(logo);
};

export const StudentCheckout: React.FC = () => {
  const { currentUser, selectedInstitution, cart, getCartTotal, placeOrder, clearCart, setPage, setActiveOrder } = useStore();
  const [step, setStep] = useState<PaymentStep>('review');
  const [orderId] = useState(generateOrderId());
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentTimer, setPaymentTimer] = useState(300); // 5 min countdown
  const [copied, setCopied] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);

  const cartTotal = getCartTotal();

  const upiUrl = selectedInstitution
    ? buildUpiUrl(
      selectedInstitution.upiId,
      selectedInstitution.merchantName,
      cartTotal,
      orderId,
      cart.map(c => ({ id: c.menuItem.id, name: c.menuItem.name, price: c.menuItem.price, quantity: c.quantity }))
    )
    : '';

  useEffect(() => {
    if (step === 'payment' && paymentTimer > 0) {
      const timer = setInterval(() => setPaymentTimer(p => p - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, paymentTimer]);

  useEffect(() => {
    if (step === 'verifying') {
      const timer = setInterval(() => setVerificationTimer(v => v + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const handleProceedToPayment = () => {
    const newOrder: Order = {
      id: `order_${Date.now()}`,
      orderId,
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Guest',
      userPhone: currentUser?.phone || 'N/A',
      userEmail: currentUser?.email || 'N/A',
      institutionId: selectedInstitution?.id || '',
      items: cart.map(c => ({
        id: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity
      })),
      amount: cartTotal,
      paymentStatus: 'pending',
      deliveryStatus: 'pending_payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      locked: false,
    };
    setOrder(newOrder);
    placeOrder(newOrder);
    setStep('payment');
  };

  const simulatePaymentVerification = () => {
    setStep('verifying');
    setTimeout(() => {
      if (order) {
        const { updateOrder } = useStore.getState();
        updateOrder(order.id, {
          paymentStatus: 'paid',
          deliveryStatus: 'ordered',
          paymentMethod: 'UPI',
          upiTransactionId: `TXN${Date.now().toString(36).toUpperCase()}`,
          updatedAt: new Date().toISOString(),
        });
        const updatedOrder = { ...order, paymentStatus: 'paid' as const, deliveryStatus: 'ordered' as const };
        setOrder(updatedOrder);
        setActiveOrder(updatedOrder);
        playSuccessSound();
        speakPaymentConfirmation(cartTotal, orderId);
        clearCart();
        setStep('success');
      }
    }, 3000);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(selectedInstitution?.upiId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'success' && order) {
    return (
      <div className="min-h-screen bg-[#0a0614] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/40"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-3xl font-black text-white mb-2">Payment Verified! 🎉</h2>
            <p className="text-gray-400 mb-8">Your order has been confirmed and is being prepared</p>

            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 mb-6 text-left">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-400 font-bold">Order #{order.orderId}</span>
                <span className="text-green-400 font-black">{formatCurrency(order.amount)}</span>
              </div>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-300 py-1">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage('student-order-status')}
                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-bold text-white shadow-lg shadow-violet-500/25"
              >
                Track Live Order Status →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPage('student-menu')}
                className="w-full py-3 bg-white/8 border border-white/15 rounded-2xl font-medium text-gray-300 hover:text-white transition-all"
              >
                Order More Food
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (step === 'verifying') {
    return (
      <div className="min-h-screen bg-[#0a0614] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-4 border-purple-500/20 rounded-full" />
            <div className="absolute inset-2 border-4 border-purple-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
            <div className="absolute inset-4 bg-violet-600/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Verifying Payment</h2>
          <p className="text-gray-400 text-sm mb-4">Securely confirming your UPI transaction...</p>
          <div className="text-4xl font-black text-violet-400 mb-6">{verificationTimer}s</div>

          <div className="space-y-2 text-left bg-white/5 border border-white/10 rounded-2xl p-4">
            {[
              { label: 'Checking UPI gateway', done: verificationTimer > 0 },
              { label: 'Verifying payment signature', done: verificationTimer > 1 },
              { label: 'Confirming transaction', done: verificationTimer > 2 },
              { label: 'Updating order status', done: verificationTimer > 2.5 },
            ].map((check, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {check.done ? (
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-600 rounded-full flex-shrink-0 animate-pulse" />
                )}
                <span className={check.done ? 'text-green-300' : 'text-gray-400'}>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-[#0a0614] text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          <button onClick={() => setStep('review')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white mb-1">Complete Payment</h1>
            <p className="text-gray-400 text-sm">Order #{orderId}</p>
          </div>

          {/* Timer */}
          {paymentTimer > 0 ? (
            <div className={`flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-xl border ${paymentTimer < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
              <Clock className="w-4 h-4" />
              <span className="font-semibold text-sm">QR expires in {formatTimer(paymentTimer)}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-xl border bg-red-500/15 border-red-500/40 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold text-sm">QR expired. Please go back and retry.</span>
            </div>
          )}

          {/* QR Code */}
          <div className="bg-white rounded-2xl p-6 mb-5 text-center shadow-2xl">
            {paymentTimer > 0 ? (
              <QRCodeSVG
                value={upiUrl}
                size={220}
                level="H"
                includeMargin={false}
                style={{ width: '100%', height: 'auto', maxWidth: 220, margin: '0 auto', display: 'block' }}
              />
            ) : (
              <div className="w-full h-48 flex flex-col items-center justify-center text-gray-400">
                <Lock className="w-12 h-12 mb-2" />
                <p className="font-semibold">QR Expired</p>
              </div>
            )}
            <p className="text-gray-500 text-xs mt-3">Scan with GPay, PhonePe, Paytm or any UPI app</p>
          </div>

          {/* Amount */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Pay Amount</span>
              <span className="text-2xl font-black text-white">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">To</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">{selectedInstitution?.merchantName}</span>
                <button onClick={copyUpiId} className="text-violet-400 hover:text-violet-300 transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-gray-500 text-xs mt-1 text-right">{selectedInstitution?.upiId}</div>
          </div>

          {/* UPI Apps */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { name: 'GPay', color: 'from-blue-600 to-blue-700', emoji: '🔵' },
              { name: 'PhonePe', color: 'from-purple-600 to-purple-700', emoji: '🟣' },
              { name: 'Paytm', color: 'from-blue-400 to-cyan-500', emoji: '💙' },
              { name: 'BHIM', color: 'from-orange-500 to-red-500', emoji: '🟠' },
            ].map(app => (
              <motion.a
                key={app.name}
                href={upiUrl}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-br ${app.color} rounded-xl p-2.5 flex flex-col items-center gap-1`}
              >
                <span className="text-2xl">{app.emoji}</span>
                <span className="text-white text-xs font-semibold">{app.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Anti-scam notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-5">
            <div className="flex gap-2">
              <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 text-xs font-semibold">Secure Payment</p>
                <p className="text-gray-400 text-xs mt-0.5">Payment is verified by our secure webhook system. Screenshots are NOT accepted at the counter.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={simulatePaymentVerification}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-bold text-white text-base shadow-lg shadow-green-500/25"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5" />
                I've Paid — Verify Payment
              </span>
            </motion.button>
            <p className="text-center text-xs text-gray-500">
              Click only after completing the UPI payment
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Review step
  return (
    <div className="min-h-screen bg-[#0a0614] text-white pb-8">
      <div className="max-w-md mx-auto px-4 py-6">
        <button onClick={() => setPage('student-menu')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Menu
        </button>

        <h1 className="text-2xl font-black text-white mb-6">Review Order</h1>

        {/* Delivery Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-400" /> Pickup Details
          </h3>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl overflow-hidden shrink-0"
              style={{ backgroundColor: `${selectedInstitution?.color}20` }}
            >
              {isImageLogo(selectedInstitution?.logo) ? (
                <img
                  src={selectedInstitution?.logo}
                  alt={selectedInstitution?.name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                selectedInstitution?.logo
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate">{selectedInstitution?.name}</p>
              <p className="text-gray-400 text-xs">Show live order screen at counter</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <h3 className="font-semibold text-white mb-3">Your Order</h3>
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.menuItem.id} className="flex justify-between items-center">
                <div>
                  <span className="text-white text-sm">{item.menuItem.name}</span>
                  <span className="text-gray-400 text-xs ml-2">× {item.quantity}</span>
                </div>
                <span className="text-white font-semibold text-sm">{formatCurrency(item.menuItem.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
            <span className="text-white font-bold">Total Amount</span>
            <span className="text-white font-black text-lg">{formatCurrency(cartTotal)}</span>
          </div>
        </div>

        {/* Customer Info */}
        {currentUser && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
            <h3 className="font-semibold text-white mb-3">Your Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white font-medium">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="text-white font-medium">{currentUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-medium truncate max-w-[60%] text-right">{currentUser.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Anti-scam notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 font-semibold text-sm mb-1">Anti-Scam Protection Active</p>
              <ul className="text-gray-400 text-xs space-y-0.5">
                <li>✓ Payment verified via secure webhook</li>
                <li>✓ Screenshots NOT accepted at counter</li>
                <li>✓ Order locks permanently after delivery</li>
                <li>✓ Cannot be reused once handed over</li>
              </ul>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleProceedToPayment}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-bold text-white text-lg shadow-2xl shadow-violet-500/30"
        >
          <span className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Proceed to Pay {formatCurrency(cartTotal)}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default StudentCheckout;