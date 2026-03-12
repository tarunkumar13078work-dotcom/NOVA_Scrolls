import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Background from './Background.jsx';
import BottomNav from './BottomNav.jsx';
import TopBar from './TopBar.jsx';
import { pageTransition } from '../animations/presets.js';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-space text-slate-100">
      <Background />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10">
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
