import React from 'react';
import { Post } from '../../types';
import { ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  title: string;
  titleEn: string;
  posts: Post[];
  accentColor: 'blue' | 'amber' | 'emerald' | 'purple';
  onSelectPost: (slug: string) => void;
  onViewAll: () => void;
}

export const QuickTableCard: React.FC<Props> = ({
  title,
  titleEn,
  posts,
  accentColor,
  onSelectPost,
  onViewAll
}) => {
  const colorMap = {
    blue: {
      header: 'bg-blue-700 text-white',
      border: 'border-blue-200',
      tag: 'bg-blue-50 text-blue-700'
    },
    amber: {
      header: 'bg-amber-600 text-white',
      border: 'border-amber-200',
      tag: 'bg-amber-50 text-amber-800'
    },
    emerald: {
      header: 'bg-emerald-700 text-white',
      border: 'border-emerald-200',
      tag: 'bg-emerald-50 text-emerald-800'
    },
    purple: {
      header: 'bg-purple-700 text-white',
      border: 'border-purple-200',
      tag: 'bg-purple-50 text-purple-800'
    }
  };

  const theme = colorMap[accentColor];

  return (
    <div className={`bg-white rounded-xl border ${theme.border} shadow-xs overflow-hidden flex flex-col h-full`}>
      <div className={`${theme.header} p-3 sm:p-3.5 flex items-center justify-between`}>
        <div>
          <h2 className="font-bold text-base sm:text-lg flex items-center gap-1.5 leading-tight">
            <span>{title}</span>
          </h2>
          <span className="text-[11px] opacity-90 tracking-wide uppercase font-medium">{titleEn}</span>
        </div>
        <button
          onClick={onViewAll}
          className="text-[11px] font-bold bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-md transition-colors"
        >
          सभी देखें
        </button>
      </div>

      <div className="p-3 flex-1 flex flex-col divide-y divide-slate-100">
        {posts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-600">
            फिलहाल कोई नया अपडेट नहीं है।
          </div>
        ) : (
          posts.slice(0, 5).map((post) => (
            <div
              key={post.id}
              onClick={() => onSelectPost(post.slug)}
              className="py-2.5 px-1 hover:bg-slate-50 rounded-md transition-colors cursor-pointer group flex items-start gap-2"
            >
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                  {post.titleHindi || post.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                  <span className="truncate">{post.organization}</span>
                  {post.applicationLastDate && (
                    <span className="text-red-600 font-medium shrink-0">
                      अंतिम: {post.applicationLastDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
        >
          <span>इस श्रेणी के सभी {posts.length} पोस्ट देखें</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
