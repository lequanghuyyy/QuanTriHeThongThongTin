import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Truck, RefreshCcw, Eye } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { ProductCard } from '../../components/common/ProductCard';

// ----------------------------------------------------------------------
// 1. HeroBanner
// ----------------------------------------------------------------------
const BANNERS = [
  {
    id: 1,
    title: 'THE ART OF ARCHITECTURAL PRECISION',
    subtitle: 'WINTER AURA COLLECTION',
    image: 'https://placehold.co/1920x800/E8E8E8/474747?text=The+Art+Of+Architectural',
    link: '/bo-suu-tap/winter-aura',
  },
  {
    id: 2,
    title: 'CLEAR VISION, CLEAR MIND',
    subtitle: 'TITANIUM SERIES',
    image: 'https://placehold.co/1920x800/C6C6C6/000000?text=Clear+Vision',
    link: '/bo-suu-tap/titanium',
  },
];

const HeroBanner = () => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % BANNERS.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-gray-100">
      {BANNERS.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20 flex flex-col justify-center items-start p-12 md:p-24">
            <p className="text-white text-sm tracking-[0.2em] mb-4 uppercase">{banner.subtitle}</p>
            <h2 className="text-white text-4xl md:text-6xl font-serif font-bold max-w-2xl mb-8 leading-tight">
              {banner.title}
            </h2>
            <Link 
              to={banner.link}
              className="bg-primary text-white px-8 py-3 rounded-button font-medium hover:bg-gray-800 transition-colors uppercase tracking-wide text-sm"
            >
              Khám phá ngay
            </Link>
          </div>
        </div>
      ))}
      
      {/* Arrows */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-colors">
        <ChevronLeft size={24} />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-colors">
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIdx(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIdx ? 'w-8 bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. USP Bar
// ----------------------------------------------------------------------
const USPBar = () => {
  const usps = [
    { icon: <ShieldCheck size={20} />, text: 'Vệ sinh kính miễn phí tại toàn hệ thống' },
    { icon: <Truck size={20} />, text: 'Giao hàng nhanh chỉ từ 2 ngày' },
    { icon: <RefreshCcw size={20} />, text: 'Thu cũ đổi mới — trợ giá đến 600.000đ' },
    { icon: <Eye size={20} />, text: 'Hỗ trợ đo mắt tại toàn hệ thống' },
  ];

  return (
    <div className="bg-primary text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center gap-4 text-xs font-medium tracking-wide">
          {usps.map((usp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {usp.icon}
              <span>{usp.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. BestSellers
// ----------------------------------------------------------------------
const BestSellers = () => {
  const tabs = [
    { label: 'Gọng Kính', value: 'gong-kinh' },
    { label: 'Kính Mát', value: 'kinh-mat' },
    { label: 'Tròng Kính', value: 'trong-kinh' },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  const { data: products, isLoading } = useQuery({
    queryKey: ['best-sellers', activeTab],
    queryFn: () => productApi.getBestSellers(8, activeTab),
  });

  return (
    <section className="py-[var(--space-section)] container mx-auto px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold mb-8 uppercase tracking-wider">Bán chạy nhất</h2>
        <div className="flex justify-center gap-8 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-4 font-medium text-sm transition-colors relative ${
                activeTab === tab.value ? 'text-primary' : 'text-gray-400 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-[var(--spacing-product-grid-gap)]">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-card aspect-[3/4]" />
            ))
          : products?.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
      
      <div className="mt-12 text-center">
        <Link to={`/san-pham?category=${activeTab}`} className="inline-block border border-primary text-primary px-8 py-3 rounded-button hover:bg-primary hover:text-white transition-colors font-medium text-sm">
          XEM TẤT CẢ
        </Link>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// 4. FeaturedCollections
// ----------------------------------------------------------------------
const FeaturedCollections = () => {
  const { data: collections } = useQuery({
    queryKey: ['collections'],
    queryFn: productApi.getCollections,
  });

  // Mock data if API is empty
  const mockCollections = collections?.length ? collections : [
    { id: 1, name: 'The Rock', slug: 'the-rock', bannerImageUrl: 'https://placehold.co/400x500/E8E8E8/474747?text=The+Rock', description: 'Bold and sturdy' },
    { id: 2, name: 'Aurora Alloy', slug: 'aurora-alloy', bannerImageUrl: 'https://placehold.co/400x500/E8E8E8/474747?text=Aurora+Alloy', description: 'Lightweight titan' },
    { id: 3, name: 'Red Velvet', slug: 'red-velvet', bannerImageUrl: 'https://placehold.co/400x500/E8E8E8/474747?text=Red+Velvet', description: 'Elegant red frames' },
    { id: 4, name: 'Minimalist', slug: 'minimalist', bannerImageUrl: 'https://placehold.co/400x500/E8E8E8/474747?text=Minimalist', description: 'Less is more' },
  ];

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-serif font-bold uppercase tracking-wider">Bộ sưu tập nổi bật</h2>
          <div className="flex gap-2">
            <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-white"><ChevronLeft size={20}/></button>
            <button className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-white"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x scrollbar-hide">
          {mockCollections.map(col => (
            <div key={col.id} className="min-w-[300px] md:min-w-[400px] snap-start group relative rounded-image overflow-hidden cursor-pointer">
              <img src={col.bannerImageUrl} alt={col.name} className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-2xl font-bold mb-2">{col.name}</h3>
                <Link to={`/bo-suu-tap/${col.slug}`} className="text-white flex items-center gap-2 text-sm font-medium hover:underline">
                  Shop now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// 5. CategoryShowcase
// ----------------------------------------------------------------------
const CategoryShowcase = () => {
  const navigate = useNavigate();

  return (
    <section className="py-[var(--space-section)] container mx-auto px-4 md:px-8">
      <h2 className="text-center text-3xl font-serif font-bold mb-12 uppercase tracking-wider">Chọn kính - Kẻ cá tính</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => navigate('/san-pham?gender=MALE')}
          className="relative h-[600px] group cursor-pointer overflow-hidden rounded-image"
        >
          <img src="https://placehold.co/800x600/E8E8E8/474747?text=Gong+Nam" alt="Gọng Nam" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center">
            <h3 className="text-white text-4xl font-serif font-bold mb-6">Gọng Nam</h3>
            <button className="bg-white text-primary px-8 py-3 rounded-button font-medium hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm">
              Xem chi tiết
            </button>
          </div>
        </div>
        <div 
          onClick={() => navigate('/san-pham?gender=FEMALE')}
          className="relative h-[600px] group cursor-pointer overflow-hidden rounded-image"
        >
          <img src="https://placehold.co/800x600/E8E8E8/474747?text=Gong+Nu" alt="Gọng Nữ" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center">
            <h3 className="text-white text-4xl font-serif font-bold mb-6">Gọng Nữ</h3>
            <button className="bg-white text-primary px-8 py-3 rounded-button font-medium hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// 6. NewArrivals
// ----------------------------------------------------------------------
const NewArrivals = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productApi.getNewArrivals(4),
  });

  return (
    <section className="pb-[var(--space-section)] container mx-auto px-4 md:px-8">
      <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-serif font-bold uppercase tracking-wider">Mới nhất</h2>
        <Link to="/san-pham" className="text-sm font-medium hover:text-primary/70 flex items-center gap-2">
          Xem tất cả <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-[var(--spacing-product-grid-gap)]">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-card aspect-[3/4]" />
            ))
          : products?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// 7. BlogHighlights
// ----------------------------------------------------------------------
const BlogHighlights = () => {
  const blogs = [
    { id: 1, title: 'Bí quyết chọn kính phù hợp với khuôn mặt', image: 'https://placehold.co/600x400/E8E8E8/474747?text=Blog+1', date: '20/10/2026' },
    { id: 2, title: 'Xu hướng kính mát mùa hè 2026 không thể bỏ lỡ', image: 'https://placehold.co/600x400/E8E8E8/474747?text=Blog+2', date: '15/10/2026' },
    { id: 3, title: 'Bảo quản kính cận đúng cách để luôn như mới', image: 'https://placehold.co/600x400/E8E8E8/474747?text=Blog+3', date: '05/10/2026' },
  ];

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-center text-3xl font-serif font-bold mb-12 uppercase tracking-wider">Bài viết nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div key={blog.id} className="group cursor-pointer">
              <div className="overflow-hidden rounded-card mb-4 aspect-video">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="text-xs text-gray-500 mb-2">{blog.date}</p>
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">{blog.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// 8. StoreMap
// ----------------------------------------------------------------------
const StoreMap = () => {
  return (
    <section className="py-[var(--space-section)] container mx-auto px-4 md:px-8">
      <div className="relative rounded-[32px] overflow-hidden bg-gray-900 h-[400px] flex items-center justify-center">
        <img src="https://placehold.co/1200x400/1A1A1A/FFFFFF?text=Store+Banner" alt="Stores" className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay" />
        <div className="relative z-10 text-center px-4">
          <h2 className="text-white text-3xl md:text-5xl font-serif font-bold mb-6">HỆ THỐNG 60+ CỬA HÀNG TOÀN QUỐC</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">Trải nghiệm mua sắm trực tiếp với không gian hiện đại và đội ngũ chuyên viên đo mắt giàu kinh nghiệm.</p>
          <Link to="/cua-hang" className="bg-white text-primary px-8 py-3 rounded-button font-medium hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm inline-block">
            Tìm cửa hàng gần bạn
          </Link>
        </div>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// MAIN PAGE EXPORT
// ----------------------------------------------------------------------
export const Home = () => {
  return (
    <div className="w-full">
      <USPBar />
      <HeroBanner />
      <BestSellers />
      <FeaturedCollections />
      <CategoryShowcase />
      <NewArrivals />
      <BlogHighlights />
      <StoreMap />
    </div>
  );
};

export default Home;
