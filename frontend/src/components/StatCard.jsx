import React from 'react';
import { motion } from 'framer-motion';
import { pop, stagger } from '../animations/presets.js';

const StatCard = ({ label, value, accent }) => {
  const gradient = accent === 'aqua' ? 'from-aqua/70 via-aqua/50 to-neon/60' : 'from-neon/70 via-glow/60 to-aqua/60';
  return (
    <motion.div
      variants={pop}
      initial="initial"
      animate="animate"
      className="glass-card card-sheen border border-white/10 rounded-2xl p-4 text-left"
    >
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className={`mt-2 inline-flex items-end gap-2 text-3xl font-semibold text-white bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
        <span>{value}</span>
      </div>
    </motion.div>
  );
};

export default StatCard;
