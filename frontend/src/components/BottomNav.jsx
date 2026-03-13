import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Bell, Upload, User } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <BookOpen className="h-5 w-5" />, end: true },
  { to: '/updates', label: 'Updates', icon: <Bell className="h-5 w-5" /> },
  { to: '/upload', label: 'Upload', icon: <Upload className="h-5 w-5" /> },
  { to: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-2 z-40 mx-auto flex w-[calc(100%-1rem)] max-w-md items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-lg md:hidden" style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 text-xs font-semibold transition ${
              isActive ? 'text-aqua' : 'text-slate-200'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.icon}
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-1 bottom-0 h-8 rounded-xl bg-white/10 backdrop-blur"
                  transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
