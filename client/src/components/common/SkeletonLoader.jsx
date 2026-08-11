import React from "react";

export function CardSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 animate-pulse">
      <div className="h-4 bg-dark-800 rounded w-1/3"></div>
      <div className="space-y-2.5">
        <div className="h-3 bg-dark-800 rounded w-full"></div>
        <div className="h-3 bg-dark-800 rounded w-5/6"></div>
        <div className="h-3 bg-dark-800 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3.5">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-panel p-4 rounded-xl border border-dark-850 flex justify-between items-center animate-pulse">
          <div className="space-y-2 w-2/3">
            <div className="h-3 bg-dark-800 rounded w-1/2"></div>
            <div className="h-2.5 bg-dark-800 rounded w-1/3"></div>
          </div>
          <div className="h-6 bg-dark-800 rounded w-12"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-dark-850 h-[220px] flex flex-col justify-between animate-pulse">
      <div className="h-4 bg-dark-800 rounded w-1/4"></div>
      <div className="flex items-end gap-3 h-32 pt-4">
        <div className="bg-dark-800 rounded-t w-full h-1/3"></div>
        <div className="bg-dark-800 rounded-t w-full h-2/3"></div>
        <div className="bg-dark-800 rounded-t w-full h-1/2"></div>
        <div className="bg-dark-800 rounded-t w-full h-5/6"></div>
      </div>
    </div>
  );
}
