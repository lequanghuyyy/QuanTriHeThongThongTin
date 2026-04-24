import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage = ({ message = "Đã có lỗi xảy ra. Vui lòng thử lại sau.", onRetry }: ErrorMessageProps) => {
  return (
    <div className="bg-danger/5 border border-danger/20 rounded-lg p-6 flex flex-col items-center justify-center text-center">
      <AlertCircle size={32} className="text-danger mb-3" />
      <p className="text-danger font-medium mb-4">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-6 py-2 bg-white border border-danger text-danger text-sm font-medium rounded hover:bg-danger hover:text-white transition-colors"
        >
          Thử lại
        </button>
      )}
    </div>
  );
};
