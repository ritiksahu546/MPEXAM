import React from 'react';
import { Post } from '../../types';
import { Calendar, Building, GraduationCap, Users, ArrowRight, Eye } from 'lucide-react';

interface Props {
  post: Post;
  onSelect: (slug: string) => void;
}

export const JobCard: React.FC<Props> = ({ post, onSelect }) => {
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'job':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'admit_card':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'result':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'answer_key':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'scheme':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPostTypeHindi = (type: string) => {
    switch (type) {
      case 'job': return 'नवीनतम भर्ती';
      case 'admit_card': return 'प्रवेश पत्र';
      case 'result': return 'परीक्षा परिणाम';
      case 'answer_key': return 'उत्तर कुंजी';
      case 'scheme': return 'सरकारी योजना';
      default: return 'अपडेट';
    }
  };

  return (
    <article 
      onClick={() => onSelect(post.slug)}
      className="group bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative"
    >
      {post.featured && (
        <div className="absolute top-0 right-5 -translate-y-1/2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
          ★ मुख्य आकर्षण
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getBadgeColor(post.postType)}`}>
            {getPostTypeHindi(post.postType)}
          </span>
          <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-600" />
            <span className="truncate max-w-[180px]">{post.organization}</span>
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2 mb-2">
          {post.titleHindi || post.title}
        </h3>

        <p className="text-xs text-slate-700 line-clamp-2 mb-3 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-150 mb-3">
          {post.vacancy && (
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{post.vacancy}</span>
            </div>
          )}
          {post.qualification && (
            <div className="flex items-center gap-1.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate text-slate-700">{post.qualification}</span>
            </div>
          )}
          {post.applicationLastDate && (
            <div className="flex items-center gap-1.5 col-span-2 text-red-600 font-medium">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>अंतिम तिथि: <strong className="text-red-700 font-bold">{post.applicationLastDate}</strong></span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs mt-auto">
        <span className="text-slate-600 flex items-center gap-1 text-[11px]">
          <Eye className="w-3 h-3 text-slate-600" />
          {post.viewCount ? `${post.viewCount.toLocaleString()} बार देखा गया` : 'नया पोस्ट'}
        </span>

        <span className="inline-flex items-center gap-1 font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform text-xs">
          <span>विवरण देखें</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
