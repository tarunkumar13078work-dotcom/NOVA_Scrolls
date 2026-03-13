import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkles, Upload } from 'lucide-react';
import { pop } from '../animations/presets.js';

const statusOptions = [
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'planning', label: 'Planning' },
];

const UploadForm = ({ onSubmit, onImportBackup, onAutofillMetadata }) => {
  const [form, setForm] = useState({
    sourceUrl: '',
    title: '',
    cover: '',
    totalChapters: '',
    currentChapter: '',
    status: 'reading',
    latestChapter: '',
    favorite: false,
    collection: '',
    tags: '',
  });
  const [autofillBusy, setAutofillBusy] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      favorite: Boolean(form.favorite),
      collection: form.collection.trim(),
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.json') && !lowerName.endsWith('.csv')) return;
    const text = await file.text();
    await onImportBackup?.({ fileText: text, fileName: file.name });
  };

  const handleAutofill = async () => {
    if (!form.sourceUrl.trim()) return;
    setAutofillBusy(true);
    try {
      const data = await onAutofillMetadata?.(form.sourceUrl.trim());
      if (!data) return;
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        cover: data.cover || prev.cover,
        totalChapters: data.totalChapters || prev.totalChapters,
        latestChapter: data.latestChapter || prev.latestChapter,
      }));
    } finally {
      setAutofillBusy(false);
    }
  };

  return (
    <motion.form
      variants={pop}
      initial="initial"
      animate="animate"
      onSubmit={handleSubmit}
      className="glass-card card-sheen grid gap-6 rounded-2xl border border-white/10 p-6 md:grid-cols-2"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Source URL (AI Autofill)</label>
          <div className="mt-2 flex gap-2">
            <input
              name="sourceUrl"
              value={form.sourceUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
            />
            <button
              type="button"
              onClick={handleAutofill}
              className="button-ghost"
              disabled={autofillBusy}
            >
              <Sparkles className="h-4 w-4" />
              {autofillBusy ? 'Filling...' : 'AI Fill'}
            </button>
          </div>
        </div>
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
          <div>
            <label className="text-sm text-slate-300">Collection</label>
            <input
              name="collection"
              value={form.collection}
              onChange={handleChange}
              placeholder="Murim Collection"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-slate-300">Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="Action, Fantasy, Regression"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-aqua"
            />
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

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            name="favorite"
            checked={form.favorite}
            onChange={handleChange}
            className="h-4 w-4 rounded border-white/20 bg-white/5 text-aqua focus:ring-aqua"
          />
          Add as favorite
        </label>

        <motion.button whileTap={{ scale: 0.98 }} type="submit" className="button-cta w-full justify-center">
          <Upload className="h-4 w-4" />
          Add manhwa
        </motion.button>
        <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-3 py-2 text-xs text-slate-300">
          <div className="mb-1 flex items-center gap-1 text-slate-200">
            <Download className="h-3.5 w-3.5" />
            Desktop quick import
          </div>
          Drag and drop a JSON or CSV backup file here to import your library.
        </div>
      </div>
    </motion.form>
  );
};

export default UploadForm;
