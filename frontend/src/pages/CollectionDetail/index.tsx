import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/productApi';
import { ProductCard } from '../../components/common/ProductCard';
import { Loader2 } from 'lucide-react';

export const CollectionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('createdAt,desc');

  const { data: collection, isLoading: collectionLoading } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => productApi.getCollectionBySlug(slug!),
    enabled: !!slug,
  });

  const { data: productsPage, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'collection', slug, page, sort],
    queryFn: () => productApi.getList({ 
      collectionSlug: slug,
      page,
      size: 20,
      sort,
    }),
    enabled: !!slug,
  });

  if (collectionLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy bộ sưu tập</h1>
        <Link to="/" className="text-primary hover:underline">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      {collection.bannerImageUrl && (
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={collection.bannerImageUrl}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-white/90 text-lg max-w-2xl">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Filter & Sort Bar */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            {productsPage?.totalElements || 0} sản phẩm
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="createdAt,desc">Mới nhất</option>
            <option value="name,asc">Tên A-Z</option>
            <option value="name,desc">Tên Z-A</option>
            <option value="price,asc">Giá thấp đến cao</option>
            <option value="price,desc">Giá cao đến thấp</option>
          </select>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : productsPage?.content && productsPage.content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsPage.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {productsPage.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2">
                  Trang {page + 1} / {productsPage.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(productsPage.totalPages - 1, page + 1))}
                  disabled={page >= productsPage.totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              Chưa có sản phẩm nào trong bộ sưu tập này
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
