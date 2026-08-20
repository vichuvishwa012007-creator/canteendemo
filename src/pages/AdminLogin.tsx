import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore, INSTITUTIONS, User } from '../store/useStore';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';

const ADMIN_CREDENTIALS: Record<string, { password: string; name: string; email: string }> = {
  'inst_001': { password: 'admin@sacas2026', name: 'SACAS Admin', email: 'admin@sacas.edu.in' },
  'inst_002': { password: 'admin@saec2026', name: 'SA Engineering Admin', email: 'admin@saec.edu.in' },
};

// Master admin credentials
const MASTER_ADMIN = { email: 'superadmin@smartcanteen.app', password: 'SmartAdmin@2024!' };

// Renders inst.logo as an <img> when it's a file path/URL, otherwise as emoji text
const InstitutionLogo: React.FC<{ logo: string; alt: string; className?: string }> = ({ logo, alt, className }) => {
  const isImagePath = logo.startsWith('/') || logo.startsWith('http');
  if (isImagePath) {
    return <img src={logo} alt={alt} className={`w-full h-full object-cover ${className || ''}`} />;
  }
  return <>{logo}</>;
};

export const AdminLogin: React.FC = () => {
  const { setPage, login, selectedInstitution, setSelectedInstitution } = useStore();
  const [selectedInst, setSelectedInst] = useState(selectedInstitution);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'credentials'>(selectedInstitution ? 'credentials' : 'select');

  const handleLogin = async () => {
    if (!selectedInst) return;
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    const isMaster = email === MASTER_ADMIN.email && password === MASTER_ADMIN.password;
    const instCreds = ADMIN_CREDENTIALS[selectedInst.id];
    const isInstAdmin = instCreds && email === instCreds.email && password === instCreds.password;
    const isDemoLogin = password === 'admin123' && email.includes('@');

    if (isMaster || isInstAdmin || isDemoLogin) {
      const user: User = {
        id: `admin_${selectedInst.id}`,
        name: isMaster ? 'Super Admin' : (instCreds?.name || 'Admin'),
        email: email,
        phone: '+91 98765 00000',
        role: 'admin',
        institutionId: selectedInst.id,
        createdAt: new Date().toISOString(),
      };
      setSelectedInstitution(selectedInst);
      login(user);
      setPage('admin-dashboard');
    } else {
      setError('Invalid credentials. Use the correct admin email and password.');
    }

    setLoading(false);
  };

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-[#0a0614] flex flex-col items-center justify-center px-4 py-12">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-lg">
          <button onClick={() => setPage('home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">Admin Portal</h1>
            <p className="text-gray-400 mt-2">Select your institution to manage</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">Admin Access Only</p>
              <p className="text-amber-400/70 text-xs mt-0.5">This portal is restricted to authorized canteen administrators. Unauthorized access is prohibited strictly.</p>
            </div>
          </div>

          <div className="space-y-3">
            {INSTITUTIONS.map((inst, i) => (
              <motion.button
                key={inst.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => { setSelectedInst(inst); setStep('credentials'); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${selectedInst?.id === inst.id ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: `${inst.color}20`, border: `1px solid ${inst.color}40` }}>
                  <InstitutionLogo logo={inst.logo} alt={inst.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white">{inst.name}</div>
                  <div className="text-xs text-gray-400">{inst.code} • Admin Dashboard</div>
                </div>
                {selectedInst?.id === inst.id && <CheckCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0614] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <button onClick={() => setStep('select')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Change Institution
        </button>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          {selectedInst && (
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl overflow-hidden"
                style={{ backgroundColor: `${selectedInst.color}20` }}>
                <InstitutionLogo logo={selectedInst.logo} alt={selectedInst.name} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{selectedInst.name}</div>
                <div className="text-xs text-gray-400">{selectedInst.code} • Admin Portal</div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white text-center mb-2">Admin Login</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Secure access to canteen management</p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6">
            <p className="text-blue-300 text-xs font-medium">🔐 Demo Credentials</p>
            <p className="text-blue-400/70 text-xs mt-1">Email: {selectedInst && ADMIN_CREDENTIALS[selectedInst.id]?.email}</p>
            <p className="text-blue-400/70 text-xs">Password: {selectedInst && ADMIN_CREDENTIALS[selectedInst.id]?.password}</p>
            <p className="text-gray-500 text-xs mt-1">Or use any email + password: admin123</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@institution.edu"
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : 'Access Admin Dashboard'}
            </motion.button>
          </div>

          <div className="mt-6 p-4 bg-red-500/5 border border-red-500/15 rounded-xl">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold mb-1">
              <Shield className="w-3.5 h-3.5" /> Security Notice
            </div>
            <p className="text-gray-500 text-xs">All admin actions are logged. Unauthorized access attempts are reported.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;