import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Shield, Bell, Palette, Building2, Save, CheckCircle, Info } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { selectedInstitution, currentUser } = useStore();
  const [saved, setSaved] = useState(false);
  const [voiceAlerts, setVoiceAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gray-400 text-xs">{desc}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-all ${checked ? 'bg-violet-600' : 'bg-gray-600'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow ${checked ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">Configure your admin preferences</p>
      </div>

      {/* Institution Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-violet-400" /> Institution Details
        </h3>
        {selectedInstitution && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Institution Name</p>
                <p className="text-white font-medium text-sm">{selectedInstitution.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Code</p>
                <p className="text-white font-medium text-sm">{selectedInstitution.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">UPI ID</p>
                <p className="text-white font-mono text-sm">{selectedInstitution.upiId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Merchant Name</p>
                <p className="text-white font-medium text-sm">{selectedInstitution.merchantName}</p>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300 text-xs">Contact SmartCanteen support to update institution details or UPI configuration.</p>
            </div>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-400" /> Notification Settings
        </h3>
        <div className="space-y-4">
          <Toggle
            checked={voiceAlerts}
            onChange={setVoiceAlerts}
            label="Voice Announcements"
            desc="Text-to-speech for new orders and payments"
          />
          <Toggle
            checked={soundAlerts}
            onChange={setSoundAlerts}
            label="Sound Alerts"
            desc="Audio notifications for order status changes"
          />
          <Toggle
            checked={autoRefresh}
            onChange={setAutoRefresh}
            label="Auto Refresh"
            desc="Automatically refresh order list in realtime"
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" /> Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-500/8 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">Anti-Scam Protection</p>
                <p className="text-gray-400 text-xs">Webhook-verified payments only</p>
              </div>
            </div>
            <span className="text-green-400 text-xs font-semibold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/8 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">Order Locking</p>
                <p className="text-gray-400 text-xs">Delivered orders permanently locked</p>
              </div>
            </div>
            <span className="text-green-400 text-xs font-semibold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-500/8 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <p className="text-white text-sm font-medium">Live Timestamp</p>
                <p className="text-gray-400 text-xs">Real-time anti-screenshot verification</p>
              </div>
            </div>
            <span className="text-green-400 text-xs font-semibold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-bold text-white mb-4">Admin Profile</h3>
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <p className="text-white font-bold">{currentUser.name}</p>
              <p className="text-gray-400 text-sm">{currentUser.email}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold mt-1 border border-red-500/30">
                <Shield className="w-3 h-3" /> Admin
              </span>
            </div>
          </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl font-semibold text-white shadow-lg shadow-violet-500/25"
      >
        {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? 'Settings Saved!' : 'Save Settings'}
      </motion.button>
    </div>
  );
};

export default AdminSettings;
