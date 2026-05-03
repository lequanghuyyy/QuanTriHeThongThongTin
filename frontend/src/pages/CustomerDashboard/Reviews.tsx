import { useQuery } from '@tanstack/react-query';
import { reviewApi, type ReviewResponse } from '../../api/reviewApi';
import { formatDate } from '../../utils/formatters';
import { Star, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const Reviews = () => {
  const { data: reviews, isLoading } = useQuery<ReviewResponse[]>({
    queryKey: ['my-reviews'],
    queryFn: () => reviewApi.getMyReviews(),
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Đánh giá của tôi</h1>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải đánh giá...</div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
          <MessageSquare size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 mb-4">Bạn chưa có đánh giá nào.</p>
          <Link to="/tai-khoan/don-hang" className="text-primary font-medium hover:underline">Xem đơn hàng để đánh giá</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded p-2 flex-shrink-0">
                  <img 
                    src={review.productThumbnail || 'https://placehold.co/100'} 
                    alt={review.productName} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <div className="flex-1">
                      <Link 
                        to={`/san-pham/${review.productSlug}`} 
                        className="font-semibold text-gray-900 hover:text-primary transition-colors block"
                      >
                        {review.productName}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{review.variantName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 shrink-0">{formatDate(review.createdAt)}</span>
                      {review.isApproved ? (
                        <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full font-medium">
                          <CheckCircle2 size={12} /> Đã duyệt
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded-full font-medium">
                          <Clock size={12} /> Chờ duyệt
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>

                  <h4 className="font-medium text-sm text-gray-900 mb-1">{review.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
