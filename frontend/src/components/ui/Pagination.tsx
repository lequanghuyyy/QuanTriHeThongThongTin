import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="w-9 h-9 flex items-center justify-center text-gray-400">
              <MoreHorizontal size={16} />
            </span>
          ) : (
            <button
              onClick={() => onPageChange(page as number)}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded text-sm font-medium transition-colors border",
                currentPage === page
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {page}
            </button>
          )}
        </div>
      ))}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
