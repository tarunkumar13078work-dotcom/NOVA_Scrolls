import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Background from './Background.jsx';
import BottomNav from './BottomNav.jsx';
import TopBar from './TopBar.jsx';
import { pageTransition } from '../animations/presets.js';
import useData from '../hooks/useData';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const Layout = () => {
  const location = useLocation();
  const { updates, markAsRead } = useData();

  useKeyboardShortcuts({
    onMarkReadTopUpdate: () => {
      const firstUnread = (updates || []).find((item) => (item.unread || 0) > 0);
      if (firstUnread?.manhwaId) {
        markAsRead(firstUnread.manhwaId);
      }
    },
  });

  return (
    <div className="relative min-h-screen bg-space text-slate-100">
      <Background />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-3 pb-28 pt-4 sm:px-4 sm:pt-6 md:px-6 md:pb-10 xl:px-8">
        <TopBar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
