import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookText,
  X,
  ShieldCheck
} from 'lucide-react';

import type { UserRole } from '../types/index';

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

type NavItem = {
  to: string;
  icon: React.ElementType;
  label: string;
};

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, setIsOpen }) => {
  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const staffLinks: NavItem[] = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/users', icon: Users, label: 'Learners' },
    { to: '/staff/lessons/', icon: BookText, label: 'Resources' },
    { to: '/create-staff', icon: ShieldCheck, label: 'Trainers' },
  ];

  const trainerLinks: NavItem[] = [
    { to: '/trainer/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/trainer/learner-list', icon: Users, label: 'Learners' },
    { to: '/staff/lessons/', icon: BookText, label: 'Materials' },
  ];

  const learnerLinks: NavItem[] = [
    { to: '/learner/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/staff/lessons/', icon: BookText, label: 'Lessons' },
  ];

  let links: NavItem[] = learnerLinks;
  const roleLower = role?.toLowerCase();

  if (roleLower === 'staff' || roleLower === 'admin' || roleLower === 'superadmin') {
    links = staffLinks;
  } else if (roleLower === 'trainer' || roleLower === 'teacher') {
    links = trainerLinks;
  } else if (roleLower === 'learner' || roleLower === 'student') {
    links = learnerLinks;
  }


  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[45] lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="main-sidebar"
        role="navigation"
        aria-label="Main navigation"
        className={`
          w-[var(--sidebar-width)] bg-[var(--bg-sidebar)] border-r border-[var(--border-base)] h-screen fixed top-0 flex flex-col z-50
          transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="h-[var(--header-height)] px-6 flex items-center justify-between border-b border-[var(--border-base)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Nubeera Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[var(--text-main)] tracking-tight text-base leading-none">Nubeera</span>
              <span className="text-[10px] text-indigo-600 font-semibold tracking-wider mt-1.5 uppercase opacity-80">Technologies</span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-[var(--text-main)] hover:bg-slate-900/5 transition-all"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-8 overflow-y-auto no-scrollbar mt-10">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to || link.label}
                to={link.to === '/logout' ? '#' : (link.to || '#')}
                onClick={(e) => {
                  if (link.to === '/logout') {
                    e.preventDefault();
                    localStorage.clear();
                    window.location.href = '/login';
                    return;
                  }
                  closeOnMobile();
                }}
                className={({ isActive }) =>
                  `ag-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon
                  className="w-4.5 h-4.5"
                  aria-hidden="true"
                />
                <span className="tracking-tight">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>


      </aside>
    </>
  );
};

export default Sidebar;
