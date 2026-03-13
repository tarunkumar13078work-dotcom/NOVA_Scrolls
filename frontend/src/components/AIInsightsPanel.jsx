import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

const AIInsightsPanel = ({ recommendations = [], predictions = [], readingSpeed = 0 }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI</p>
          <h3 className="text-lg font-semibold text-white">Smart assistant</h3>
        </div>
        <div className="rounded-full border border-aqua/40 bg-aqua/10 px-2 py-1 text-xs text-aqua">
          {readingSpeed ? `${readingSpeed.toFixed(1)} ch/day` : 'Learning pace'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-aqua" />
            Recommendations
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            {recommendations.length ? (
              recommendations.slice(0, 4).map((item) => (
                <div key={item.title} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.reason}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Build a little more reading history to improve recommendations.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Brain className="h-4 w-4 text-neon" />
            Finish predictions
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            {predictions.length ? (
              predictions.slice(0, 4).map((item) => (
                <div key={item.title} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.insight}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Predictions will appear as soon as your reading pace is learned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
