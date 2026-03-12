import React from 'react';
import { motion } from 'framer-motion';
import UploadForm from '../components/UploadForm.jsx';
import useData from '../hooks/useData.js';
import { fadeIn } from '../animations/presets.js';

const Upload = () => {
  const { addManhwa } = useData();

  return (
    <div className="space-y-6">
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upload</p>
          <h2 className="text-xl font-semibold text-white">Add a new manhwa</h2>
          <p className="text-sm text-slate-400">Set initial progress, status, and cover preview in one go.</p>
        </div>
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="hidden rounded-full border border-aqua/40 bg-aqua/10 px-3 py-1 text-sm font-semibold text-aqua md:block"
        >
          Live preview
        </motion.span>
      </motion.div>

      <UploadForm onSubmit={addManhwa} />
    </div>
  );
};

export default Upload;
