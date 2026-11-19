import React from 'react';
import { Post } from '../../types';
import { ChevronRight, Building, Calendar, ArrowRight } from 'lucide-react';

interface Props {
  title: string;
  titleEn: string;
  posts: Post[];
  accentColor: 'blue' | 'amber' | 'emerald' | 'purple';
  viewAllHref?: string;
  onSelectPost: (slug: string) => void;
  onViewAll: () => void;
}

export const QuickTableCard: React.FC<Props> = ({
  title,
  titleEn,
  posts,
  accentColor,
  viewAllHref,
  onSelectPost,
  onViewAll
}) => {
  const colorMap = {
    blue: {
      header: 'bg-gradient-to-r from-blue-800 to-blue-700 text-white',
      border: 'border-blue-200 hover:border-blue-400',
      badge: 'bg-blue-100 text-blue-800',
      chevron: 'text-blue-600',
      defaultHref: '/jobs'
    },
    amber: {
      header: 'bg-gradient-to-r from-amber-700 to-amber-600 text-white',
      border: 'border-amber-200 hover:border-amber-400',
      badge: 'bg-amber-100 text-amber-800',
      chevron: 'text-amber-600',
      defaultHref: '/admit-cards'
    },
    emerald: {
      header: 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white',
      border: 'border-emerald-200 hover:border-emerald-400',
      badge: 'bg-emerald-100 text-emerald-800',
      chevron: 'text-emerald-600',
      defaultHref: '/results'
    },
    purple: {
      header: 'bg-gradient-to-r from-purple-800 to-purple-700 text-white',
      border: 'border-purple-200 hover:border-purple-400',
      badge: 'bg-purple-100 text-purple-800',
      chevron: 'text-purple-600',
      defaultHref: '/answer-keys'
    }
  };

  const theme = colorMap[accentColor];
  const targetHref = viewAllHref || theme.defaultHref;

  return (
    <div className={`bg-white rounded-2xl border ${theme.border} shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full`}>
      {/* Header */}
      <div className={`${theme.header} p-3.5 sm:p-4 flex items-center justify-between gap-2 min-w-0 shadow-xs`}>
        <div className="min-w-0">
          <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-1.5 leading-tight truncate">
            <span className="truncate">{title}</span>
          </h3>
          <span className="text-[11px] text-white/80 tracking-wider uppercase font-semibold block truncate mt-0.5">
            {titleEn}
          </span>
        </div>
        <a
          href={targetHref}
          onClick={(e) => {
            e.preventDefault();
            onViewAll();
          }}
          className="text-xs font-bold bg-white/20 hover:bg-white/30 active:bg-white/40 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
        >
          <span>सभी</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* List Items */}
      <div className="p-3 flex-1 flex flex-col divide-y divide-slate-100">
        {posts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            वर्तमान में कोई नया अपडेट उपलब्ध नहीं है।
          </div>
        ) : (
          posts.slice(0, 5).map((post, idx) => {
            const isRecent = idx === 0;
            return (
              <a
                key={post.id}
                href={`/job/${post.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectPost(post.slug);
                }}
                className="py-2.5 px-2 hover:bg-slate-50/90 rounded-xl transition-all cursor-pointer group flex items-start gap-2.5 block"
              >
                <div className="mt-1 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                      {post.titleHindi || post.title}
                    </span>
                    {isRecent && (
                      <span className="shrink-0 bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 min-w-0">
                    <span className="truncate flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{post.organization}</span>
                    </span>
                    {post.applicationLastDate && (
                      <span className="text-red-600 font-medium shrink-0 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3 text-red-500 shrink-0" />
                        <span>अंतिम: {post.applicationLastDate}</span>
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:${theme.chevron} group-hover:translate-x-0.5 transition-all shrink-0 mt-1`} />
              </a>
            );
          })
        )}
      </div>

      {/* Footer View All Link */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <a
          href={targetHref}
          onClick={(e) => {
            e.preventDefault();
            onViewAll();
          }}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 group cursor-pointer"
        >
          <span>{title} के सभी {posts.length} अपडेट्स देखें</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
