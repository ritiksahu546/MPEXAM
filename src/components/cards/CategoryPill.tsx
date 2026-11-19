import React from 'react';
import { Category } from '../../types';
import { normalizeCategorySlug } from '../../utils/sitemapGenerator';
import { 
  Award, 
  FileText, 
  Shield, 
  GraduationCap, 
  MapPin, 
  Home, 
  Briefcase, 
  Globe, 
  CreditCard, 
  CheckCircle, 
  Key, 
  BookOpen, 
  Archive, 
  HeartHandshake, 
  Calendar 
} from 'lucide-react';

interface Props {
  category: Category;
  isSelected?: boolean;
  onClick: (slug: string) => void;
}

export const CategoryPill: React.FC<Props> = ({ category, isSelected = false, onClick }) => {
  const canonicalSlug = normalizeCategorySlug(category.slug);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Award': return <Award className="w-3.5 h-3.5" />;
      case 'FileText': return <FileText className="w-3.5 h-3.5" />;
      case 'Shield': return <Shield className="w-3.5 h-3.5" />;
      case 'GraduationCap': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'MapPin': return <MapPin className="w-3.5 h-3.5" />;
      case 'Home': return <Home className="w-3.5 h-3.5" />;
      case 'Briefcase': return <Briefcase className="w-3.5 h-3.5" />;
      case 'Globe': return <Globe className="w-3.5 h-3.5" />;
      case 'CreditCard': return <CreditCard className="w-3.5 h-3.5" />;
      case 'CheckCircle': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Key': return <Key className="w-3.5 h-3.5" />;
      case 'BookOpen': return <BookOpen className="w-3.5 h-3.5" />;
      case 'Archive': return <Archive className="w-3.5 h-3.5" />;
      case 'HeartHandshake': return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'Calendar': return <Calendar className="w-3.5 h-3.5" />;
      default: return <Briefcase className="w-3.5 h-3.5" />;
    }
  };

  return (
    <a
      href={`/category/${canonicalSlug}`}
      onClick={(e) => {
        e.preventDefault();
        onClick(canonicalSlug);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 border ${
        isSelected
          ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50'
      }`}
    >
      <span className={isSelected ? 'text-white' : 'text-blue-600'}>
        {getIcon(category.icon)}
      </span>
      <span>{category.nameHindi}</span>
    </a>
  );
};
