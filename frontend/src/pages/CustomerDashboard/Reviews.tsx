import { useQuery } from '@tanstack/react-query';
import { reviewApi } from '../../api/reviewApi';
import { formatDate } from '../../utils/formatters';
import { Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Reviews = () => {
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewApi.getMyReviews(),
  });

  const reviews = reviewsData || [];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-serif text-gray-900 mb-6">Đánh giá của tôi</h1>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Đang tải đánh giá...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center">
          <MessageSquare size={48} className="text-gray-200 mb-4" />
          <p className="text-gray-500 mb-4">Bạn chưa có đánh giá nào.</p>
          <Link to="/tai-khoan/don-hang" className="text-primary font-medium hover:underline">Xem đơn hàng để đánh giá</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded p-2 flex-shrink-0">
                  <img src={review.product?.thumbnailUrl || 'https://placehold.co/100'} alt={review.product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <Link to={`/san-pham/${review.product?.slug}`} className="font-semibold text-gray-900 hover:text-primary transition-colors truncate">
                      {review.product?.name}
                    </Link>
                    <span className="text-xs text-gray-500 shrink-0">{formatDate(review.createdAt)}</span>
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
