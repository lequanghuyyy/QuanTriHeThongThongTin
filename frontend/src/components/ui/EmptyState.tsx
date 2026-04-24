import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
        <Icon size={32} className="text-gray-300" />
      </div>
      <h3 className="font-serif text-xl text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
