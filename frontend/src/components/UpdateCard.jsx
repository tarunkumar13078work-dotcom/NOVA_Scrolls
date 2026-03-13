import React from 'react';
import { motion } from 'framer-motion';
import { BellRing, CheckCircle2 } from 'lucide-react';
import { cardHover } from '../animations/presets.js';

const UpdateCard = ({ item, onMarkRead }) => {
  const unread = item.unread || Math.max(0, (item.latestChapter || 0) - (item.currentChapter || 0));
  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      animate="rest"
      whileHover="hover"
      className="glass-card card-sheen relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 p-4"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-neon/10 via-transparent to-aqua/10 opacity-0 transition group-hover:opacity-100" />
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-card">
        {item.cover ? (
          <img src={item.cover} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs text-slate-400">No cover</div>
        )}
      </div>
      <div className="flex flex-1 items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-white">{item.title}</h4>
          <p className="text-sm text-slate-400">
            Ch. {item.currentChapter} -> {item.latestChapter}
          </p>
          <p className="text-sm font-semibold text-amber-300">🔥 {unread} new chapter{unread > 1 ? 's' : ''} available</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <BellRing className="h-4 w-4" />
            <span>Last checked {new Date(item.lastChecked || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onMarkRead?.(item.manhwaId)}
          className="button-cta"
        >
          <CheckCircle2 className="h-4 w-4" />
          Mark as read
        </button>
      </div>
    </motion.div>
  );
};

export default UpdateCard;
