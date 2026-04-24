import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog = ({ isOpen, title, description, onConfirm, onCancel, isLoading }: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={() => !isLoading && onCancel()}
      ></div>
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in">
        <div className="p-6">
          <h3 className="font-serif text-lg text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-danger text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            Xác nhận
          </button>
        </div>
        
        <button 
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
