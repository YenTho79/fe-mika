export const books = [
  {
    id: 1,
    title: 'Hành Trình Qua Những Vì Sao',
    author: 'Kaelen',
    category: 'Viễn tưởng',
    rating: 4.9,
    chapters: 320,
    views: '1.5M',
    status: 'Đang ra',
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop',
    description: 'Khám phá vũ trụ rộng lớn cùng thợ săn tiền thưởng Kaelen trong nhiệm vụ tìm kiếm nguồn năng lượng cổ xưa giữa những hố đen tử thần và các hành tinh bị lãng quên.'
  },
  {
    id: 2,
    title: 'Kiếm Thần Ký',
    author: 'Thanh Phong',
    category: 'Kiếm hiệp',
    rating: 4.8,
    chapters: 500,
    views: '1.2M',
    status: 'Đang ra',
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1200&auto=format&fit=crop',
    description: 'Một kiếm khách trẻ tuổi bước vào con đường tu luyện, vượt qua thử thách để trở thành cường giả mạnh nhất.'
  },
  {
    id: 3,
    title: 'Thành Phố Neon',
    author: 'Trần Vũ',
    category: 'Đô thị',
    rating: 4.7,
    chapters: 45,
    views: '500K',
    status: 'Full',
    cover: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1200&auto=format&fit=crop',
    description: 'Một vụ án bí ẩn xảy ra tại trung tâm thành phố tương lai, nơi ranh giới giữa người và máy bị xóa nhòa.'
  },
  {
    id: 4,
    title: 'Mảnh Trăng Cuối',
    author: 'Diệp Lạc',
    category: 'Ngôn tình',
    rating: 4.6,
    chapters: 100,
    views: '2.4M',
    status: 'Full',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop',
    description: 'Một câu chuyện tình cảm nhẹ nhàng nhưng sâu sắc dưới ánh trăng cuối mùa.'
  }
];

export const chapters = [
  { id: 123, title: 'Khởi Đầu Của Sự Kết Thúc', state: 'Đang đọc', locked: false },
  { id: 124, title: 'Kế Hoạch Bí Mật', state: 'Chưa đọc', locked: false },
  { id: 125, title: 'Tàn Tích Cổ Đại', state: 'Mới', locked: false },
  { id: 126, title: 'Cánh Cổng Không Gian', state: 'Trả phí', locked: true },
  { id: 127, title: 'Lời Thề Giữa Các Vì Sao', state: 'Trả phí', locked: true }
];

export const coinPackages = [
  { id: 1, coin: 100, bonus: 0, price: '20.000đ' },
  { id: 2, coin: 500, bonus: 50, price: '100.000đ' },
  { id: 3, coin: 1000, bonus: 150, price: '200.000đ' }
];
