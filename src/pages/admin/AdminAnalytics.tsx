import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Star } from 'lucide-react';

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#ec4899'];

export const AdminAnalytics: React.FC = () => {
  const { selectedInstitution, getInstitutionOrders } = useStore();
  const orders = getInstitutionOrders(selectedInstitution?.id || '');
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

  // Total Revenue
  
  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);
  const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;
  const deliveredCount = paidOrders.filter(o => o.deliveryStatus === 'delivered').length;
  const successRate = paidOrders.length ? Math.round((deliveredCount / paidOrders.length) * 100) : 0;

  // Weekly Revenue
  const weeklyData = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const dayOrders = paidOrders.filter(o => new Date(o.createdAt).toDateString() === date.toDateString());
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      revenue: dayOrders.reduce((s, o) => s + o.amount, 0),
      orders: dayOrders.length,
    };
  }), [paidOrders]);

  // Best sellers
  const itemCounts: Record<string, { count: number; revenue: number }> = {};
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, revenue: 0 };
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });
  const bestSellers = Object.entries(itemCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([name, data]) => ({ name, ...data }));

  // Category distribution
  const catData: Record<string, number> = {};
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      const cat = item.price >= 60 ? 'Meals' : item.price >= 40 ? 'Fast Food' : item.price >= 25 ? 'Snacks' : 'Beverages';
      catData[cat] = (catData[cat] || 0) + item.price * item.quantity;
    });
  });
  const pieData = Object.entries(catData).map(([name, value]) => ({ name, value }));

  // Payment success by hour
  const hourlySuccess = Array.from({ length: 14 }, (_, i) => {
    const hour = 7 + i;
    const hourOrders = orders.filter(o => new Date(o.createdAt).getHours() === hour);
    const paid = hourOrders.filter(o => o.paymentStatus === 'paid').length;
    return {
      hour: `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`,
      successRate: hourOrders.length ? Math.round((paid / hourOrders.length) * 100) : 0,
      total: hourOrders.length,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1030] border border-white/20 rounded-xl p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || '#7c3aed' }} className="text-sm font-bold">
              {p.name}: {p.name.includes('revenue') || p.name === 'revenue' ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      sub: `${paidOrders.length} paid orders`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-500/15 border-violet-500/30',
      trend: '+23.5%',
      up: true,
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(avgOrderValue),
      sub: 'Per transaction',
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/15 border-blue-500/30',
      trend: '+5.2%',
      up: true,
    },
    {
      label: 'Delivery Rate',
      value: `${successRate}%`,
      sub: `${deliveredCount} delivered`,
      icon: <Star className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-green-500/15 border-green-500/30',
      trend: '+2.1%',
      up: true,
    },
    {
      label: 'Total Customers',
      value: new Set(orders.map(o => o.userId)).size.toString(),
      sub: 'Unique users',
      icon: <Users className="w-5 h-5" />,
      color: 'from-orange-500 to-amber-500',
      bg: 'bg-orange-500/15 border-orange-500/30',
      trend: '+12.8%',
      up: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-0.5">{selectedInstitution?.name} • Complete performance insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border p-4 ${card.bg}`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
              {card.icon}
            </div>
            <p className="text-gray-400 text-xs mb-1">{card.label}</p>
            <p className="text-white text-xl font-black mb-1">{card.value}</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">{card.sub}</span>
              <div className="flex items-center gap-1">
                {card.up ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                <span className={`text-xs font-semibold ${card.up ? 'text-green-400' : 'text-red-400'}`}>{card.trend}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-white">14-Day Revenue Trend</h3>
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Healthy growth</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="revenue" stroke="#7c3aed" strokeWidth={3} fill="url(#revGrad2)" dot={{ fill: '#7c3aed', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best Sellers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4">Best Selling Items</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bestSellers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="orders" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Category */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                labelLine={false}>
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-400">{item.name}: {formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Payment Success Rate */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4">Payment Success Rate by Hour</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={hourlySuccess}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="successRate" name="successRate" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Revenue Items Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/8">
          <h3 className="font-bold text-white">Top Revenue Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-4 py-3 text-xs text-gray-400">#</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400">Item</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400">Orders</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400">Revenue</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400">Share</th>
              </tr>
            </thead>
            <tbody>
              {bestSellers.map((item, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-400">#{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{item.count}</td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                          style={{ width: `${Math.round((item.revenue / totalRevenue) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{Math.round((item.revenue / totalRevenue) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
