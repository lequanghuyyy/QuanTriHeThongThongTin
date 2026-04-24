import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-background pt-16 pb-8 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Logo & Company */}
          <div className="flex flex-col items-start gap-6">
            <Link to="/" className="flex flex-col items-center">
              <span className="font-serif font-bold text-3xl tracking-widest leading-none text-primary">HMK</span>
              <span className="text-xs tracking-[0.3em] font-sans text-primary">EYEWEAR</span>
            </Link>
            <div className="text-sm text-secondary-dark uppercase font-semibold leading-relaxed">
              CÔNG TY TNHH KÍNH MẮT HMK VIETNAM<br />
              HMK EYEWEAR VIETNAM COMPANY LIMITED
            </div>
          </div>

          {/* Col 2: Giới thiệu */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-primary">Giới thiệu</h3>
            <p className="text-sm text-secondary-dark leading-relaxed">
              Cửa hàng chuyên cung cấp các loại mắt kính - gọng kính với mức giá phù hợp với tâm lý khách hàng và có tính cạnh tranh cao. HMK Eyewear luôn luôn mong muốn làm hài lòng tất cả khách hàng.
            </p>
          </div>

          {/* Col 3: Chính sách */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-primary">Chính sách</h3>
            <ul className="flex flex-col gap-3 text-sm text-secondary-dark">
              <li><Link to="/chinh-sach-bao-mat" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/chinh-sach-van-chuyen" className="hover:text-primary transition-colors">Chính sách Vận chuyển và Kiểm tra hàng HMK Eyewear</Link></li>
              <li><Link to="/chinh-sach-thanh-toan" className="hover:text-primary transition-colors">Chính sách thanh toán</Link></li>
              <li><Link to="/chinh-sach-bao-hanh" className="hover:text-primary transition-colors">Chính sách bảo hành</Link></li>
            </ul>
          </div>

          {/* Col 4: Liên hệ */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-primary">Liên hệ</h3>
            <ul className="flex flex-col gap-4 text-sm text-secondary-dark">
              <li className="flex gap-4">
                <span className="font-medium min-w-16">Địa chỉ</span>
                <span>324D Lý Thường Kiệt, Phường Diên Hồng, TP.HCM, Việt Nam</span>
              </li>
              <li className="flex gap-4">
                <span className="font-medium min-w-16">Hotline</span>
                <a href="tel:19009368" className="hover:text-primary transition-colors">1900 9368</a>
              </li>
              <li className="flex gap-4">
                <span className="font-medium min-w-16">Email</span>
                <a href="mailto:hello@hmkeyewear.com" className="hover:text-primary transition-colors">hello@hmkeyewear.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200">
          <p className="text-sm text-secondary-dark mb-4 md:mb-0">
            Copyright © 2026 HMK Eyewear
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm font-medium hover:text-primary text-secondary-dark transition-colors">Shopee</a>
            <a href="#" className="text-sm font-medium hover:text-primary text-secondary-dark transition-colors">Lazada</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
