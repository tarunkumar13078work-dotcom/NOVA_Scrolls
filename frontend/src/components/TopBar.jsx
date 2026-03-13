import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, BookOpen, Download, PlusCircle, Rocket, User } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import usePwaInstall from '../hooks/usePwaInstall';

const desktopNav = [
  { to: '/', label: 'Dashboard', icon: BookOpen, end: true },
  { to: '/updates', label: 'Updates', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
];

const TopBar = () => {
  const { user } = useAuth();
  const { canInstall, promptInstall } = usePwaInstall();

  return (
    <header className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur card-sheen sm:gap-4 sm:px-4">
      <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/70 via-glow/70 to-aqua/70 text-white shadow-neon">
          <Rocket className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Nova Scrolls</div>
          <div className="text-base text-white">Reading Command Center</div>
        </div>
      </Link>

      <nav className="hidden items-center gap-2 lg:flex">
        {desktopNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-aqua/50 bg-aqua/15 text-aqua shadow-neon'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-aqua/30 hover:text-aqua'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        {canInstall && (
          <button
            type="button"
            onClick={() => promptInstall()}
            className="hidden items-center gap-2 rounded-xl border border-aqua/50 bg-aqua/10 px-3 py-2 text-sm font-semibold text-aqua transition hover:bg-aqua/20 md:inline-flex"
          >
            <Download className="h-4 w-4" />
            Install app
          </button>
        )}
        <NavLink
          to="/upload"
          className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-neon to-aqua px-3 py-2 text-sm font-semibold text-white shadow-neon transition hover:scale-[1.01] md:inline-flex"
        >
          <PlusCircle className="h-4 w-4" />
          Upload
        </NavLink>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 shadow-card"
        >
          <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wider text-aqua">Synced</span>
          <span className="text-sm font-medium">{user?.username || 'Pilot'}</span>
        </motion.div>
        <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 lg:block">
          Shortcuts: <span className="text-aqua">A</span> add, <span className="text-aqua">U</span> updates, <span className="text-aqua">R</span> mark read
        </div>
      </div>
    </header>
  );
};

export default TopBar;
