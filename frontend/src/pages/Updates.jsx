import React from 'react';
import { motion } from 'framer-motion';
import { BellRing } from 'lucide-react';
import useData from '../hooks/useData.js';
import UpdateCard from '../components/UpdateCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { fadeIn, stagger } from '../animations/presets.js';

const Updates = () => {
  const { updates, markAsRead, loading } = useData();
  const unread = updates.filter((u) => (u.unread || (u.latestChapter || 0) - (u.currentChapter || 0)) > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Updates</p>
          <h2 className="text-xl font-semibold text-white">Unread drops</h2>
          <p className="text-sm text-slate-400">Sync progress across your library in one tap.</p>
        </div>
        <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-aqua/20 text-aqua md:flex">
          <BellRing className="h-5 w-5" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="glass-card h-24 animate-pulse rounded-2xl border border-white/10" />
          ))}
        </div>
      ) : unread.length ? (
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid gap-4 md:grid-cols-2"
        >
          {unread.map((item) => (
            <motion.div key={item.id || item.manhwaId} variants={fadeIn}>
              <UpdateCard item={item} onMarkRead={markAsRead} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          title="All caught up"
          subtitle="No new chapters detected. Enjoy the calm before the next cosmic drop."
          action={
            <motion.div whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 text-sm text-slate-300">
              <BellRing className="h-4 w-4" />
              Notifications are standing by.
            </motion.div>
          }
        />
      )}
    </div>
  );
};

export default Updates;
