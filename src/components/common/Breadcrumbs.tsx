import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  route?: string;
}

interface Props {
  items: BreadcrumbItem[];
  onNavigate: (route: string) => void;
}

export const Breadcrumbs: React.FC<Props> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="my-3 py-1 text-xs text-slate-700 overflow-x-auto whitespace-nowrap">
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        <li>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="flex items-center gap-1 text-slate-700 hover:text-blue-700 font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-600" />
            <span>होम</span>
          </a>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const targetRoute = item.href || item.route;
          const cleanHref = targetRoute ? `/${targetRoute.replace(/^\/+/, '')}` : undefined;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
              {cleanHref && !isLast ? (
                <a
                  href={cleanHref}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(targetRoute!);
                  }}
                  className="text-slate-700 hover:text-blue-700 font-medium transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-slate-900 font-semibold truncate max-w-[260px] sm:max-w-md" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
