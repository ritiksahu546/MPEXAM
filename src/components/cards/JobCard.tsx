import React, { useState, useEffect } from 'react';
import { Post } from '../../types';
import { 
  Calendar, 
  Building, 
  GraduationCap, 
  Users, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  FileText, 
  Briefcase, 
  DollarSign, 
  UserCheck, 
  Flame,
  Bookmark
} from 'lucide-react';
import { isJobSaved, toggleJobSaved, BOOKMARKS_EVENT } from '../../utils/bookmarks';

interface Props {
  post: Post;
  onSelect: (slug: string) => void;
}

function parseLastDate(dateStr?: string): { date: Date | null; daysLeft: number | null } {
  if (!dateStr) return { date: null, daysLeft: null };
  const trimmed = dateStr.trim();
  
  let d: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    d = new Date(trimmed);
  } else {
    const parts = trimmed.split(/[-/]/);
    if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      d = new Date(year, month, day);
    } else {
      const direct = new Date(trimmed);
      if (!isNaN(direct.getTime())) d = direct;
    }
  }

  if (d && !isNaN(d.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diffMs = d.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { date: d, daysLeft };
  }
  return { date: null, daysLeft: null };
}

export const JobCard: React.FC<Props> = ({ post, onSelect }) => {
  const [saved, setSaved] = useState<boolean>(() => isJobSaved(post.slug || post.id));

  useEffect(() => {
    setSaved(isJobSaved(post.slug || post.id));

    const handleUpdate = () => {
      setSaved(isJobSaved(post.slug || post.id));
    };

    window.addEventListener(BOOKMARKS_EVENT, handleUpdate);
    return () => window.removeEventListener(BOOKMARKS_EVENT, handleUpdate);
  }, [post.id, post.slug]);

  const handleToggleBookmark = () => {
    const newState = toggleJobSaved({ id: post.id, slug: post.slug });
    setSaved(newState);
  };

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
      case 'syllabus':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'previous_paper':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPostTypeHindi = (type: string) => {
    switch (type) {
      case 'job': return 'नवीनतम भर्ती';
      case 'admit_card': return 'प्रवेश पत्र';
      case 'result': return 'रिजल्ट';
      case 'answer_key': return 'उत्तर कुंजी';
      case 'scheme': return 'सरकारी योजना';
      case 'syllabus': return 'पाठ्यक्रम';
      case 'previous_paper': return 'पुराना पेपर';
      default: return 'अपडेट';
    }
  };

  // Determine intelligent status based on requested rules:
  // TODAY = आज अंतिम दिन
  // 1–3 days = अत्यंत जरूरी
  // 4–7 days = अंतिम तिथि निकट
  // Future = Active
  // Past = आवेदन बंद
  const { daysLeft } = parseLastDate(post.applicationLastDate);
  const isRecent = (() => {
    try {
      const created = new Date(post.createdAt || post.publishedAt || '');
      const diff = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    } catch {
      return false;
    }
  })();

  let statusBadge: { label: string; className: string } = {
    label: 'सक्रिय (Active)',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  if (daysLeft !== null) {
    if (daysLeft < 0) {
      statusBadge = {
        label: 'आवेदन बंद (Closed)',
        className: 'bg-slate-100 text-slate-600 border-slate-300'
      };
    } else if (daysLeft === 0) {
      statusBadge = {
        label: 'आज अंतिम दिन!',
        className: 'bg-rose-100 text-rose-700 border-rose-300 font-extrabold animate-pulse'
      };
    } else if (daysLeft <= 3) {
      statusBadge = {
        label: `अत्यंत जरूरी (${daysLeft} दिन शेष)`,
        className: 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
      };
    } else if (daysLeft <= 7) {
      statusBadge = {
        label: 'अंतिम तिथि निकट',
        className: 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
      };
    } else {
      statusBadge = {
        label: 'सक्रिय (Active)',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    }
  }

  const notificationUrl = post.notificationPdf || post.notificationLink;

  return (
    <article 
      className="group bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden"
    >
      {post.featured && (
        <div className="absolute top-0 left-6 -translate-y-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-b-md shadow-xs flex items-center gap-1 uppercase tracking-wider z-10">
          <Sparkles className="w-2.5 h-2.5 text-slate-950" />
          <span>मुख्य आकर्षण</span>
        </div>
      )}

      <div>
        {/* Top Header Row with Badges and Bookmark action */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getBadgeColor(post.postType)}`}>
              {getPostTypeHindi(post.postType)}
            </span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {isRecent && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                <span>नया</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBookmark();
            }}
            aria-label={saved ? 'हटाएं' : 'सुरक्षित करें'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              saved 
                ? 'bg-amber-50 text-amber-600 border-amber-300' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-slate-200'
            }`}
            title={saved ? 'सुरक्षित (Saved)' : 'बुकमार्क करें (Save)'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Organization Name */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5 truncate">
          <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{post.organization}</span>
          {post.categoryName && (
            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 shrink-0 hidden sm:inline-block">
              {post.categoryName}
            </span>
          )}
        </div>

        {/* Job Titles (Hindi Primary, English Secondary) */}
        <a 
          href={`/job/${post.slug}`}
          onClick={(e) => {
            e.preventDefault();
            onSelect(post.slug);
          }}
          className="block group-hover:text-blue-700 transition-colors"
        >
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2 mb-1">
            {post.titleHindi || post.title}
          </h3>
          {post.titleHindi && post.title && post.title !== post.titleHindi && (
            <h4 className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">
              {post.title}
            </h4>
          )}
        </a>

        {/* Excerpt if present */}
        {post.excerpt && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/90 p-3 rounded-xl border border-slate-150 mb-3.5">
          {post.vacancy && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate text-slate-700">
                कुल पद: <strong className="text-slate-900 font-bold">{post.vacancy}</strong>
              </span>
            </div>
          )}

          {post.qualification && (
            <div className="flex items-center gap-1.5 min-w-0">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="truncate text-slate-700 font-medium" title={post.qualification}>
                {post.qualification}
              </span>
            </div>
          )}

          {post.ageLimit && (
            <div className="flex items-center gap-1.5 min-w-0">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate text-slate-700">
                आयु: <span className="font-semibold text-slate-800">{post.ageLimit}</span>
              </span>
            </div>
          )}

          {post.salary && (
            <div className="flex items-center gap-1.5 min-w-0">
              <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate text-slate-700 font-medium" title={post.salary}>
                {post.salary}
              </span>
            </div>
          )}

          {post.applicationStartDate && (
            <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 text-slate-700">
              <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              <span className="truncate text-[11px]">
                प्रारंभ: <span className="font-medium text-slate-800">{post.applicationStartDate}</span>
              </span>
            </div>
          )}

          {post.applicationLastDate && (
            <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 text-slate-700">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span className="truncate text-[11px]">
                अंतिम तिथि: <strong className="text-red-600 font-bold">{post.applicationLastDate}</strong>
              </span>
            </div>
          )}

          {post.examDate && (
            <div className="flex items-center gap-1.5 col-span-2 text-slate-700 border-t border-slate-200/60 pt-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-600" />
              <span className="truncate text-[11px]">
                परीक्षा तिथि: <span className="font-bold text-blue-800">{post.examDate}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action CTAs (3 Required Buttons) */}
      <div className="pt-3 border-t border-slate-150 mt-auto flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {post.applyLink ? (
            <a
              href={post.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>ऑनलाइन आवेदन</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(post.slug)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>आवेदन लिंक</span>
            </button>
          )}

          {notificationUrl ? (
            <a
              href={notificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <FileText className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">अधिसूचना PDF</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(post.slug)}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium text-center transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>विज्ञप्ति पत्र</span>
            </button>
          )}
        </div>

        {/* View Details Primary Action */}
        <button
          type="button"
          onClick={() => onSelect(post.slug)}
          className="w-full py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-blue-800 cursor-pointer"
        >
          <span>संपूर्ण विवरण देखें (View Details)</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </article>
  );
};

