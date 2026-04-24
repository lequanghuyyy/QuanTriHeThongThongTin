import { OrderStatus } from '../../types/order.types';
import { formatOrderStatus, getOrderStatusColor } from '../../utils/formatters';
import clsx from 'clsx';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span 
      className={clsx(
        "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap",
        getOrderStatusColor(status),
        className
      )}
    >
      {formatOrderStatus(status)}
    </span>
  );
};
