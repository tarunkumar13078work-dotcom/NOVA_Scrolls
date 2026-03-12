import React from 'react';
import { LogOut, RefreshCw, Shield } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import useData from '../hooks/useData.js';
import { motion } from 'framer-motion';
import { fadeIn, stagger } from '../animations/presets.js';

const Profile = () => {
  const { user, logout } = useAuth();
  const { refresh } = useData();

  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="glass-card card-sheen rounded-2xl border border-white/10 p-6"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pilot</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{user?.username}</h2>
        <p className="text-sm text-slate-400">Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mt-6 grid gap-3 md:grid-cols-3"
        >
          {["JWT protected API", "MongoDB Atlas cloud", "Render + Vercel ready"].map((text) => (
            <motion.div
              key={text}
              variants={fadeIn}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"
            >
              <Shield className="mb-2 h-4 w-4 text-aqua" />
              {text}
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={refresh}
            className="button-ghost"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh data
          </motion.button>
          <motion.button whileTap={{ scale: 0.98 }} onClick={logout} className="button-cta">
            <LogOut className="h-4 w-4" />
            Sign out
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
