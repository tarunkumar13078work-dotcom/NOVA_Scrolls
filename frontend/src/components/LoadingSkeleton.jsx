import React from 'react';

const LoadingSkeleton = ({ lines = 3 }) => (
  <div className="glass-card card-sheen rounded-2xl border border-white/10 p-4">
    <div
      className="mb-3 h-4 w-1/2 rounded bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-[shimmer_1.4s_linear_infinite]"
      style={{ backgroundSize: '200% 100%' }}
    />
    {[...Array(lines)].map((_, idx) => (
      <div
        key={idx}
        className="mb-2 h-3 w-full rounded bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-[shimmer_1.4s_linear_infinite]"
        style={{ animationDelay: `${idx * 120}ms`, backgroundSize: '200% 100%' }}
      />
    ))}
  </div>
);

export default LoadingSkeleton;
