import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center text-xs text-gray-500 overflow-x-auto hide-scrollbar whitespace-nowrap py-2">
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
        <Home size={12} />
        <span className="sr-only">Trang chủ</span>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={12} className="mx-1 text-gray-400 shrink-0" />
          {item.href ? (
            <Link to={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
