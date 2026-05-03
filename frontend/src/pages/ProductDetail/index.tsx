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
import { 
  ChevronRight, Star, Minus, Plus, ShoppingBag, 
  ShoppingCart, Truck, ShieldCheck, RotateCcw,
  CheckCircle2, MessageSquare
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from '../../utils/toast';

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
  const [reviewPage, setReviewPage] = useState(0); // API uses 0-based pagination
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug!),
    enabled: !!slug
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', slug, reviewPage, ratingFilter],
    queryFn: () => {
      const params: any = { page: reviewPage, size: 5 };
      if (ratingFilter !== undefined) {
        params.rating = ratingFilter;
      }
      return productApi.getReviews(slug!, params);
    },
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
      // Assuming response.data contains the cart with itemCount
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

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>;
  if (isError || !product) return <div className="p-8 text-center text-red-500">Không tìm thấy sản phẩm.</div>;

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

  // Specs
  const hasSpecs = product.lensIndex || product.material || product.frameShape;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to={`/san-pham?categorySlug=${product.category?.slug}`} className="hover:text-primary transition-colors">
          {product.category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-16">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-[4/3] sm:aspect-square bg-gray-50 rounded-image overflow-hidden flex items-center justify-center p-8 border border-gray-100 relative group cursor-zoom-in">
            <img 
              src={mainImage || 'https://placehold.co/800x800/E8E8E8/474747?text=No+Image'} 
              alt={product.name} 
              className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const fallback = product.thumbnailUrl || product.images?.[0]?.imageUrl || 'https://placehold.co/800x800/E8E8E8/474747?text=No+Image';
                if (e.currentTarget.src !== fallback) {
                  e.currentTarget.src = fallback;
                }
              }}
            />
            {product.salePrice && product.discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-danger text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                GIẢM {product.discountPercent}%
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
                    "relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all snap-start bg-gray-50",
                    mainImage === img.imageUrl ? "border-primary" : "border-transparent hover:border-gray-200"
                  )}
                >
                  <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-contain mix-blend-multiply p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-2">
            <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-sm uppercase tracking-wider">
              {product.category?.name}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 mb-4 leading-tight">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center gap-4 mb-6 cursor-pointer group" onClick={() => setActiveTab('reviews')}>
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.round(product.averageRating) ? "currentColor" : "none"} className="mr-0.5" />
              ))}
            </div>
            <span className="text-sm text-gray-500 group-hover:text-primary transition-colors underline decoration-dotted underline-offset-4">
              {product.reviewCount} đánh giá
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3 mb-6">
            {product.salePrice ? (
              <>
                <span className="text-2xl font-bold text-danger">{formatVND(product.salePrice)}</span>
                <span className="text-lg text-gray-400 line-through mb-0.5">{formatVND(product.basePrice)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">{formatVND(product.basePrice)}</span>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed text-sm">
            {product.shortDescription || 'Chưa có mô tả ngắn cho sản phẩm này.'}
          </p>

          <hr className="border-gray-100 mb-8" />

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-6 mb-8">
              {/* Colors */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-900">Màu sắc: {selectedVariant?.colorName}</span>
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
                          "w-10 h-10 rounded-full border-2 transition-all relative outline-none",
                          isSelected ? "border-primary scale-110" : "border-transparent hover:border-gray-300",
                          isOutOfStockAllSizes && "opacity-40 cursor-not-allowed"
                        )}
                        style={{ backgroundColor: v.colorHex }}
                        title={v.colorName}
                      >
                         {isSelected && (
                           <span className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"></span>
                         )}
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">Kích thước</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableSizesForSelectedColor.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={v.stockQuantity === 0}
                        className={clsx(
                          "px-4 py-2 text-sm font-medium rounded-md border transition-all min-w-[3rem]",
                          selectedVariant?.id === v.id 
                            ? "border-primary bg-primary text-white" 
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                          v.stockQuantity === 0 && "opacity-40 cursor-not-allowed line-through decoration-gray-400"
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
          <div className="flex flex-col gap-4 mb-8">
             <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Số lượng</span>
                {selectedVariant && (
                  <span className={clsx("text-sm font-medium", 
                    selectedVariant.stockQuantity > 10 ? "text-success" : 
                    selectedVariant.stockQuantity > 0 ? "text-orange-500" : "text-danger"
                  )}>
                    {selectedVariant.stockQuantity > 10 ? "Còn hàng" : 
                     selectedVariant.stockQuantity > 0 ? `Chỉ còn ${selectedVariant.stockQuantity} sản phẩm` : "Hết hàng"}
                  </span>
                )}
             </div>
             
             <div className="flex gap-4">
                <div className="flex items-center border border-gray-200 rounded-md bg-white h-12 w-32 shrink-0">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || !selectedVariant || selectedVariant.stockQuantity === 0}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedVariant?.stockQuantity || 1}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
                    className="w-12 h-full text-center text-sm font-medium focus:outline-none appearance-none bg-transparent"
                  />
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={!selectedVariant || quantity >= selectedVariant.stockQuantity}
                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-primary hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stockQuantity === 0 || addToCartMutation.isPending}
                  className="flex-1 h-12 border-2 border-primary text-primary font-medium rounded-md flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wider"
                >
                  <ShoppingCart size={18} />
                  Thêm vào giỏ
                </button>
             </div>

             <button 
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stockQuantity === 0 || addToCartMutation.isPending}
                className="w-full h-12 bg-primary text-white font-medium rounded-md flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wider shadow-md hover:shadow-lg"
              >
                <ShoppingBag size={18} />
                Mua ngay
              </button>
          </div>

          {/* USPs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Truck size={20} className="text-gray-400" />
              <span>Giao hàng siêu tốc 2h</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <RotateCcw size={20} className="text-gray-400" />
              <span>Đổi trả miễn phí 7 ngày</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ShieldCheck size={20} className="text-gray-400" />
              <span>Bảo hành 12 tháng</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16 sm:mt-24">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 justify-center sm:justify-start overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('desc')}
              className={clsx(
                "py-4 text-base font-medium transition-colors whitespace-nowrap border-b-2 relative",
                activeTab === 'desc' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              Mô tả chi tiết
            </button>
            {hasSpecs && (
              <button
                onClick={() => setActiveTab('specs')}
                className={clsx(
                  "py-4 text-base font-medium transition-colors whitespace-nowrap border-b-2",
                  activeTab === 'specs' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-900"
                )}
              >
                Thông số kỹ thuật
              </button>
            )}
            <button
              onClick={() => setActiveTab('reviews')}
              className={clsx(
                "py-4 text-base font-medium transition-colors whitespace-nowrap border-b-2",
                activeTab === 'reviews' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              Đánh giá ({product.reviewCount})
            </button>
          </nav>
        </div>

        <div className="py-8">
          {/* Description Tab */}
          {activeTab === 'desc' && (
            <div className="prose prose-sm sm:prose-base max-w-4xl mx-auto text-gray-600 animate-fade-in" dangerouslySetInnerHTML={{ __html: product.description || '<p>Đang cập nhật...</p>' }} />
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && hasSpecs && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <table className="w-full text-sm text-left text-gray-500 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <tbody className="divide-y divide-gray-200">
                  {product.material && (
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 font-medium text-gray-900 w-1/3">Chất liệu</th>
                      <td className="px-6 py-4 bg-white">{product.material}</td>
                    </tr>
                  )}
                  {product.frameShape && (
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 font-medium text-gray-900 w-1/3">Kiểu dáng</th>
                      <td className="px-6 py-4 bg-white">{product.frameShape}</td>
                    </tr>
                  )}
                  {product.lensIndex && (
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 font-medium text-gray-900 w-1/3">Chiết suất</th>
                      <td className="px-6 py-4 bg-white">{product.lensIndex}</td>
                    </tr>
                  )}
                  {product.lensCoating && (
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 font-medium text-gray-900 w-1/3">Lớp phủ</th>
                      <td className="px-6 py-4 bg-white">{product.lensCoating}</td>
                    </tr>
                  )}
                  {product.lensFeature && (
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 font-medium text-gray-900 w-1/3">Tính năng</th>
                      <td className="px-6 py-4 bg-white">{product.lensFeature}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-4xl mx-auto animate-fade-in">
              {!reviewsData ? (
                <div className="text-center py-8 text-gray-500">Đang tải đánh giá...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                  {/* Reviews Summary */}
                  <div className="md:col-span-4 flex flex-col gap-6">
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-bold text-gray-900 mb-2">{reviewsData.summary?.avgRating?.toFixed(1) || '0.0'}</div>
                      <div className="flex justify-center md:justify-start text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={20} fill={i < Math.round(reviewsData.summary?.avgRating || 0) ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{reviewsData.summary?.totalCount || 0} đánh giá</div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewsData.summary?.ratingDistribution?.[star as 1|2|3|4|5] || 0;
                        const percent = (reviewsData.summary?.totalCount || 0) > 0 ? (count / (reviewsData.summary?.totalCount || 1)) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3 text-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => {
                            setRatingFilter(ratingFilter === star ? undefined : star);
                            setReviewPage(0); // Reset to first page when filter changes
                          }}>
                            <span className={clsx("w-3 text-gray-600 font-medium", ratingFilter === star && "text-primary font-bold")}>{star}</span>
                            <Star size={14} fill="currentColor" className="text-yellow-400" />
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }}></div>
                            </div>
                            <span className="w-8 text-right text-gray-500 text-xs">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="md:col-span-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {ratingFilter ? `Đánh giá ${ratingFilter} sao` : "Tất cả đánh giá"}
                      </h3>
                      <div className="flex items-center gap-3">
                        {ratingFilter && (
                          <button onClick={() => {
                            setRatingFilter(undefined);
                            setReviewPage(0);
                          }} className="text-sm text-primary underline">Xóa bộ lọc</button>
                        )}
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                        >
                          <MessageSquare size={16} />
                          Viết đánh giá
                        </button>
                      </div>
                    </div>

                    {reviewsData.reviews.content.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <span className="text-gray-500">Chưa có đánh giá nào phù hợp.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {reviewsData.reviews.content.map((review: any) => (
                          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                                {review.userName ? (
                                  review.userAvatar ? (
                                    <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                  ) : (
                                    review.userName.charAt(0)
                                  )
                                ) : '?'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</span>
                                  {review.isVerifiedPurchase && (
                                    <span className="flex items-center gap-1 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded font-medium">
                                      <CheckCircle2 size={12} /> Đã mua hàng
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">{formatDate(review.createdAt)}</div>
                              </div>
                            </div>
                            <div className="flex text-yellow-400 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1 text-sm">{review.title}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{review.content}</p>
                            
                            {/* Review Images */}
                            {review.imageUrls && review.imageUrls.length > 0 && (
                              <div className="flex gap-2 flex-wrap mt-3">
                                {review.imageUrls.map((url: string, idx: number) => (
                                  <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity">
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
                      <div className="flex justify-center mt-6 gap-2">
                        {[...Array(reviewsData.reviews.totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setReviewPage(i)}
                            className={clsx(
                              "w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors",
                              reviewPage === i ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
        <div className="mt-16 sm:mt-24">
          <h2 className="text-2xl font-serif text-gray-900 mb-8 text-center sm:text-left">Có thể bạn sẽ thích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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

