import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import useData from '../hooks/useData.js';
import StatCard from '../components/StatCard.jsx';
import ManhwaCard from '../components/ManhwaCard.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import useToast from '../hooks/useToast.js';
import { stagger } from '../animations/presets.js';

const Dashboard = () => {
  const { manhwa, stats, loading, refresh, updateProgress, error } = useData();
  const { addToast } = useToast();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('recent');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = manhwa.filter((item) => item.title.toLowerCase().includes(q));
    if (status !== 'all') {
      list = list.filter((item) => item.status === status);
    }
    if (sort === 'recent') {
      list = list.slice().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else if (sort === 'progress') {
      list = list
        .slice()
        .sort(
          (a, b) =>
            (b.currentChapter || 0) / (b.totalChapters || 1) -
            (a.currentChapter || 0) / (a.totalChapters || 1)
        );
    } else if (sort === 'title') {
      list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [manhwa, query, sort, status]);

  const handleRefresh = async () => {
    await refresh();
    addToast('Data refreshed', 'info');
  };

  return (
    <div className="space-y-6">
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid gap-3 md:grid-cols-5">
        <StatCard label="Total Manhwa" value={stats.total} accent="neon" />
        <StatCard label="Reading" value={stats.reading} accent="aqua" />
        <StatCard label="Completed" value={stats.completed} accent="neon" />
        <StatCard label="On Hold" value={stats.onHold} accent="aqua" />
        <StatCard label="Dropped" value={stats.dropped} accent="neon" />
      </motion.div>

      <div className="glass-card flex flex-col gap-3 rounded-2xl border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-5 w-5 text-aqua" />
          <input
            placeholder="Search your library"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <SlidersHorizontal className="h-4 w-4 text-aqua" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="all" className="bg-space text-white">
                All status
              </option>
              <option value="reading" className="bg-space text-white">
                Reading
              </option>
              <option value="completed" className="bg-space text-white">
                Completed
              </option>
              <option value="on-hold" className="bg-space text-white">
                On Hold
              </option>
              <option value="dropped" className="bg-space text-white">
                Dropped
              </option>
              <option value="planning" className="bg-space text-white">
                Planning
              </option>
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <span>Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="recent" className="bg-space text-white">
                Recent
              </option>
              <option value="progress" className="bg-space text-white">
                Progress
              </option>
              <option value="title" className="bg-space text-white">
                Title
              </option>
            </select>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-aqua/50"
          >
            <RefreshCw className="h-4 w-4" />
            Sync
          </motion.button>
        </div>
      </div>

      {error && <p className="text-sm text-amber-300">{error}</p>}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, idx) => (
            <LoadingSkeleton key={idx} lines={4} />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => (
            <ManhwaCard key={item._id} item={item} onUpdateProgress={updateProgress} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No manhwa tracked yet"
          subtitle="Upload a title to start your cosmic reading journey."
          action={
            <a
              href="/upload"
              className="rounded-xl bg-gradient-to-r from-neon to-aqua px-4 py-2 text-sm font-semibold text-white shadow-neon"
            >
              Upload now
            </a>
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
