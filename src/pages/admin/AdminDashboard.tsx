import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { formatCurrency, timeAgo } from '../../utils/helpers';
import { StatusBadge, LiveBadge } from '../../components/ui/Badge';
import { AdminReviewsModal } from './AdminReviewsModal';
import {
  TrendingUp, ShoppingBag, CheckCircle,
  DollarSign, Zap, ArrowUp, ArrowDown, Eye, Star
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706'];

export const AdminDashboard: React.FC = () => {
  const { selectedInstitution, getInstitutionOrders, setAdminPage, getInstitutionReviews, getInstitutionRating } = useStore();
  const orders = getInstitutionOrders(selectedInstitution?.id || '');
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const institutionReviews = getInstitutionReviews(selectedInstitution?.id || '');
  const institutionRating = getInstitutionRating(selectedInstitution?.id || '');
  // Simulate realtime updates
  useEffect(() => {
    const timer = setInterval(() => {}, 30000);
    return () => clearInterval(timer);
  }, []);

  // Stats
  const todayOrders = orders.filter(o => {
    const today = new Date();
    const orderDate = new Date(o.createdAt);
    return orderDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = orders.filter(o => o.paymentStatus === 'paid' && o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'cancelled');
  const deliveredToday = todayOrders.filter(o => o.deliveryStatus === 'delivered').length;

  // Revenue by hour chart data
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = 8 + i; // 8AM to 8PM
    const hourOrders = orders.filter(o => {
      const orderHour = new Date(o.createdAt).getHours();
      return orderHour === hour && o.paymentStatus === 'paid';
    });
    return {
      time: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`,
      revenue: hourOrders.reduce((sum, o) => sum + o.amount, 0),
      orders: hourOrders.length,
    };
  });

  // Category distribution
  const categoryData: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      // map item to approximate category
      const cat = item.price >= 60 ? 'Meals' : item.price >= 40 ? 'Fast Food' : item.price >= 25 ? 'Snacks' : 'Beverages';
      categoryData[cat] = (categoryData[cat] || 0) + item.quantity;
    });
  });
  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Weekly trend
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === date.toDateString() && o.paymentStatus === 'paid');
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      revenue: dayOrders.reduce((s, o) => s + o.amount, 0),
      orders: dayOrders.length,
    };
  });

  const stats = [
    {
      label: "Today's Revenue",
      value: formatCurrency(todayRevenue),
      change: '+12.5%',
      positive: true,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-500/15 border-violet-500/30',
    },
    {
      label: 'Active Orders',
      value: pendingOrders.length.toString(),
      change: 'Live',
      positive: true,
      icon: <Zap className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/15 border-blue-500/30',
    },
    {
      label: "Today's Orders",
      value: todayOrders.length.toString(),
      change: '+8',
      positive: true,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-green-500/15 border-green-500/30',
    },
    {
      label: 'Delivered Today',
      value: deliveredToday.toString(),
      change: `${Math.round((deliveredToday / Math.max(todayOrders.length, 1)) * 100)}%`,
      positive: true,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-500/15 border-orange-500/30',
    },
  ];

  // Recent orders
  const recentOrders = orders
    .filter(o => o.paymentStatus === 'paid')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1030] border border-white/20 rounded-xl p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="text-sm font-bold">
              {p.name}: {p.name === 'revenue' ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">{selectedInstitution?.name} • Live Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setReviewsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 hover:bg-yellow-500/20 transition-all text-xs font-semibold"
          >
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            Reviews
            {institutionReviews.length > 0 && (
              <span className="bg-yellow-500/25 rounded-full px-1.5 py-0.5 text-[10px]">{institutionReviews.length}</span>
            )}
          </motion.button>
          <LiveBadge label="LIVE DATA" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border p-4 ${stat.bg}`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
              {stat.icon}
            </div>
            <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
            <p className="text-white text-xl font-black mb-1">{stat.value}</p>
            <div className="flex items-center gap-1">
              {stat.positive ? (
                <ArrowUp className="w-3 h-3 text-green-400" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-xs font-semibold ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Weekly Revenue</h3>
            <div className="flex items-center gap-1 text-green-400 text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.2%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h3 className="font-bold text-white mb-4">Orders by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {pieData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hourly Orders Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white">Peak Hours Analysis</h3>
          <span className="text-xs text-gray-400">Today's order distribution</span>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="orders" name="orders" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h3 className="font-bold text-white">Recent Orders</h3>
          <button onClick={() => setAdminPage('orders')} className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors flex items-center gap-1">
            View All <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Items</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-white">#{order.orderId}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{order.userName}</p>
                    <p className="text-xs text-gray-400">{order.userPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 max-w-[150px]">
                    <p className="truncate">{order.items.map(i => `${i.name}×${i.quantity}`).join(', ')}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{formatCurrency(order.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.deliveryStatus} pulse={order.deliveryStatus !== 'delivered'} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{timeAgo(order.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Reviews Modal */}
      <AdminReviewsModal
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        reviews={institutionReviews}
        averageRating={institutionRating.average}
      />
    </div>
  );
};

export default AdminDashboard;