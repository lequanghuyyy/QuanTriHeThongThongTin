export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 w-full mb-4 rounded-sm"></div>
      <div className="h-4 bg-gray-200 w-3/4 mb-2 rounded"></div>
      <div className="h-4 bg-gray-200 w-1/2 mb-4 rounded"></div>
      <div className="flex gap-2 mb-3">
        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-5 bg-gray-200 w-1/3 mt-auto rounded"></div>
    </div>
  );
};
