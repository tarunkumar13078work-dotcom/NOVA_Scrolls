import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { pop } from '../animations/presets.js';

const EmptyState = ({ title, subtitle, action }) => (
  <motion.div
    variants={pop}
    initial="initial"
    animate="animate"
    className="glass-card mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-white/10 px-6 py-10 text-center"
  >
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon/40 via-glow/30 to-aqua/40 text-white shadow-neon">
      <Rocket className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    <p className="text-sm text-slate-400">{subtitle}</p>
    {action}
  </motion.div>
);

export default EmptyState;
