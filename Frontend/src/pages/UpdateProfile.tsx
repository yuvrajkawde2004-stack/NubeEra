import React, { useState, useEffect } from 'react';
import { Edit3, Save, Shield, Phone, X, Mail, Calendar, Camera, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const UpdateProfile: React.FC = () => {
  const [user, setUser] = useState<any>(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    qualification: '',
    specialization: '',
    profile_picture_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      const details = data.learner_details || data.trainer_details || data.staff_details || {};
      
      const newFormData = {
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        date_of_birth: details.date_of_birth ? new Date(details.date_of_birth).toISOString().split('T')[0] : '',
        gender: details.gender || '',
        address: details.address || '',
        qualification: details.qualification || '',
        specialization: details.specialization || '',
        profile_picture_url: data.profile_picture_url || ''
      };
      
      setFormData(newFormData);
      
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', formData);
      toast.success('Identity profile updated');
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error('Identity sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const toastId = toast.loading('Uploading profile image...');
    try {
      const { data } = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newPicUrl = data.url;
      setFormData(prev => ({ ...prev, profile_picture_url: newPicUrl }));
      
      // Auto-save to backend immediately so refresh doesn't lose it
      await api.put('/users/profile', { 
        ...formData, 
        profile_picture_url: newPicUrl 
      });
      
      // Update local storage user object so Header reflects it immediately
      const updatedUser = { ...user, profile_picture_url: newPicUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Trigger a storage event so other components (like Header) can react if they listen
      window.dispatchEvent(new Event('storage'));
      
      toast.success('Image uploaded and saved!', { id: toastId });
    } catch (error) {
      toast.error('Image upload or sync failed', { id: toastId });
    }
  };

  const roleDisplay = (user.utype || 'User').toUpperCase();

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 max-w-6xl mx-auto pb-16">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Identity Card */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white rounded-[40px] p-10 flex flex-col items-center text-center shadow-premium border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
              
              <div className="w-40 h-40 rounded-[48px] bg-slate-50 border border-slate-100 p-2 mb-8 shadow-xl relative z-10 group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                <img
                  src={formData.profile_picture_url || user.profile_picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Antigravity'}`}
                  alt="Identity"
                  className="w-full h-full rounded-[40px] object-cover bg-white"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Antigravity'}`; }}
                />
                {isEditing && (
                  <label className="absolute inset-x-2 bottom-2 bg-black/60 backdrop-blur-md text-white py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-black/80 transition-all rounded-b-[40px] animate-in slide-in-from-bottom duration-300">
                    <Camera className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>

              <div className="relative z-10">
                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{user.full_name}</h2>
                 <div className="mt-4 inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">{roleDisplay}</span>
                 </div>
              </div>

              <div className="w-full mt-10 pt-10 border-t border-slate-50 space-y-6">
                 <div className="flex items-center gap-4 text-left">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100 shadow-sm">
                       <Shield className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Access Role</p>
                       <p className="text-xs font-bold text-slate-700 mt-0.5">{user.role || 'Authorized User'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 text-left">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100 shadow-sm">
                       <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Mail Protocol</p>
                       <p className="text-xs font-bold text-slate-700 truncate mt-0.5">{user.email}</p>
                    </div>
                 </div>
              </div>
           </div>


        </div>

        {/* Configuration Surface */}
        <div className="lg:col-span-8">
           <div className="bg-white rounded-[40px] shadow-premium border border-slate-100 overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Identity Configuration</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Refine your personal and professional identity nodes.</p>
                 </div>
                 {!isEditing ? (
                   <button type="button" onClick={() => setIsEditing(true)} className="ag-btn ag-btn-outline !rounded-2xl px-6 py-3 shadow-sm hover:shadow-md transition-all">
                      <Edit3 className="w-4 h-4" /> <span>Edit Identity</span>
                   </button>
                 ) : (
                   <div className="flex gap-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"><X className="w-5 h-5" /></button>
                      <button type="submit" onClick={handleUpdateProfile} disabled={loading} className="ag-btn ag-btn-primary !rounded-2xl px-6 py-3 shadow-lg">
                         {loading ? <div className="w-5 h-5 border-2 border-slate-900/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                         <span>Commit Changes</span>
                      </button>
                   </div>
                 )}
              </div>

              <div className="p-12 space-y-12">
                  {/* Basic Intel */}
                  <section className="space-y-8">
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] bg-indigo-50 px-3 py-1 rounded-lg">Manifest v1.0</span>
                        <div className="h-px flex-1 bg-slate-50"></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* First Name Node */}
                        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-premium transition-all duration-500 group">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-4 block">First Name</label>
                           {isEditing ? (
                             <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 pointer-events-none" />
                                <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm" />
                             </div>
                           ) : (
                             <div className="flex items-center gap-4 px-1">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                   <UserIcon className="w-5 h-5" />
                                </div>
                                <span className="text-base font-bold text-slate-700">{user.first_name || '—'}</span>
                             </div>
                           )}
                        </div>

                        {/* Last Name Node */}
                        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-premium transition-all duration-500 group">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-4 block">Last Name</label>
                           {isEditing ? (
                             <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 pointer-events-none" />
                                <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm" />
                             </div>
                           ) : (
                             <div className="flex items-center gap-4 px-1">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                                   <UserIcon className="w-5 h-5" />
                                </div>
                                <span className="text-base font-bold text-slate-700">{user.last_name || '—'}</span>
                             </div>
                           )}
                        </div>
                     </div>
                  </section>

                  {/* Contact & Personal */}
                  <section className="space-y-8">
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] bg-emerald-50 px-3 py-1 rounded-lg">Contact No.</span>
                        <div className="h-px flex-1 bg-slate-50"></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Phone Node */}
                        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-premium transition-all duration-500 group">
                           <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1 mb-4 block">Contact No.</label>
                           {isEditing ? (
                             <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 pointer-events-none" />
                                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm" />
                             </div>
                           ) : (
                             <div className="flex items-center gap-4 px-1">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                   <Phone className="w-5 h-5" />
                                </div>
                                <span className="text-base font-bold text-slate-700">{user.phone || 'Registry Empty'}</span>
                             </div>
                           )}
                        </div>

                        {/* Birth Protocol Node */}
                        <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-premium transition-all duration-500 group">
                           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 mb-4 block">Birth Protocol</label>
                           {isEditing ? (
                             <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700 pointer-events-none" />
                                <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-sm" />
                             </div>
                           ) : (
                             <div className="flex items-center gap-4 px-1">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                   <Calendar className="w-5 h-5" />
                                </div>
                                <span className="text-base font-bold text-slate-700">{formData.date_of_birth || 'Not Synchronized'}</span>
                             </div>
                           )}
                        </div>
                     </div>
                  </section>



               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
