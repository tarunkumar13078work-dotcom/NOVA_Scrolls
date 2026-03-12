import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { pop } from '../animations/presets.js';

const statusOptions = [
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'planning', label: 'Planning' },
];

const UploadForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    title: '',
    cover: '',
    totalChapters: '',
    currentChapter: '',
    status: 'reading',
    latestChapter: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      title: form.title.trim(),
      cover: form.cover.trim(),
      totalChapters: Number(form.totalChapters) || 0,
      currentChapter: Number(form.currentChapter) || 0,
      status: form.status,
      latestChapter: Number(form.latestChapter || form.totalChapters) || 0,
    });
  };

  return (
    <motion.form
      variants={pop}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
      className="glass-card card-sheen grid gap-6 rounded-2xl border border-white/10 p-6 md:grid-cols-2"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Title</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Cyber Odyssey"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300">Total chapters</label>
            <input
              name="totalChapters"
              type="number"
              value={form.totalChapters}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Current chapter</label>
            <input
              name="currentChapter"
              type="number"
              value={form.currentChapter}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Latest chapter</label>
            <input
              name="latestChapter"
              type="number"
              value={form.latestChapter}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-space text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Cover URL</label>
          <input
            name="cover"
            value={form.cover}
            onChange={handleChange}
            placeholder="https://..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
          />
          <div className="mt-3 h-48 overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/5 shadow-card">
            {form.cover ? (
              <img src={form.cover} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Live preview</div>
            )}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} type="submit" className="button-cta w-full justify-center">
          <Upload className="h-4 w-4" />
          Add manhwa
        </motion.button>
      </div>
    </motion.form>
  );
};

export default UploadForm;
