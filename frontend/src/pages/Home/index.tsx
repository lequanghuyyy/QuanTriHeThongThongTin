import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Truck, RefreshCcw, Eye } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { ProductCard } from '../../components/common/ProductCard';
import bannerImg from "../../assets/imageStore.png";
import bannerImg1 from "../../assets/animation1.jpg";

// ----------------------------------------------------------------------
// 1. HeroBanner
// ----------------------------------------------------------------------
const BANNERS = [
  {
    id: 1,
    title: '',
    subtitle: 'WINTER AURA COLLECTION',
    image: bannerImg1,
    link: '/bo-suu-tap/winter-aura',
  },
  {
    id: 2,
    title: '',
    subtitle: 'TITANIUM SERIES',
    image: 'https://scontent.fvca5-1.fna.fbcdn.net/v/t39.30808-6/595512761_1443701357765818_2357912442372904911_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=b895b5&_nc_eui2=AeFkoULA-qAUuQmR49bdlO7yUglWiNvg9MdSCVaI2-D0x0D1InNIPjmAvexzdDQ-NupFKkgIh0VrpzuD1ns2UBMp&_nc_ohc=vJHDsa8saSQQ7kNvwHhcJED&_nc_oc=AdqRBO1FmwL1XxgWmKxAcdZL7PdxfXbGle6p7smvPeQ6PVLGqtH76YW42KMwec5MtWSNkoWQmetSaTdrPj0pAZZU&_nc_zt=23&_nc_ht=scontent.fvca5-1.fna&_nc_gid=neFK2XNcyzvGxe_Ab0FaCg&_nc_ss=7b2a8&oh=00_Af5UDMozbBtvZhcedfcnGAiH3UUP_kzLDJBrEfad-1ka5w&oe=69FD2503',
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
    <div className="relative w-full h-[900px] overflow-hidden bg-gray-100">
      {BANNERS.map((banner, idx) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img src={banner.image} alt={banner.title} className="w-full h-full object-cover mix-blend-multiply" />
         
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
    { label: 'Gọng Kính', value: 'FRAME' },
    { label: 'Kính Mát', value: 'SUNGLASSES' },
    { label: 'Tròng Kính', value: 'LENS' },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].value);

  const { data: products, isLoading } = useQuery({
    queryKey: ['best-sellers', activeTab],
    queryFn: () => productApi.getBestSellers(8, activeTab),
  });

  return (
    <section className="py-[var(--space-section)] container mx-auto px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-8 uppercase tracking-wider">Bán chạy nhất</h2>
        <div className="flex justify-center gap-8 border-b border-gray-200 mt-6">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-4 font-medium text-[14px] transition-colors relative ${
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
        <Link to={`/san-pham?productType=${activeTab}`} className="inline-block border border-primary text-primary px-8 py-3 rounded-button hover:bg-primary hover:text-white transition-colors font-medium text-sm">
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
    { id: 1, name: 'The Rock', slug: 'the-rock', bannerImageUrl: 'https://hmkeyewear.com/wp-content/uploads/2025/02/4.-THE-ROCK.webp', description: 'Bold and sturdy' },
    { id: 2, name: 'Aurora Alloy', slug: 'aurora-alloy', bannerImageUrl: 'https://hmkeyewear.com/wp-content/uploads/2025/02/3.-Aurora-Alloy.webp', description: 'Lightweight titan' },
    { id: 3, name: 'Red Velvet', slug: 'red-velvet', bannerImageUrl: 'https://hmkeyewear.com/wp-content/uploads/2025/02/5.-Red-velvet.webp', description: 'Elegant red frames' },
    { id: 4, name: 'Disc Dream', slug: 'disc-dream', bannerImageUrl: 'https://hmkeyewear.com/wp-content/uploads/2025/02/7.-Disc-Dream.webp', description: 'Less is more' },
  ];

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-sans font-bold uppercase tracking-wider">Bộ sưu tập nổi bật</h2>
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
      <h2 className="text-center text-3xl font-sans font-bold mb-12 uppercase tracking-wider">Chọn kính - Kẻ cá tính</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div 
          onClick={() => navigate('/san-pham?gender=MALE')}
          className="relative h-[600px] group cursor-pointer overflow-hidden rounded-image"
        >
          <img src="https://scontent.fvca5-1.fna.fbcdn.net/v/t39.30808-6/666808471_1550304903772129_328402076671839701_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeEwTijwycfhGN0MAFbLwfe7T7VcC9fZWRVPtVwL19lZFcyMOi72tIwufV0d1R2hm9AhEvtA8uIpf0y01eG93tRR&_nc_ohc=y0J2st0nCaEQ7kNvwHmmZ6d&_nc_oc=AdogGqJSe_G_bthcQWeVJbvjdMO9mj_GZLt76W2ikG7TSkAFj-4kylFq41nAjFNpHjV5psv7o7yS2GLcnxAfNVRF&_nc_zt=23&_nc_ht=scontent.fvca5-1.fna&_nc_gid=AelpFZ-LRw7jItxFGJ72Ww&_nc_ss=7b2a8&oh=00_Af619KPVs7hzb1_B_dvPvKAxh4wq4a8Nc5ri73AuaediOA&oe=69FD2166" alt="Gọng Nam" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center">
           <h1 className="w-full text-left px-8 text-white text-4xl font-sans font-bold">Gọng Nam</h1>
            <button className="bg-black text-white px-8 py-3 rounded-button font-medium hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm mt-60">
              Xem chi tiết
            </button>
          </div>
        </div>
        <div 
          onClick={() => navigate('/san-pham?gender=FEMALE')}
          className="relative h-[600px] group cursor-pointer overflow-hidden rounded-image"
        >
          <img src="https://scontent.fvca5-1.fna.fbcdn.net/v/t39.30808-6/679675933_1565547712247848_7120040392077682858_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeHdf1Hoia8yrTj1Ou4_uczL3hARnOPMUTHeEBGc48xRMUKmDHYB01E3dk20WpKfUb7qVtHbes6yuZcpLC1PmdY0&_nc_ohc=KZUw_MxeSnAQ7kNvwHvCQar&_nc_oc=AdpgS2XoRlWiEs8j6b6FaLKSLc8uSZOIwwt-LrpWPXNR_P88OJp7a9mSObCWIxHxaTKDrMXPFEhVdpRxhJ2SfI9t&_nc_zt=23&_nc_ht=scontent.fvca5-1.fna&_nc_gid=M8CLEHGFFol8ZsrGDfZzNQ&_nc_ss=7b2a8&oh=00_Af78bH9r9X0euc4B6TR_c93Y29tZtwjPNDn3IWbtqpye3g&oe=69FD3E33" alt="Gọng Nữ" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center">
            <h1 className="w-full text-left px-8 text-white text-4xl font-sans font-bold">Gọng Nữ</h1>
            <button className="bg-black text-white px-8 py-3 rounded-button font-medium hover:bg-gray-100 transition-colors uppercase tracking-wide text-sm mt-60">
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
        <h2 className="text-3xl font-sans font-bold uppercase tracking-wider">Mới nhất</h2>
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
    { id: 1, title: 'Siêu khuyến mãi chỉ có tại HMK', image: 'https://scontent.fvca5-1.fna.fbcdn.net/v/t39.30808-6/602330652_1455693543233266_5999574423352990123_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeGTIi1SG2OBUVRl9T__CgP5W3GtEHnnUO5bca0QeedQ7gU95WYd22amr0TCg7YeqgGRGzFIEnlxpcg1COig7RvS&_nc_ohc=sMnxlcw93dEQ7kNvwHpZXbB&_nc_oc=AdqkuLvCggQiwVVT3M2Mm1ffZ8x67z9ar6rxGtJ8MRxu1k0oguzjYXr-La7GvwI2GXxFFA_pCH_Ne3yCsuMOQlAw&_nc_zt=23&_nc_ht=scontent.fvca5-1.fna&_nc_gid=8CGmrGXijz3JpSA32AJu6A&_nc_ss=7b2a8&oh=00_Af7Mxvq_MqmdlPwnTG0wa5hco_qgPQ33l_Q01G_gZR_0vg&oe=69FD408B', date: '20/10/2026' },
    { id: 2, title: 'Diện mạo mới tại chi nhánh HMK Đà Nẵng Store', image: 'https://scontent.fvca5-1.fna.fbcdn.net/v/t39.30808-6/581272527_1422980253171262_6133393421819966415_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeEUyAHsJQvpfeMApttJIoGR-yJwaLgoWrP7InBouChas-iAolb55UWpWsRZgDv0vqw6VXzKg6z_eKk0ILn1CWX_&_nc_ohc=Q6ne0iq5Z8UQ7kNvwGuyfql&_nc_oc=AdqGBuAwOyDtI3sUk2fcJd4_UWZTizsAr4YD3AWsBHWOVZv-V6kESK_S8eHtb2okGpTAdGQTN1Dl5NmsMy8WWbfB&_nc_zt=23&_nc_ht=scontent.fvca5-1.fna&_nc_gid=dpWmHotbYGKXeQ0grTv6tA&_nc_ss=7b2a8&oh=00_Af6Ep9yUc1VtogbTdcLTJICzKlOflOSQBqw1okWAb718ng&oe=69FD214A', date: '15/10/2026' },
    { id: 3, title: 'Nhận diện thương hiệu', image: 'https://scontent.fvca5-1.fna.fbcdn.net/v/t39.30808-6/560664492_1397342659068355_9116625938196319443_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=13d280&_nc_eui2=AeFK_kF81XR7BfsfgDG4Y3ggHsFRUvZyuC8ewVFS9nK4LzuE3Vb0rDe5zgb6V8Nn5VeQMrGXC7WlAlM6L1uEdgCR&_nc_ohc=XwbUIDLbnPgQ7kNvwFW65ip&_nc_oc=AdqlDqB5hcaFnMgVxjSGKXD21WvhAViPpxizkDfqhDnCu4SwAUV0ag9PDIFTPBo6rR61Y8dzdhPoxbOyV9gT9iNh&_nc_zt=23&_nc_ht=scontent.fvca5-1.fna&_nc_gid=jg8yCqvaObPqwrbxtWTEtQ&_nc_ss=7b2a8&oh=00_Af5bzTCChA9_hU-rPye23SlSVcdcA0SXMOdIoKJ8VJpU3A&oe=69FD48D5', date: '05/10/2026' },
  ];

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-center text-3xl font-sans font-bold mb-12 uppercase tracking-wider">Bài viết nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
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
// 8. StoreMap (Đã cập nhật theo giao diện ảnh)
// ----------------------------------------------------------------------
const StoreMap = () => {
  return (
    <section className="w-full bg-[#EFEFEF]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-16 md:p-24">
          <h2 className="text-2xl md:text-3xl font-bold uppercase mb-6 text-gray-900 tracking-wide">
            Hệ thống mắt<br/>kính HMK
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed max-w-md mt-3">
            Hệ thống Mắt Kính HMK với 60+ chi nhánh trên toàn quốc, tập trung hầu hết ở các tỉnh thành lớn như: TP. Hồ Chí Minh, TP. Hà Nội, TP. Đà Nẵng, TP. Cần Thơ và nhiều tỉnh thành khác.
          </p>
        </div>
        <div className="h-[400px] md:h-auto">
          <img 
            src={bannerImg}  
            alt="HMK Sài Gòn Chi Nhánh 20" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// 9. BrandStory (Thêm mới - Câu chuyện HMK)
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// 9. BrandStory
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// 9. BrandStory
// ----------------------------------------------------------------------
const BrandStory = () => {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        {/* Phần Tiêu đề được căn giữa và in đậm */}
        <div className="flex flex-col items-center justify-center text-center mb-16 md:mb-20">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 uppercase text-black">
            Câu chuyện HMK
          </h2>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold uppercase text-black max-w-4xl mx-auto leading-snug">
            Kiến tạo vẻ đẹp thông thái cùng kính mắt hàng đầu Việt Nam
          </h2>
        </div>
        
        {/* Phần Nội dung 3 cột */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 max-w-5xl mx-auto text-left">
          {/* Phương châm */}
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-bold mb-4 text-[#474747]">01</span>
            <h4 className="font-bold text-[15px] mb-2 uppercase text-[#1A1A1A] tracking-wider">Phương châm</h4>
            <p className="text-gray-600 text-[14px] leading-relaxed">Care your eyes, style your life</p>
          </div>
          
          {/* Sứ mệnh */}
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-bold mb-4 text-[#474747]">02</span>
            <h4 className="font-bold text-[15px] mb-2 uppercase text-[#1A1A1A] tracking-wider">Sứ mệnh</h4>
            <p className="text-gray-600 text-[14px] leading-relaxed">Trở thành “Thương hiệu kính mắt hàng đầu Việt Nam”</p>
          </div>
          
          {/* Lan tỏa thông điệp */}
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-bold mb-4 text-[#474747]">03</span>
            <h4 className="font-bold text-[15px] mb-2 uppercase text-[#1A1A1A] tracking-wider">Lan tỏa thông điệp</h4>
            <p className="text-gray-600 text-[14px] leading-relaxed">Đôi mắt thông thái</p>
          </div>
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
    <div className="w-full" style={{ fontFamily: '"Inter", sans-serif' }}>
      <USPBar />
      <HeroBanner />
      <BestSellers />
      <FeaturedCollections />
      <CategoryShowcase />
      <NewArrivals />
      <BlogHighlights />
      <StoreMap />
      <BrandStory />
    </div>
  );
};

export default Home;