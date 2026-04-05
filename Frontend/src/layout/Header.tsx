import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Key, UserCheck, ChevronDown, Menu, Bell, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../types/index';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface HeaderProps {
  user: User | null;
  onMenuToggle: () => void;
  isCollapsed?: boolean;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  link: string;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuToggle, isCollapsed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/lessons/recent?count=5');
      const formatted = data.map((l: any) => ({
        id: l.id,
        title: 'New Lesson Uploaded',
        description: l.subTopic,
        time: formatDistanceToNow(new Date(l.createdAt), { addSuffix: true }),
        link: '/learner/dashboard' // In a real app, this could be more specific
      }));
      setNotifications(formatted);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 2 minutes for "real-time" feel
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const roleDisplay: Record<string, string> = {
    admin: 'Administrator',
    superadmin: 'Super Admin',
    staff: 'System Staff',
    trainer: 'Platform Trainer',
    teacher: 'Platform Trainer',
    learner: 'Learner',
    student: 'Learner',
  };

  const handleNotificationClick = (link: string) => {
    setIsNotificationOpen(false);
    navigate(link);
  };

  return (
    <header
      id="main-header"
      className={`h-[var(--header-height)] bg-[var(--bg-page)]/80 backdrop-blur-xl border-b border-slate-900/5 fixed top-0 left-0 ${isCollapsed ? 'lg:left-20' : 'lg:left-[var(--sidebar-width)]'} right-0 z-40 transition-[left,padding,background] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl`}
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">

        {/* Left side — mobile menu toggle + breadcrumb placeholder */}
        <div className="flex items-center gap-6 min-w-0">
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition-all border border-slate-900/10"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-4">
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side — actions */}
        <div className="flex items-center gap-5">
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 transition-all border ${isNotificationOpen ? 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-lg' : 'border-transparent hover:bg-slate-900/5 hover:border-slate-900/10 hover:text-slate-900'}`}
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-[var(--bg-page)] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-4 w-80 bg-white/95 backdrop-blur-3xl rounded-3xl border border-slate-200 shadow-2xl py-4 z-50 animate-in fade-in zoom-in-95 duration-300">
                <div className="px-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest leading-none">Notifications</h4>
                  {notifications.length > 0 && (
                    <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-full">New Content Available</span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif.link)}
                        className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 mt-0.5 group-hover:scale-110 transition-transform">
                            <Info className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-slate-800 tracking-tight leading-snug">{notif.title}</p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5 truncate">{notif.description}</p>
                            <p className="text-[9px] font-bold text-indigo-500/60 uppercase tracking-tighter mt-2">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-slate-400">
                      <p className="text-xs font-bold uppercase tracking-widest leading-none">No New Updates</p>
                    </div>
                  )}
                </div>
                <div className="px-6 pt-3 mt-1 border-t border-slate-100">
                  <button className="w-full py-3 text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors leading-none">Mark all as acknowledged</button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              id="user-menu-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-2xl transition-all border ${isDropdownOpen ? 'bg-slate-900/5 border-slate-900/20 shadow-xl' : 'border-transparent hover:bg-slate-900/5 hover:border-slate-900/10'}`}
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
            >
              <div
                className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200"
                aria-hidden="true"
              >
                <img 
                  src={user?.profile_picture_url || "/logo.png"} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
                />
              </div>

              <div className="hidden lg:block text-left">
                <p className="text-[13px] font-bold text-slate-900 leading-none tracking-tight">
                   {user?.first_name}
                </p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown menu (Glass) */}
            {isDropdownOpen && (
              <div
                id="user-dropdown"
                role="menu"
                className="absolute right-0 mt-4 w-72 bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="px-6 py-5 border-b border-slate-100 mb-2">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Verified Identity</p>
                  <p className="text-[15px] font-bold text-slate-900 truncate tracking-tight">{user?.email}</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                     {roleDisplay[user?.utype || ''] || user?.utype || 'Member'}
                  </p>
                </div>

                <div className="px-3" role="none">
                  <Link
                    to="/update-profile"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 rounded-2xl transition-all"
                  >
                    <UserCheck className="w-4 h-4" aria-hidden="true" />
                    Update Profile
                  </Link>

                  <Link
                    to="/change-password"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 rounded-2xl transition-all"
                  >
                    <Key className="w-4 h-4" aria-hidden="true" />
                    Change Password
                  </Link>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 px-3" role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3.5 px-4 py-3 text-[13px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
