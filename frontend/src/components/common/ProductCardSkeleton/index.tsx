export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col block bg-white border border-gray-100 rounded-card overflow-hidden">
      {/* Image Skeleton */}
      <div className="relative aspect-square bg-gray-200 animate-pulse" />
      {/* Info Skeleton */}
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3 mt-2" />
      </div>
    </div>
  );
};
