import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, INSTITUTIONS, User } from '../store/useStore';
import { generateUserId, validateEmail, validatePhone } from '../utils/helpers';
import { ShoppingBag, Mail, Phone, User as UserIcon, Lock, Eye, EyeOff, ArrowLeft, Building2, CheckCircle } from 'lucide-react';

type AuthMode = 'select-institution' | 'login' | 'register';

// Renders inst.logo as an <img> when it's a file path/URL, otherwise as emoji text
const InstitutionLogo: React.FC<{ logo: string; alt: string }> = ({ logo, alt }) => {
  const isImagePath = logo.startsWith('/') || logo.startsWith('http');
  if (isImagePath) {
    return <img src={logo} alt={alt} className="w-full h-full object-cover" />;
  }
  return <>{logo}</>;
};

export const StudentLogin: React.FC = () => {
  const { setPage, login, selectedInstitution, setSelectedInstitution, setAuthLoading } = useStore();
  const [mode, setMode] = useState<AuthMode>(selectedInstitution ? 'login' : 'select-institution');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [localInstitution, setLocalInstitution] = useState(selectedInstitution);

  const validate = (isRegister: boolean): boolean => {
    const newErrors: Record<string, string> = {};
    if (isRegister && !name.trim()) newErrors.name = 'Name is required';
    if (!email.trim() || !validateEmail(email)) newErrors.email = 'Valid email required';
    if (isRegister && !validatePhone(phone)) newErrors.phone = 'Valid 10-digit phone required';
    if (!password || password.length < 6) newErrors.password = 'Password must be 6+ characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (isRegister: boolean) => {
    if (!validate(isRegister)) return;
    if (!localInstitution) { setMode('select-institution'); return; }

    setLoading(true);
    setAuthLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const user: User = {
      id: generateUserId(),
      name: isRegister ? name : (email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
      email,
      phone: isRegister ? phone : '+91 98765 43210',
      role: 'student',
      institutionId: localInstitution.id,
      createdAt: new Date().toISOString(),
    };

    setSelectedInstitution(localInstitution);
    login(user);
    setAuthLoading(false);
    setLoading(false);
    setPage('student-menu');
  };

  const handleGuestMode = () => {
    if (!localInstitution) return;
    const user: User = {
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      email: 'guest@smartcanteen.app',
      phone: '+91 00000 00000',
      role: 'student',
      institutionId: localInstitution.id,
      createdAt: new Date().toISOString(),
    };
    setSelectedInstitution(localInstitution);
    login(user);
    setPage('student-menu');
  };

  if (mode === 'select-institution') {
    return (
      <div className="min-h-screen bg-[#0a0614] flex flex-col">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <button onClick={() => setPage('home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Select Institution</h1>
            <p className="text-gray-400 mt-2">Choose your college or institution to continue</p>
          </motion.div>

          <div className="w-full max-w-2xl grid grid-cols-1 gap-3">
            {INSTITUTIONS.map((inst, i) => (
              <motion.button
                key={inst.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setLocalInstitution(inst); setMode('login'); }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${localInstitution?.id === inst.id ? 'border-violet-500 bg-violet-500/15' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: `${inst.color}20`, border: `1px solid ${inst.color}40` }}>
                  <InstitutionLogo logo={inst.logo} alt={inst.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{inst.name}</div>
                  <div className="text-sm text-gray-400 truncate">{inst.address}</div>
                </div>
                {localInstitution?.id === inst.id && <CheckCircle className="w-5 h-5 text-violet-400 flex-shrink-0" />}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0614] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <button onClick={() => setMode('select-institution')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Change Institution
        </button>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          {/* Institution indicator */}
          {localInstitution && (
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl overflow-hidden"
                style={{ backgroundColor: `${localInstitution.color}20` }}>
                <InstitutionLogo logo={localInstitution.logo} alt={localInstitution.name} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{localInstitution.name}</div>
                <div className="text-xs text-gray-400">{localInstitution.code} • Student Portal</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white text-center mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            {mode === 'login' ? 'Login to order food at your canteen' : 'Join SmartCanteen today'}
          </p>

          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setMode(tab)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === tab ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                {tab === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Arjun Kumar"
                      className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all" />
                  </div>
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="student@college.edu"
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all" />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="9876543210" maxLength={10}
                      className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all" />
                  </div>
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAuth(mode === 'register')}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : mode === 'login' ? 'Login to SmartCanteen' : 'Create Account'}
            </motion.button>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 border-t border-white/10" />
              <span className="text-gray-500 text-xs">OR</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGuestMode}
              className="w-full py-3 bg-white/8 border border-white/15 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white/12 transition-all"
            >
              Continue as Guest
            </motion.button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;