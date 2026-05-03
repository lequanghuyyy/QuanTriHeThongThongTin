import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import { productApi } from '../../api/productApi';
import { cartApi } from '../../api/cartApi';
import { ReviewModal } from '../../components/customer/ReviewModal';
import type { ProductVariant } from '../../types/product.types';
import { formatVND, formatDate } from '../../utils/formatters';
import { ProductCard } from '../../components/common/ProductCard';
import clsx from 'clsx';

// Temporary mock toast
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg)
};

export const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setItemCount = useCartStore(state => state.setItemCount);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [mainImage, setMainImage] = useState<string>('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Reviews state
  const [reviewPage, setReviewPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug!),
    enabled: !!slug
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', slug, reviewPage, ratingFilter],
    queryFn: () => productApi.getReviews(slug!, { page: reviewPage, size: 5, rating: ratingFilter }),
    enabled: !!slug
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related', slug],
    queryFn: () => productApi.getRelated(slug!, 4),
    enabled: !!slug
  });

  useEffect(() => {
    if (product) {
      if (product.variants?.length > 0) {
        setSelectedVariant(product.variants[0]);
      }
      const primaryImg = product.images?.find(img => img.isPrimary)?.imageUrl;
      const firstImage = product.images?.[0]?.imageUrl;
      const fallbackImage = product.thumbnailUrl || 'https://placehold.co/800x800/E8E8E8/474747?text=No+Image';
      setMainImage(primaryImg || firstImage || fallbackImage);
    }
  }, [product]);

  useEffect(() => {
    if (selectedVariant) {
      setQuantity(1);
      if (selectedVariant.imageUrl) {
        setMainImage(selectedVariant.imageUrl);
      }
    }
  }, [selectedVariant]);

  const addToCartMutation = useMutation({
    mutationFn: () => {
      if (!selectedVariant) throw new Error("Vui lòng chọn phân loại");
      return cartApi.addItem(selectedVariant.id, quantity);
    },
    onSuccess: (response) => {
      const cart = response;
      if (cart && typeof cart.itemCount === 'number') {
        setItemCount(cart.itemCount);
      }
      toast.success("Đã thêm vào giỏ hàng!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => toast.error("Không thể thêm vào giỏ"),
  });

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phân loại");
      return;
    }
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phân loại");
      return;
    }
    addToCartMutation.mutate(undefined, {
      onSuccess: () => navigate('/gio-hang')
    });
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500 font-medium">Đang tải sản phẩm...</div>;
  if (isError || !product) return <div className="p-12 text-center text-red-500 font-medium">Không tìm thấy sản phẩm.</div>;

  const handleQuantityChange = (val: number) => {
    if (!selectedVariant) return;
    const max = selectedVariant.stockQuantity;
    if (val < 1) val = 1;
    if (val > max) val = max;
    setQuantity(val);
  };

  // Group variants by size or unique colors
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.colorHex))).map(colorHex => {
    return product.variants.find(v => v.colorHex === colorHex);
  });

  const availableSizesForSelectedColor = selectedVariant
    ? product.variants.filter(v => v.colorHex === selectedVariant.colorHex)
    : [];

  const hasSpecs = product.lensIndex || product.material || product.frameShape;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in font-sans">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-10">
        <Link to="/" className="hover:text-black transition-colors">Trang chủ</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to={`/san-pham?categorySlug=${product.category?.slug}`} className="hover:text-black transition-colors">
          {product.category?.name}
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-black font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-[55%] flex flex-col gap-5">
          <div className="aspect-[4/3] sm:aspect-square bg-slate-50/80 rounded-3xl overflow-hidden flex items-center justify-center p-8 relative group cursor-zoom-in transition-all duration-300 hover:shadow-sm">
            <img
              src={mainImage || 'https://placehold.co/800x800/E8E8E8/474747?text=No+Image'}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                const fallback = product.thumbnailUrl || product.images?.[0]?.imageUrl || 'https://placehold.co/800x800/E8E8E8/474747?text=No+Image';
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
            {product.salePrice && product.discountPercent > 0 && (
              <div className="absolute top-5 left-5 bg-red-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md shadow-red-500/20 tracking-wide">
                -{product.discountPercent}%
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setMainImage(img.imageUrl)}
                  className={clsx(
                    "relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all duration-300 snap-start bg-slate-50",
                    mainImage === img.imageUrl
                      ? "ring-2 ring-black ring-offset-2 scale-[0.98]"
                      : "hover:bg-slate-100 opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-contain mix-blend-multiply p-3" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="w-full lg:w-[45%] flex flex-col py-2">
          <div className="mb-4">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {product.category?.name}
            </span>
          </div>

          <h1 className="text-3xl sm:text-[2.5rem] font-medium text-black mb-5 leading-tight tracking-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6 cursor-pointer group w-fit" onClick={() => setActiveTab('reviews')}>
            <div className="flex items-center gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={clsx("material-symbols-outlined text-[16px]", i >= Math.round(product.averageRating) && "text-gray-300")}
                  style={{ fontVariationSettings: i < Math.round(product.averageRating) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500 group-hover:text-black transition-colors">
              ({product.reviewCount} đánh giá)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-4 mb-8">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-bold text-[#FF0000] tracking-tight">{formatVND(product.salePrice)}</span>
                <span className="text-xl text-black line-through mb-0.5 font-light">{formatVND(product.basePrice)}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-black tracking-tight">{formatVND(product.basePrice)}</span>
            )}
          </div>

          <p className="text-gray-500 mb-8 leading-relaxed text-[15px]">
            {product.shortDescription || 'Chưa có mô tả ngắn cho sản phẩm này. Liên hệ để biết thêm chi tiết.'}
          </p>

          <hr className="border-gray-100 mb-8" />

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-8 mb-10">
              {/* Colors */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-black">Màu sắc: <span className="font-normal text-gray-600 ml-1">{selectedVariant?.colorName}</span></span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((v, idx) => {
                    if (!v) return null;
                    const isSelected = selectedVariant?.colorHex === v.colorHex;
                    const isOutOfStockAllSizes = !product.variants.some(variant => variant.colorHex === v.colorHex && variant.stockQuantity > 0);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          const firstAvailableSize = product.variants.find(variant => variant.colorHex === v.colorHex && variant.stockQuantity > 0)
                            || product.variants.find(variant => variant.colorHex === v.colorHex);
                          if (firstAvailableSize) setSelectedVariant(firstAvailableSize);
                        }}
                        disabled={isOutOfStockAllSizes}
                        className={clsx(
                          "w-11 h-11 rounded-full transition-all duration-300 relative outline-none flex items-center justify-center",
                          isSelected ? "ring-2 ring-offset-2 ring-black scale-105" : "hover:scale-110 shadow-sm",
                          isOutOfStockAllSizes && "opacity-30 cursor-not-allowed"
                        )}
                        style={{ backgroundColor: v.colorHex }}
                        title={v.colorName}
                      >
                        {isOutOfStockAllSizes && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-px bg-red-500 rotate-45 absolute"></div>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sizes */}
              {availableSizesForSelectedColor.some(v => v.size) && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-black">Kích thước</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableSizesForSelectedColor.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQuantity === 0}
                        className={clsx(
                          "px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 min-w-[4rem]",
                          selectedVariant?.id === v.id
                            ? "bg-black text-white shadow-md shadow-black/20"
                            : "bg-slate-50 text-gray-700 hover:bg-black hover:text-white",
                          v.stockQuantity === 0 && "opacity-40 cursor-not-allowed line-through decoration-gray-400 bg-transparent border border-gray-200 hover:bg-transparent hover:text-gray-700"
                        )}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 mb-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-black">Số lượng</span>
              {selectedVariant && (
                <span className={clsx("text-sm font-medium",
                  selectedVariant.stockQuantity > 10 ? "text-emerald-500" :
                    selectedVariant.stockQuantity > 0 ? "text-amber-500" : "text-red-500"
                )}>
                  {selectedVariant.stockQuantity > 10 ? "Còn hàng" :
                    selectedVariant.stockQuantity > 0 ? `Chỉ còn ${selectedVariant.stockQuantity} sản phẩm` : "Hết hàng"}
                </span>
              )}
            </div>

            <div className="flex gap-4">
              {/* Quantity Pill */}
              <div className="flex items-center bg-white rounded-full h-13 w-[130px] shrink-0 border border-gray-400 overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || !selectedVariant || selectedVariant.stockQuantity === 0}
                  className="w-10 h-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>

                <input
                  type="number"
                  min="1"
                  max={selectedVariant?.stockQuantity || 1}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
                  className="w-full h-full text-center text-base font-medium focus:outline-none bg-transparent m-0 p-0 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />

                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={!selectedVariant || quantity >= selectedVariant.stockQuantity}
                  className="w-10 h-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockQuantity === 0 || addToCartMutation.isPending}
                className="flex-1 h-14 bg-white text-black font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/15 hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                Thêm vào giỏ
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={!selectedVariant || selectedVariant.stockQuantity === 0 || addToCartMutation.isPending}
              className="w-full h-14 bg-black text-white font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/15 hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              Mua ngay
            </button>
          </div>

          {/* USPs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-8 mt-auto">
            <div className="flex flex-col gap-2 text-sm">
              <span className="material-symbols-outlined text-[22px] text-gray-400">local_shipping</span>
              <span className="text-gray-600 font-medium">Giao hàng 2h</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="material-symbols-outlined text-[22px] text-gray-400">replay</span>
              <span className="text-gray-600 font-medium">Đổi trả 7 ngày</span>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <span className="material-symbols-outlined text-[22px] text-gray-400">gpp_good</span>
              <span className="text-gray-600 font-medium">Bảo hành 12T</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section - Pill style */}
      <div className="mt-24">
        <div className="flex justify-center mb-10">
          <nav className="flex gap-2 p-1.5 bg-slate-50 rounded-full overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('desc')}
              className={clsx(
                "px-6 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-full",
                activeTab === 'desc' ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black hover:bg-gray-200"
              )}
            >
              Mô tả sản phẩm
            </button>
            {hasSpecs && (
              <button
                onClick={() => setActiveTab('specs')}
                className={clsx(
                  "px-6 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-full",
                  activeTab === 'specs' ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black hover:bg-gray-200"
                )}
              >
                Thông số kỹ thuật
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={clsx(
                "px-6 py-3 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-full",
                activeTab === 'reviews' ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black hover:bg-gray-200"
              )}
            >
              Đánh giá ({product.reviewCount})
            </button>
          </nav>
        </div>

        <div className="py-4">
          {/* Description Tab */}
          {activeTab === 'desc' && (
            <div className="prose prose-slate max-w-4xl mx-auto text-gray-600 animate-fade-in leading-loose" dangerouslySetInnerHTML={{ __html: product.description || '<p className="text-center">Đang cập nhật...</p>' }} />
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && hasSpecs && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left text-gray-600">
                  <tbody className="divide-y divide-gray-50">
                    {product.material && (
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <th className="px-8 py-5 font-semibold text-black w-1/3">Chất liệu</th>
                        <td className="px-8 py-5">{product.material}</td>
                      </tr>
                    )}
                    {product.frameShape && (
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <th className="px-8 py-5 font-semibold text-black w-1/3">Kiểu dáng</th>
                        <td className="px-8 py-5">{product.frameShape}</td>
                      </tr>
                    )}
                    {product.lensIndex && (
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <th className="px-8 py-5 font-semibold text-black w-1/3">Chiết suất</th>
                        <td className="px-8 py-5">{product.lensIndex}</td>
                      </tr>
                    )}
                    {product.lensCoating && (
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <th className="px-8 py-5 font-semibold text-black w-1/3">Lớp phủ</th>
                        <td className="px-8 py-5">{product.lensCoating}</td>
                      </tr>
                    )}
                    {product.lensFeature && (
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <th className="px-8 py-5 font-semibold text-black w-1/3">Tính năng</th>
                        <td className="px-8 py-5">{product.lensFeature}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-5xl mx-auto animate-fade-in">
              {!reviewsData ? (
                <div className="text-center py-12 text-gray-500">Đang tải đánh giá...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                  {/* Reviews Summary */}
                  <div className="md:col-span-4 flex flex-col gap-8 bg-slate-50 p-8 rounded-3xl h-fit">
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-bold text-black mb-3 tracking-tight">{reviewsData.summary?.avgRating?.toFixed(1) || '0.0'}</div>
                      <div className="flex justify-center md:justify-start text-yellow-400 mb-2 gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={clsx("material-symbols-outlined text-[22px]", i >= Math.round(reviewsData.summary?.avgRating || 0) && "text-gray-300")}
                            style={{ fontVariationSettings: i < Math.round(reviewsData.summary?.avgRating || 0) ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 font-medium">{reviewsData.summary?.totalCount || 0} bài đánh giá</div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewsData.summary?.ratingDistribution?.[star as 1 | 2 | 3 | 4 | 5] || 0;
                        const percent = (reviewsData.summary?.totalCount || 0) > 0 ? (count / (reviewsData.summary?.totalCount || 1)) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-70 transition-opacity group" onClick={() => setRatingFilter(ratingFilter === star ? undefined : star)}>
                            <span className={clsx("w-3 text-gray-500 font-medium group-hover:text-black", ratingFilter === star && "text-black font-bold")}>{star}</span>
                            <span className="material-symbols-outlined text-[14px] text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-black rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="w-8 text-right text-gray-400 text-xs font-medium">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="md:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-black">
                        {ratingFilter ? `Lọc theo: ${ratingFilter} sao` : "Khách hàng nói gì?"}
                      </h3>
                      <div className="flex items-center gap-4">
                        {ratingFilter && (
                          <button onClick={() => setRatingFilter(undefined)} className="text-sm text-gray-500 hover:text-black underline underline-offset-4">Xóa bộ lọc</button>
                        )}
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-md shadow-black/10"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          Viết đánh giá
                        </button>
                      </div>
                    </div>

                    {reviewsData.reviews.content.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-gray-200">
                        <span className="text-gray-500 font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên!</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {reviewsData.reviews.content.map((review: any) => (
                          <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                                  {review.userName ? (
                                    review.userAvatar ? (
                                      <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                    ) : (
                                      review.userName.charAt(0)
                                    )
                                  ) : '?'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-black">{review.userName || 'Người dùng ẩn danh'}</span>
                                    {review.isVerifiedPurchase && (
                                      <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                                        <span className="material-symbols-outlined text-[12px]">check_circle</span> Đã mua hàng
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex text-yellow-400 gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <span
                                          key={i}
                                          className={clsx("material-symbols-outlined text-[12px]", i >= review.rating && "text-gray-300")}
                                          style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                                        >
                                          star
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <h4 className="font-semibold text-black mb-2">{review.title}</h4>
                            <p className="text-gray-600 text-[15px] leading-relaxed mb-4">{review.content}</p>

                            {/* Review Images */}
                            {review.imageUrls && review.imageUrls.length > 0 && (
                              <div className="flex gap-3 flex-wrap mt-2">
                                {review.imageUrls.map((url: string, idx: number) => (
                                  <div key={idx} className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                                    <img src={url} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {reviewsData.reviews.totalPages > 1 && (
                      <div className="flex justify-center mt-8 gap-2">
                        {[...Array(reviewsData.reviews.totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setReviewPage(i + 1)}
                            className={clsx(
                              "w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300",
                              reviewPage === i + 1 ? "bg-black text-white shadow-md shadow-black/20" : "bg-slate-50 text-gray-600 hover:bg-black hover:text-white"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-semibold text-black">Có thể bạn sẽ thích</h2>
            <Link to={`/san-pham?categorySlug=${product.category?.slug}`} className="text-sm font-medium text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
              Xem thêm <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && product && (
        <ReviewModal
          item={{
            productName: product.name,
            productSlug: product.slug,
            imageUrl: product.thumbnailUrl || product.images?.[0]?.imageUrl || '',
            alreadyReviewed: false,
          }}
          productId={product.id}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};