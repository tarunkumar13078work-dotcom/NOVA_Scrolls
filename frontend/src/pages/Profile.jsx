import React, { useRef } from 'react';
import { Download, LogOut, RefreshCw, Shield, Upload } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useData from '../hooks/useData';
import { motion } from 'framer-motion';
import { fadeIn, stagger } from '../animations/presets.js';

const Profile = () => {
  const { user, logout } = useAuth();
  const { refresh, exportLibraryJSON, exportLibraryCSV, importLibraryBackup } = useData();
  const importInputRef = useRef(null);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    await importLibraryBackup({ fileText: text, fileName: file.name });
    event.target.value = '';
  };

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

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Backup</p>
          <h3 className="mt-1 text-sm font-semibold text-white">Export and import library</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={exportLibraryJSON} className="button-ghost">
              <Download className="h-4 w-4" />
              Export JSON
            </button>
            <button type="button" onClick={exportLibraryCSV} className="button-ghost">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button type="button" onClick={handleImportClick} className="button-ghost">
              <Upload className="h-4 w-4" />
              Import Backup
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,text/csv,.csv"
              onChange={handleImportChange}
              className="hidden"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
