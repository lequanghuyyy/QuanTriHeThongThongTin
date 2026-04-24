interface PaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(0);
    if (currentPage > 2) {
      pages.push('...');
    }
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }
    pages.push(totalPages - 1);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
      >
        &lt;
      </button>
      {pages.map((p, idx) => (
        typeof p === 'number' ? (
          <button
            key={idx}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
              p === currentPage 
                ? 'bg-primary text-white border-primary' 
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
          >
            {p + 1}
          </button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">...</span>
        )
      ))}
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
      >
        &gt;
      </button>
    </div>
  );
};
