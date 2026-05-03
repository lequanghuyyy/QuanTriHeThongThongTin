import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi, type CreateReviewRequest, type ReviewableItem } from '../../api/reviewApi';
import { axiosInstance } from '../../api/axiosInstance';
import { Star, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface ReviewModalProps {
  item: ReviewableItem;
  onClose: () => void;
  productId?: number; // For direct product review
}

export const ReviewModal = ({ item, onClose, productId }: ReviewModalProps) => {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewRequest) => reviewApi.createReview(data),
    onSuccess: () => {
      // Invalidate tất cả queries liên quan đến reviews của product này
      queryClient.invalidateQueries({ queryKey: ['reviews', item.productSlug] });
      queryClient.invalidateQueries({ queryKey: ['product', item.productSlug] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviewable-items'] });
      alert('Đánh giá của bạn đã được gửi thành công!');
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Không thể gửi đánh giá');
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 images total
    if (images.length + files.length > 5) {
      alert('Bạn chỉ có thể upload tối đa 5 ảnh');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} quá lớn. Kích thước tối đa 5MB`);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} không phải là ảnh`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response; // axiosInstance already unwraps to response.data.data
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error: any) {
      alert(error.message || 'Không thể upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    createReviewMutation.mutate({
      orderItemId: item.orderItemId || undefined,
      productId: productId,
      rating,
      title: title.trim(),
      content: content.trim(),
      imageUrls: images.length > 0 ? images : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-serif text-gray-900">Đánh giá sản phẩm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex gap-4 items-center pb-6 border-b border-gray-100">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded p-2 flex-shrink-0">
              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{item.productName}</h3>
              {item.variantName && <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Đánh giá của bạn <span className="text-danger">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={clsx(
                      'transition-colors',
                      star <= (hoveredRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600 font-medium">
                {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Không hài lòng' : 'Rất tệ'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
              Tiêu đề <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt đánh giá của bạn"
              maxLength={100}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 ký tự</p>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
              Nội dung đánh giá <span className="text-danger">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={6}
              maxLength={1000}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/1000 ký tự</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Hình ảnh (Tối đa 5 ảnh)
            </label>
            
            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mb-3">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={url} alt={`Review ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <div className="text-sm text-gray-500">Đang upload...</div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click để upload</span> hoặc kéo thả
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Max 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading || images.length >= 5}
                />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createReviewMutation.isPending || uploading}
              className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
