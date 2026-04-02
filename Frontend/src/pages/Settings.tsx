import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Globe, Cloud, Layout, Key, Save } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactor: false,
    publicProfile: true,
    autoSync: true,
    language: 'English (US)'
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Architecture parameters synchronized.');
    }, 1200);
  };

  const tabs = [
    { id: 'general', label: 'Global Parameters', icon: Globe },
    { id: 'security', label: 'Security Node', icon: Shield },
    { id: 'notifications', label: 'Alert Matrix', icon: Bell },
    { id: 'integrations', label: 'Linked Systems', icon: Cloud },
    { id: 'appearance', label: 'UI Aesthetics', icon: Layout }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-1000 pb-20 mt-6 lg:mt-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">Settings Matrix</h1>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest leading-relaxed">Configure global platform architecture</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="ag-btn ag-btn-primary !px-8 !rounded-2xl shadow-xl shadow-indigo-500/20 text-xs font-bold uppercase tracking-widest h-12 flex items-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Commit Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
         
         {/* Sidebar Navigator */}
         <div className="lg:col-span-3 space-y-2">
            {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-bold duration-300 ${
                   activeTab === tab.id 
                     ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 translate-x-2' 
                     : 'text-slate-600 hover:bg-white hover:text-slate-900 active:bg-slate-50 border border-transparent hover:border-slate-100 hover:shadow-sm'
                 }`}
               >
                 <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                 {tab.label}
               </button>
            ))}
         </div>

         {/* Configuration Panels */}
         <div className="lg:col-span-9 space-y-8">
            {activeTab === 'general' && (
               <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-premium animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">Global Parameters</h3>
                  
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Platform Region</label>
                           <select 
                             value={preferences.language} 
                             onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                             className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all appearance-none"
                           >
                              <option>English (US)</option>
                              <option>English (UK)</option>
                              <option>French (FR)</option>
                              <option>German (DE)</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Timezone Directive</label>
                           <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-slate-900 text-sm font-bold focus:bg-white focus:border-indigo-500 transition-all appearance-none cursor-not-allowed opacity-70" disabled>
                              <option>UTC (Coordinated Universal Time)</option>
                           </select>
                        </div>
                     </div>

                     <div className="pt-8 border-t border-slate-50 space-y-6">
                        <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                           <div>
                              <p className="text-sm font-bold text-slate-900">Public Protocol Profile</p>
                              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">Enable visible institutional profiles.</p>
                           </div>
                           <button 
                             onClick={() => setPreferences({...preferences, publicProfile: !preferences.publicProfile})}
                             className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${preferences.publicProfile ? 'bg-indigo-500' : 'bg-slate-200'}`}
                           >
                              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${preferences.publicProfile ? 'translate-x-6' : 'translate-x-0'}`} />
                           </button>
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                           <div>
                              <p className="text-sm font-bold text-slate-900">Automatic Data Sync</p>
                              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">Keep local states aligned with cloud arrays.</p>
                           </div>
                           <button 
                             onClick={() => setPreferences({...preferences, autoSync: !preferences.autoSync})}
                             className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 shadow-inner ${preferences.autoSync ? 'bg-indigo-500' : 'bg-slate-200'}`}
                           >
                              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${preferences.autoSync ? 'translate-x-6' : 'translate-x-0'}`} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'security' && (
               <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-premium animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Key className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security Directives</h3>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
                        <div>
                           <p className="text-sm font-bold text-slate-900">Two-Factor Authorization</p>
                           <p className="text-xs text-slate-500 font-medium mt-1 pr-6 max-w-lg">Enforce cryptographically secure token validation for high-level operations. Recommended for Staff & Admin nodes.</p>
                        </div>
                        <button 
                          onClick={() => setPreferences({...preferences, twoFactor: !preferences.twoFactor})}
                          className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 shadow-inner ${preferences.twoFactor ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                           <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${preferences.twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div>
                           <p className="text-sm font-bold text-slate-900">Active Node Sessions</p>
                           <p className="text-xs text-slate-500 font-medium mt-1">Manage and terminate verified sessions across multiple devices.</p>
                        </div>
                        <Smartphone className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                     </div>
                  </div>
               </div>
            )}

            {/* Placeholder for other tabs */}
            {['notifications', 'integrations', 'appearance'].includes(activeTab) && (
               <div className="bg-slate-50 rounded-[32px] p-16 border border-slate-200 border-dashed animate-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center text-center">
                  <Bell className="w-12 h-12 text-slate-300 mb-6" />
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Module Offline</h3>
                  <p className="text-slate-500 font-medium max-w-sm">This configuration matrix is currently locked or undergoing scheduled calibration.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Settings;
