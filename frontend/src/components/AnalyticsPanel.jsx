import React from 'react';
import { Flame, Gauge, TrendingUp } from 'lucide-react';

const metricCard = 'rounded-2xl border border-white/10 bg-white/5 p-3';

const AnalyticsPanel = ({ analytics }) => {
  if (!analytics) return null;

  const maxDaily = Math.max(1, ...(analytics.dailySeries || []).map((row) => row.chapters || 0));
  const heatmapRows = [];
  const heatmap = analytics.heatmap || [];
  for (let idx = 0; idx < heatmap.length; idx += 7) {
    heatmapRows.push(heatmap.slice(idx, idx + 7));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={metricCard}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Streak</p>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            <Flame className="h-4 w-4 text-amber-300" />
            <span>{analytics.readingStreak} days</span>
          </div>
        </div>
        <div className={metricCard}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Weekly</p>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            <TrendingUp className="h-4 w-4 text-aqua" />
            <span>{analytics.chaptersPerWeek} ch</span>
          </div>
        </div>
        <div className={metricCard}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Speed</p>
          <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-white">
            <Gauge className="h-4 w-4 text-neon" />
            <span>{analytics.readingSpeed}/day</span>
          </div>
        </div>
        <div className={metricCard}>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completion</p>
          <p className="mt-1 text-lg font-semibold text-white">{analytics.completionRate}%</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reading Trend (14d)</p>
          <div className="mt-3 flex h-28 items-end gap-1">
            {(analytics.dailySeries || []).map((row) => (
              <div key={row.date} className="flex-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-aqua/70 to-neon/70"
                  style={{ height: `${Math.max(4, Math.round(((row.chapters || 0) / maxDaily) * 100))}%` }}
                  title={`${row.date}: ${row.chapters} chapters`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Favorite Genres</p>
          <div className="mt-3 space-y-2">
            {(analytics.favoriteGenres || []).length ? (
              analytics.favoriteGenres.map((genre) => {
                const width = Math.min(100, genre.count * 20);
                return (
                  <div key={genre.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{genre.name}</span>
                      <span>{genre.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-neon to-aqua" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">No genre history yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reading Heatmap</p>
        <div className="mt-3 grid grid-flow-col auto-cols-max gap-1 overflow-x-auto pb-1">
          {heatmapRows.map((week, idx) => (
            <div key={idx} className="grid grid-rows-7 gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className="h-3 w-3 rounded-sm border border-white/10"
                  style={{ backgroundColor: `rgba(0, 232, 255, ${0.08 + day.intensity * 0.72})` }}
                  title={`${day.date}: ${day.count} chapters`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
