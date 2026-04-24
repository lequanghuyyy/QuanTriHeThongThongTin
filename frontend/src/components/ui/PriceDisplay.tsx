import { formatVND } from '../../utils/formatters';
import clsx from 'clsx';

interface PriceDisplayProps {
  basePrice: number;
  salePrice?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PriceDisplay = ({ basePrice, salePrice, size = 'md', className }: PriceDisplayProps) => {
  const isSale = salePrice !== undefined && salePrice !== null && salePrice < basePrice;
  const currentPrice = isSale ? salePrice : basePrice;

  const sizeClasses = {
    sm: { current: 'text-sm', original: 'text-xs' },
    md: { current: 'text-base', original: 'text-sm' },
    lg: { current: 'text-xl', original: 'text-base' },
  };

  return (
    <div className={clsx("flex items-center gap-2 flex-wrap", className)}>
      <span className={clsx("font-semibold", isSale ? "text-danger" : "text-gray-900", sizeClasses[size].current)}>
        {formatVND(currentPrice)}
      </span>
      {isSale && (
        <span className={clsx("text-gray-400 line-through", sizeClasses[size].original)}>
          {formatVND(basePrice)}
        </span>
      )}
    </div>
  );
};
