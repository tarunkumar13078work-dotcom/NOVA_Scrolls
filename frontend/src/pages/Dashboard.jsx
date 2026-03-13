import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import useData from '../hooks/useData';
import StatCard from '../components/StatCard.jsx';
import ManhwaCard from '../components/ManhwaCard.jsx';
import AnalyticsPanel from '../components/AnalyticsPanel.jsx';
import AIInsightsPanel from '../components/AIInsightsPanel.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import useToast from '../hooks/useToast';
import useDebouncedValue from '../hooks/useDebouncedValue';
import { stagger } from '../animations/presets.js';

const Dashboard = () => {
  const {
    manhwa,
    stats,
    analytics,
    aiRecommendations,
    aiPredictions,
    aiReadingSpeed,
    loading,
    refresh,
    updateProgress,
    markAsRead,
    toggleFavorite,
    error,
  } = useData();
  const { addToast } = useToast();

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [tag, setTag] = useState('all');
  const [sort, setSort] = useState('recent');
  const listRef = useRef(null);
  const debouncedQuery = useDebouncedValue(query, 250);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    manhwa.forEach((item) => {
      (item.tags || []).forEach((itemTag) => tagSet.add(itemTag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [manhwa]);

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    let list = manhwa.filter((item) => item.title.toLowerCase().includes(q));
    if (status !== 'all') {
      list = list.filter((item) => item.status === status);
    }
    if (tag !== 'all') {
      list = list.filter((item) => Array.isArray(item.tags) && item.tags.includes(tag));
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
    list = list.slice().sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)));
    return list;
  }, [debouncedQuery, manhwa, sort, status, tag]);

  const shouldVirtualize = filtered.length > 30;
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? filtered.length : 0,
    getScrollElement: () => listRef.current,
    estimateSize: () => 258,
    overscan: 6,
  });

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
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <span>Tag</span>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="all" className="bg-space text-white">
                All tags
              </option>
              {allTags.map((itemTag) => (
                <option key={itemTag} value={itemTag} className="bg-space text-white">
                  {itemTag}
                </option>
              ))}
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Analytics</p>
            <h3 className="text-lg font-semibold text-white">Reading intelligence</h3>
          </div>
        </div>
        <AnalyticsPanel analytics={analytics} />
      </div>

      <AIInsightsPanel
        recommendations={aiRecommendations}
        predictions={aiPredictions}
        readingSpeed={aiReadingSpeed}
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, idx) => (
            <LoadingSkeleton key={idx} lines={4} />
          ))}
        </div>
      ) : filtered.length ? (
        shouldVirtualize ? (
          <div ref={listRef} className="max-h-[72vh] overflow-auto pr-1">
            <div
              style={{ height: `${virtualizer.getTotalSize()}px` }}
              className="relative w-full"
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = filtered[virtualRow.index];
                return (
                  <div
                    key={item._id}
                    className="absolute left-0 top-0 w-full pb-4"
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    <ManhwaCard
                      item={item}
                      onUpdateProgress={updateProgress}
                      onMarkRead={markAsRead}
                      onToggleFavorite={toggleFavorite}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((item) => (
              <ManhwaCard
                key={item._id}
                item={item}
                onUpdateProgress={updateProgress}
                onMarkRead={markAsRead}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )
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
