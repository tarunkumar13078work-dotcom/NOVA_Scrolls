import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Clock3, Play, ShieldCheck, Star } from 'lucide-react';
import { cardHover } from '../animations/presets.js';

const statusLabels = {
  reading: 'Reading',
  completed: 'Completed',
  'on-hold': 'On Hold',
  dropped: 'Dropped',
  planning: 'Planning',
};

const badgeColors = {
  reading: 'bg-aqua/20 text-aqua border border-aqua/40',
  completed: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40',
  'on-hold': 'bg-amber-500/15 text-amber-200 border border-amber-500/40',
  dropped: 'bg-rose-500/15 text-rose-200 border border-rose-500/40',
  planning: 'bg-slate-500/20 text-slate-200 border border-slate-500/40',
};

const ManhwaCard = ({ item, onUpdateProgress, onToggleFavorite, onMarkRead }) => {
  const [chapter, setChapter] = useState(item.currentChapter || 0);
  const [expanded, setExpanded] = useState(false);
  const longPressTimer = useRef(null);
  const chapterInputRef = useRef(null);

  useEffect(() => {
    setChapter(item.currentChapter || 0);
  }, [item.currentChapter]);
  const percent = item.totalChapters ? Math.min(100, Math.round((chapter / item.totalChapters) * 100)) : 0;

  const handleUpdate = () => {
    const next = Number.isNaN(Number(chapter)) ? 0 : Number(chapter);
    onUpdateProgress?.(item._id, Math.max(0, next));
  };

  const handleIncrement = () => {
    const next = Math.min(item.totalChapters || chapter + 1, chapter + 1);
    setChapter(next);
    onUpdateProgress?.(item._id, next);
  };

  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      chapterInputRef.current?.focus();
      chapterInputRef.current?.select();
    }, 450);
  };

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleSwipe = (_event, info) => {
    const x = info?.offset?.x || 0;
    if (x > 90) {
      onMarkRead?.(item._id);
    } else if (x < -90) {
      setExpanded(true);
    }
  };

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      animate="rest"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleSwipe}
      onPointerDown={startLongPress}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      className="glass-card card-sheen group relative flex flex-col overflow-hidden rounded-2xl border border-white/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-aqua/10 opacity-0 transition group-hover:opacity-100" />
      <div className="flex gap-4 p-4">
        <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-card">
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5 text-xs text-slate-400">No cover</div>
          )}
          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${badgeColors[item.status] || badgeColors.reading}`}>
            {statusLabels[item.status] || 'Reading'}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.totalChapters || 0} chapters</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleFavorite?.(item._id, !item.favorite)}
                className={`rounded-lg border p-1.5 transition ${
                  item.favorite ? 'border-amber-300/60 bg-amber-300/20 text-amber-300' : 'border-white/15 text-slate-400 hover:border-amber-300/40 hover:text-amber-300'
                }`}
                aria-label={item.favorite ? 'Remove favorite' : 'Mark favorite'}
              >
                <Star className="h-4 w-4" fill={item.favorite ? 'currentColor' : 'none'} />
              </button>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock3 className="h-4 w-4" />
                <span>{new Date(item.updatedAt || item.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {(item.collection || (item.tags && item.tags.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item.collection && (
                <span className="rounded-full border border-aqua/40 bg-aqua/10 px-2 py-0.5 text-aqua">
                  {item.collection}
                </span>
              )}
              {Array.isArray(item.tags) &&
                item.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-slate-300">
                    {tag}
                  </span>
                ))}
            </div>
          )}

          <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              layout
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon via-aqua to-glow"
              style={{ width: `${percent}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Ch. {chapter}</span>
            <span>{percent}% complete</span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            <input
              ref={chapterInputRef}
              type="number"
              min="0"
              className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-0 focus:border-aqua"
              value={chapter}
              onChange={(e) => setChapter(Number(e.target.value))}
            />
            <button
              type="button"
              onClick={handleUpdate}
              className="button-ghost"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleIncrement}
              className="button-cta"
            >
              <Play className="h-4 w-4" />
              +1
            </button>
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="button-ghost"
            >
              <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
              Details
            </button>
          </div>
          {expanded && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-slate-300">
              <p>Swipe right to mark as read. Swipe left to open details.</p>
              <p>Long press chapter input to quickly edit progress.</p>
            </div>
          )}
          {item.unread > 0 && (
            <div className="flex items-center gap-1 text-xs text-aqua">
              <ShieldCheck className="h-4 w-4" />
              <span>{item.unread} unread chapters</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ManhwaCard;
