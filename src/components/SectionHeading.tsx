import React from 'react';
import { Link2 } from 'lucide-react';

interface SectionHeadingProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({ id, children, className = '', dark = false }) => {
  return (
    <h2 className={`group ${className}`}>
      <span className="inline-flex items-center justify-center gap-2">
        {children}
      <a 
        href={`#${id}`}
        className={`opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 outline-none shrink-0 ${
          dark ? 'text-white/40 hover:text-white' : 'text-slate-300 hover:text-blue-600'
        }`}
        title="Link to this section"
        aria-label={`Link to ${id}`}
      >
        <Link2 className="w-5 h-5 md:w-6 md:h-6" />
      </a>
      </span>
    </h2>
  );
};
