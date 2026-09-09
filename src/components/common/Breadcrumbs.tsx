import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  onNavigate: (route: string) => void;
}

export const Breadcrumbs: React.FC<Props> = ({ items, onNavigate }) => {
  // Generate schema.org breadcrumb list
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'होम',
        item: typeof window !== 'undefined' ? window.location.origin : 'https://www.mpexamupdates.in'
      },
      ...items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: item.label,
        item: item.href ? `${typeof window !== 'undefined' ? window.location.origin : ''}#${item.href}` : undefined
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb" className="my-3 py-1 text-xs text-slate-700 overflow-x-auto whitespace-nowrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        <li>
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 text-slate-700 hover:text-blue-700 font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-600" />
            <span>होम</span>
          </button>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
              {item.href && !isLast ? (
                <button
                  onClick={() => onNavigate(item.href!)}
                  className="text-slate-700 hover:text-blue-700 font-medium transition-colors truncate max-w-[200px]"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-slate-900 font-semibold truncate max-w-[260px] sm:max-w-md">
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
