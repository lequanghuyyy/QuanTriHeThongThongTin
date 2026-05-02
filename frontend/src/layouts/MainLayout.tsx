import { useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { cartApi } from '../api/cartApi';
import { useCartStore } from '../store/cartStore';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const setItemCount = useCartStore(state => state.setItemCount);

  // Load cart count on mount
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    retry: 1,
    staleTime: 0, // Always fetch fresh data
  });

  useEffect(() => {
    if (cartData) {
      console.log('[MainLayout] Cart data loaded:', cartData);
      console.log('[MainLayout] First item details:', cartData.items[0]);
      setItemCount(cartData.itemCount || 0);
    }
  }, [cartData, setItemCount]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};
