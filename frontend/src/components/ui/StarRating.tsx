import { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
  rating: number; // Có thể là số thập phân, VD: 4.5
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating = ({ rating, size = 16, interactive = false, onChange }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const renderStars = () => {
    const stars = [];
    const currentRating = hoverRating !== null ? hoverRating : rating;

    for (let i = 1; i <= 5; i++) {
      const isFull = i <= currentRating;
      const isHalf = !isFull && i - 0.5 <= currentRating;
      
      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          className={clsx(
            "focus:outline-none",
            interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"
          )}
          onClick={() => interactive && onChange && onChange(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(null)}
        >
          {isFull ? (
            <Star size={size} className="fill-yellow-400 text-yellow-400" />
          ) : isHalf ? (
            <div className="relative">
              <Star size={size} className="text-gray-300" />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star size={size} className="fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          ) : (
            <Star size={size} className="text-gray-300 fill-gray-100" />
          )}
        </button>
      );
    }
    return stars;
  };

  return <div className="flex items-center gap-1">{renderStars()}</div>;
};
