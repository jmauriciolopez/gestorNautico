import React from 'react';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-pulse bg-[#020617] min-h-screen">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <div className="h-2 w-32 bg-slate-800 rounded shadow-sm" />
          <div className="h-10 w-64 bg-slate-800 rounded-xl shadow-md" />
          <div className="h-4 w-80 bg-slate-800/50 rounded shadow-sm" />
        </div>
        <div className="h-12 w-40 bg-slate-800 rounded-xl shadow-lg" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-slate-900/50 rounded-[2rem] border border-slate-800/50 shadow-sm" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 h-[450px] bg-slate-900/50 rounded-[2.5rem] border border-slate-800/50 shadow-xl" />
        
        {/* Activity Skeleton */}
        <div className="h-[450px] bg-slate-900/50 rounded-[2.5rem] border border-slate-800/50 shadow-xl" />
      </div>

      {/* Map Skeleton container */}
      <div className="h-96 bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800/50" />
    </div>
  );
};
