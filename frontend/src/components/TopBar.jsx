import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, PlusCircle } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

const TopBar = () => {
  const { user } = useAuth();

  return (
    <header className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur card-sheen">
      <Link to="/" className="flex items-center gap-3 text-lg font-semibold">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/70 via-glow/70 to-aqua/70 text-white shadow-neon">
          <Rocket className="h-5 w-5" />
        </span>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Nova Scrolls</div>
          <div className="text-base text-white">Reading Command Center</div>
        </div>
      </Link>

      <div className="flex items-center gap-2">
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
      </div>
    </header>
  );
};

export default TopBar;
