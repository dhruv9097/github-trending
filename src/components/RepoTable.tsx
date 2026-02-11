'use client';

import { useState, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { syncGithubData, cloneRepo } from '@/app/actions';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for cleaner Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. Updated Interface to match your new CSV structure
interface Repo {
  name: string;           // "google/langextract"
  description: string;
  stars_today: string;    // "1654"
  hype_score: string;     // "1654"
  url: string;
  last_updated?: string;
}

// 2. Extracted Card Component for better performance & animations
const RepoCard = ({ repo, index }: { repo: Repo; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative flex flex-col h-full"
    >
      {/* Glass Container */}
      <div className="relative flex flex-col h-full p-6 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden transition-colors duration-500 group-hover:bg-zinc-900/60 group-hover:border-white/10">
        
        {/* Animated Gradient Glow (The "Aurora" effect on hover) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
        
        {/* Top Stats Row */}
        <div className="relative z-10 flex justify-between items-start mb-6">
          {/* Hype Score Badge */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1">Hype Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-bold text-white tracking-tighter shadow-blue-500/50 drop-shadow-sm">
                {repo.hype_score}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">XP</span>
            </div>
          </div>

          {/* Stars Growth */}
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase mb-1">24h Growth</span>
            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{repo.stars_today}
              </span>
            </div>
          </div>
        </div>

        {/* Repo Info */}
        <div className="relative z-10 mb-6 grow">
          <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">
            {repo.name}
          </h3>
          <p className="text-sm text-zinc-400 font-light leading-relaxed line-clamp-3 h-[60px]">
            {repo.description || "No description provided."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-auto flex gap-3">
          <button
            onClick={() => cloneRepo(repo.name)}
            className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
          >
            Clone
          </button>
          <a
            href={`https://github.com/${repo.name}`}
            target="_blank"
            className="flex-1 py-3 bg-white text-black rounded-xl text-[10px] font-bold uppercase tracking-widest text-center hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95"
          >
            View
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default function RepoTable({ initialData }: { initialData: Repo[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [syncTime, setSyncTime] = useState<string>('--:--');

  useEffect(() => {
    if (initialData[0]?.last_updated) setSyncTime(initialData[0].last_updated);
  }, [initialData]);

  const filteredRepos = initialData.filter(repo =>
    repo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full font-sans selection:bg-blue-500/30">
      {/* Background Elements */}
      <div className="fixed inset-0 aurora-bg z-0 pointer-events-none opacity-50" />
      <div className="fixed inset-0 grain-overlay z-0 pointer-events-none opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Glass Header */}
        <header className="sticky top-6 z-50 flex items-center justify-between p-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl transition-all hover:border-white/20">
          <div className="flex items-center gap-6 pl-6 border-r border-white/10 pr-6 mr-2">
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Discovery</h2>
              <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest mt-0.5 animate-pulse">
                Synced: {syncTime}
              </span>
            </div>
          </div>

          <div className="flex items-center grow px-4 group/search">
            <input
              type="text"
              placeholder="Search trending repos..."
              className="w-full bg-transparent outline-none text-sm font-medium text-white placeholder:text-zinc-600 tracking-wide transition-colors focus:placeholder:text-zinc-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => startTransition(() => syncGithubData())}
            disabled={isPending}
            className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            {isPending ? 'Syncing...' : 'Fetch Today'}
          </button>
        </header>

        {/* Repos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {filteredRepos.map((repo, i) => (
              <RepoCard key={repo.name || i} repo={repo} index={i} />
            ))}
          </AnimatePresence>
        </div>
        
        {/* Empty State */}
        {filteredRepos.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-sm uppercase tracking-widest">No hype found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}