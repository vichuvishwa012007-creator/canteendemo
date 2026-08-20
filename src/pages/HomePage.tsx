import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore, INSTITUTIONS } from '../store/useStore';
import {
  ShoppingBag, Shield, Zap, Star, Users,
  Clock, CheckCircle, Smartphone, BarChart3, Lock, Bell, ArrowRight, Wifi
} from 'lucide-react';

const features = [
  { icon: <Shield className="w-6 h-6" />, title: 'Anti-Scam Protection', desc: 'Webhook-verified payments only. No fake screenshots accepted.', color: 'from-violet-500 to-purple-500' },
  { icon: <Zap className="w-6 h-6" />, title: 'Lightning Fast Orders', desc: 'Realtime order sync across all devices instantly.', color: 'from-blue-500 to-cyan-500' },
  { icon: <Smartphone className="w-6 h-6" />, title: 'UPI Payments', desc: 'Pay via GPay, PhonePe, Paytm & all UPI apps.', color: 'from-green-500 to-emerald-500' },
  { icon: <BarChart3 className="w-6 h-6" />, title: 'Analytics Dashboard', desc: 'Real-time sales analytics for canteen admins.', color: 'from-orange-500 to-amber-500' },
  { icon: <Lock className="w-6 h-6" />, title: 'Order Locking', desc: 'Once delivered, orders lock permanently preventing reuse.', color: 'from-red-500 to-rose-500' },
  { icon: <Bell className="w-6 h-6" />, title: 'Voice Alerts', desc: 'Audio notifications for new orders and payments.', color: 'from-pink-500 to-fuchsia-500' },
];

const stats = [
  { label: 'Institutions', value: '50+', icon: <Users className="w-5 h-5" /> },
  { label: 'Orders/Day', value: '10K+', icon: <ShoppingBag className="w-5 h-5" /> },
  { label: 'Uptime', value: '99.9%', icon: <Wifi className="w-5 h-5" /> },
  { label: 'Rating', value: '4.9★', icon: <Star className="w-5 h-5" /> },
];

const testimonials = [
  { name: 'K.Veeraragavan', role: 'Assistant professor, SACAS' ,  text: 'SmartCanteen eliminated fake payment fraud completely. Outstanding platform!', avatar: '👨‍💼' },
  { name: 'Vishwa.K', role: 'Student, S.A College Of Arts & Science', text: 'So easy to order! No more standing in queues showing all the screenshots . Love the realtime tracking.', avatar: '👩‍🎓' },
  { name: 'Dharshini.M', role: 'Student, S.A Engineering College', text: 'Live tracking works very well also the payment method works very well and faster verification.', avatar: '👨‍🍳' },
];

export const HomePage: React.FC = () => {
  const { setPage, setSelectedInstitution } = useStore();
  const [hoveredInstitution, setHoveredInstitution] = useState<string | null>(null);

  const handleSelectInstitution = (institution: typeof INSTITUTIONS[0], role: 'student' | 'admin') => {
    setSelectedInstitution(institution);
    setPage(role === 'admin' ? 'admin-login' : 'student-login');
  };

  return (
    <div className="min-h-screen bg-[#0a0614] text-white overflow-x-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">SmartCanteen</span>
            <div className="text-xs text-gray-500 font-medium">Anti-Scam Platform</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setPage('student-login')}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Student Login
          </button>
          <button
            onClick={() => setPage('admin-login')}
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/20"
          >
            Admin Login
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
            </span>
            India's #1 Anti-Scam Canteen Platform
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Canteen Ordering
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Lightning-fast food ordering with <strong className="text-white">real-time payment verification</strong>.
            Zero fake screenshots. Zero fraud. Built for colleges, food courts & canteens across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage('student-login')}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Order Food Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage('admin-login')}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Admin Dashboard
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
            >
              <div className="flex justify-center mb-2 text-violet-400">{stat.icon}</div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Select Institution Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Select Your </span>
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Institution</span>
          </h2>
          <p className="text-gray-400 text-lg">Each institution has its own menu, orders & analytics</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INSTITUTIONS.map((inst, i) => (
            <motion.div
              key={inst.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onHoverStart={() => setHoveredInstitution(inst.id)}
              onHoverEnd={() => setHoveredInstitution(null)}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 cursor-pointer group hover:border-violet-500/40 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg overflow-hidden"
                  style={{ backgroundColor: `${inst.color}20`, border: `1px solid ${inst.color}40` }}
                >
                  {inst.logo.startsWith('/') || inst.logo.startsWith('http') ? (
                    <img src={inst.logo} alt={inst.name} className="w-full h-full object-cover" />
                  ) : (
                    inst.logo
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg leading-tight">{inst.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{inst.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectInstitution(inst, 'student')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, ${inst.color}CC, ${inst.color})` }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Order Food
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectInstitution(inst, 'admin')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/20 transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  Admin
                </motion.button>
              </div>

              {hoveredInstitution === inst.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${inst.color}10, transparent 70%)` }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Enterprise </span>
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Features</span>
          </h2>
          <p className="text-gray-400 text-lg">Built for scale, security, and speed</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">How It Works</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Select & Order', desc: 'Browse menu, add items to cart', icon: <ShoppingBag className="w-6 h-6" />, color: 'from-violet-500 to-purple-600' },
            { step: '02', title: 'Pay via UPI', desc: 'Scan QR & pay using any UPI app', icon: <Smartphone className="w-6 h-6" />, color: 'from-blue-500 to-cyan-600' },
            { step: '03', title: 'Live Tracking', desc: 'Track order status in realtime', icon: <Clock className="w-6 h-6" />, color: 'from-green-500 to-emerald-600' },
            { step: '04', title: 'Collect Food', desc: 'Show live screen, get food instantly', icon: <CheckCircle className="w-6 h-6" />, color: 'from-orange-500 to-amber-600' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                {step.icon}
              </div>
              <div className="text-5xl font-black text-white/10 mb-2">{step.step}</div>
              <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">Loved by Colleges</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">"{t.text}"</p>
              <div className="flex gap-1 mt-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-3xl p-12"
        >
          <div className="text-5xl mb-6">🚀</div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join 50+ institutions already using SmartCanteen to eliminate payment fraud and streamline food ordering join today to prevent the anti scam.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage('student-login')}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl font-bold text-lg shadow-2xl shadow-violet-500/30"
            >
              Start Ordering Today
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage('admin-login')}
              className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/15 transition-all"
            >
              Setup Your Canteen
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 SmartCanteen • Anti-Scam Canteen Platform • Made for Indian Colleges</p>
        <p className="mt-2 text-xs">Powered by React • Tailwind CSS • Framer Motion</p>
      </footer>
    </div>
  );
};

export default HomePage;