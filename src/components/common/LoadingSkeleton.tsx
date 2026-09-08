import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-6 animate-pulse" aria-label="सामग्री लोड हो रही है...">
      {/* Category Pills Skeleton */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="h-4 w-44 bg-slate-200 rounded-md mb-3"></div>
        <div className="flex items-center gap-2 overflow-x-hidden">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-8 w-28 bg-slate-200 rounded-full shrink-0"></div>
          ))}
        </div>
      </div>

      {/* 4-Box Matrix Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-6 w-56 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-32 bg-slate-200 rounded-md hidden sm:block"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="h-12 bg-slate-200"></div>
              <div className="p-3 space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="space-y-1.5 py-1">
                    <div className="h-3.5 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Posts Skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-60 bg-slate-200 rounded-md"></div>
          <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6].map((card) => (
            <div key={card} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-slate-200 rounded-full"></div>
                <div className="h-4 w-16 bg-slate-200 rounded"></div>
              </div>
              <div className="h-5 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded w-4/6"></div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="h-3.5 w-20 bg-slate-100 rounded"></div>
                <div className="h-3.5 w-24 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
