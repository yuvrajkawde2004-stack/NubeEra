import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Key, UserCheck, ChevronDown, Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../types/index';

interface HeaderProps {
  user: User | null;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenuToggle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  return (
    <header
      id="main-header"
      className="h-[var(--header-height)] bg-[var(--bg-page)]/80 backdrop-blur-xl border-b border-slate-900/5 fixed top-0 left-0 lg:left-[var(--sidebar-width)] right-0 z-40 transition-all shadow-xl"
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
            {/* Logo or placeholder for header space if needed */}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side — actions */}
        <div className="flex items-center gap-5">
          
          {/* Notifications */}
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition-all border border-transparent hover:border-slate-900/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 border-2 border-[var(--bg-page)] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
          </button>

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
                <img src="/logo.png" alt="Profile Logo" className="w-full h-full object-contain" />
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
                    Modify Experience
                  </Link>

                  <Link
                    to="/change-password"
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 text-[13px] font-bold text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 rounded-2xl transition-all"
                  >
                    <Key className="w-4 h-4" aria-hidden="true" />
                    Security Protocols
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
                    Terminate Session
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
