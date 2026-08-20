import { OrderItem } from '../store/useStore';

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDateTime = (dateStr: string): string => {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

export const generateOrderId = (): string => {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `ORD${num}`;
};

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

export const generateTransactionId = (): string => {
  return `TXN${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

export const getItemsSummary = (items: OrderItem[]): string => {
  return items.map(i => `${i.name}x${i.quantity}`).join('-');
};

export const buildUpiUrl = (upiId: string, merchantName: string, amount: number, orderId: string, items: OrderItem[]): string => {
  const itemSummary = getItemsSummary(items);
  const note = `${orderId}-${itemSummary}`.substring(0, 50);
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending_payment': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'ordered': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    case 'preparing': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'ready': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'paid': return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending_payment': return 'Pending Payment';
    case 'ordered': return 'Ordered';
    case 'preparing': return 'Preparing';
    case 'ready': return 'Ready to Pick';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    case 'paid': return 'Paid';
    case 'pending': return 'Pending';
    case 'failed': return 'Failed';
    case 'refunded': return 'Refunded';
    default: return status;
  }
};

export const getStatusEmoji = (status: string): string => {
  switch (status) {
    case 'pending_payment': return '⏳';
    case 'ordered': return '✅';
    case 'preparing': return '👨‍🍳';
    case 'ready': return '🔔';
    case 'delivered': return '✅';
    case 'cancelled': return '❌';
    default: return '📋';
  }
};

export const speakPaymentConfirmation = (amount: number, orderId: string): void => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(
      `Payment received. ${amountToWords(amount)} rupees. Order ${orderId} confirmed.`
    );
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
};

const amountToWords = (amount: number): string => {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if (amount < 20) return ones[amount];
  if (amount < 100) return tens[Math.floor(amount / 10)] + (amount % 10 ? ' ' + ones[amount % 10] : '');
  if (amount < 1000) return ones[Math.floor(amount / 100)] + ' hundred' + (amount % 100 ? ' ' + amountToWords(amount % 100) : '');
  return amount.toString();
};

export const playSuccessSound = (): void => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Silent fail
  }
};

export const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePhone = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));

export const CATEGORIES = ['All', 'Beverages', 'Snacks', 'Meals', 'Fast Food', 'Desserts'];
