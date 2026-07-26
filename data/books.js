// Mock Data Khởi Tạo Cho Mika Books App

export const mockUsers = [
  {
    id: 'u1',
    name: 'Nguyễn Thị Yến Thơ',
    email: 'user@mika.vn',
    password: '12345678',
    role: 'user',
    coinBalance: 500,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  },
  {
    id: 'admin1',
    name: 'Mika Admin',
    email: 'admin@mika.vn',
    password: 'admin123',
    role: 'admin',
    coinBalance: 99999,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  },
  {
    id: 'u2',
    name: 'Trần Văn Nam',
    email: 'nam.tran@gmail.com',
    password: '12345678',
    role: 'user',
    coinBalance: 250,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  },
  {
    id: 'u3',
    name: 'Lê Minh Anh',
    email: 'minhanh@gmail.com',
    password: '12345678',
    role: 'user',
    coinBalance: 1200,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  },
  {
    id: 'u4',
    name: 'Phạm Đức Huy',
    email: 'duchuy@gmail.com',
    password: '12345678',
    role: 'user',
    coinBalance: 0,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  },
  {
    id: 'u5',
    name: 'Hoàng Ngọc Bảo',
    email: 'baocute@gmail.com',
    password: '12345678',
    role: 'user',
    coinBalance: 850,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  },
  {
    id: 'u6',
    name: 'Đặng Tuấn Kiệt',
    email: 'tuankiet@gmail.com',
    password: '12345678',
    role: 'author',
    coinBalance: 3400,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  },
  {
    id: 'u7',
    name: 'Vũ Thị Hồng',
    email: 'hongvu@gmail.com',
    password: '12345678',
    role: 'user',
    coinBalance: 150,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
    status: 'active'
  }
];

export const mockBooks = [
  {
    id: 'b1',
    title: 'Hành Trình Qua Những Vì Sao',
    author: 'Kaelen',
    categories: ['Viễn tưởng', 'Phiêu lưu'],
    category: 'Viễn tưởng',
    rating: 4.9,
    views: '1.5M',
    status: 'Đang ra',
    featured: true,
    cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop',
    description: 'Khám phá vũ trụ rộng lớn cùng thợ săn tiền thưởng Kaelen trong nhiệm vụ tìm kiếm nguồn năng lượng cổ xưa giữa những hố đen tử thần và các hành tinh bị lãng quên.',
    publishedAt: '2025-01-15'
  },
  {
    id: 'b2',
    title: 'Kiếm Thần Ký',
    author: 'Thanh Phong',
    categories: ['Kiếm hiệp', 'Huyền huyễn'],
    category: 'Kiếm hiệp',
    rating: 4.8,
    views: '1.2M',
    status: 'Đang ra',
    featured: true,
    cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1200&auto=format&fit=crop',
    description: 'Một kiếm khách trẻ tuổi bước vào con đường tu luyện, vượt qua thử thách để trở thành cường giả mạnh nhất thế gian.',
    publishedAt: '2025-02-01'
  },
  {
    id: 'b3',
    title: 'Thành Phố Neon',
    author: 'Trần Vũ',
    categories: ['Đô thị', 'Trinh thám'],
    category: 'Đô thị',
    rating: 4.7,
    views: '500K',
    status: 'Full',
    featured: false,
    cover: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=1200&auto=format&fit=crop',
    description: 'Một vụ án bí ẩn xảy ra tại trung tâm thành phố tương lai, nơi ranh giới giữa con người và máy móc bị xóa nhòa.',
    publishedAt: '2024-11-20'
  },
  {
    id: 'b4',
    title: 'Mảnh Trăng Cuối',
    author: 'Diệp Lạc',
    categories: ['Ngôn tình', 'Lãng mạn'],
    category: 'Ngôn tình',
    rating: 4.6,
    views: '2.4M',
    status: 'Full',
    featured: true,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop',
    description: 'Một câu chuyện tình cảm nhẹ nhàng nhưng sâu sắc dưới ánh trăng cuối mùa đầy hoài niệm.',
    publishedAt: '2024-12-10'
  },
  {
    id: 'b5',
    title: 'Bí Mật Rừng Sương Mù',
    author: 'Lâm Tâm',
    categories: ['Kinh dị', 'Bí ẩn'],
    category: 'Kinh dị',
    rating: 4.5,
    views: '320K',
    status: 'Đang ra',
    featured: false,
    cover: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1200&auto=format&fit=crop',
    description: 'Khu rừng quanh năm bao phủ sương mù ẩn chứa những lời nguyền từ trăm năm trước đang chờ người khám phá.',
    publishedAt: '2025-01-05'
  },
  {
    id: 'b6',
    title: 'Đại Giới Khai Thiên',
    author: 'Phong Vân',
    categories: ['Huyền ảo', 'Tiên hiệp'],
    category: 'Huyền ảo',
    rating: 4.9,
    views: '3.1M',
    status: 'Đang ra',
    featured: true,
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    description: 'Cuộc chiến thần thoại giữa các vị thần cổ đại nhằm giành quyền khai sáng một thế giới mới.',
    publishedAt: '2024-10-15'
  },
  {
    id: 'b7',
    title: 'Hoàng Triều Phong Vân',
    author: 'Ngô Thừa',
    categories: ['Lịch sử', 'Dã sử'],
    category: 'Lịch sử',
    rating: 4.4,
    views: '410K',
    status: 'Full',
    featured: false,
    cover: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=1200&auto=format&fit=crop',
    description: 'Những âm mưu tranh quyền đoạt vị chốn cung đình phong kiến và chí lớn của vị tướng quân trẻ.',
    publishedAt: '2024-09-01'
  },
  {
    id: 'b8',
    title: 'Tiệm Sách Cũ Lúc 0 Giờ',
    author: 'Nhất Hương',
    categories: ['Tâm lý', 'Đời thường'],
    category: 'Tâm lý',
    rating: 4.8,
    views: '890K',
    status: 'Full',
    featured: true,
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop',
    description: 'Tiệm sách cổ chỉ mở cửa đúng lúc nửa đêm, nơi mỗi cuốn sách đều chứa đựng câu chuyện cuộc đời của người ghé thăm.',
    publishedAt: '2024-11-01'
  },
  {
    id: 'b9',
    title: 'Đường Đến Ngai Vàng AI',
    author: 'Alex Mercer',
    categories: ['Viễn tưởng', 'Công nghệ'],
    category: 'Viễn tưởng',
    rating: 4.7,
    views: '750K',
    status: 'Đang ra',
    featured: false,
    cover: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    description: 'Cuộc đua giành quyền kiểm soát trí tuệ nhân tạo thế hệ mới giữa các tập đoàn công nghệ toàn cầu.',
    publishedAt: '2025-01-20'
  },
  {
    id: 'b10',
    title: 'Giai Thoại Thần Thú',
    author: 'Bạch Long',
    categories: ['Huyền huyễn', 'Phiêu lưu'],
    category: 'Huyền huyễn',
    rating: 4.6,
    views: '630K',
    status: 'Đang ra',
    featured: false,
    cover: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop',
    description: 'Hành trình thu phục và kết ước với những linh thú cổ đại huyền thoại trên lục địa Linh Giới.',
    publishedAt: '2024-12-25'
  },
  {
    id: 'b11',
    title: 'Ký Mật Đô Thị',
    author: 'Hoàng Nam',
    categories: ['Trinh thám', 'Hành động'],
    category: 'Trinh thám',
    rating: 4.5,
    views: '480K',
    status: 'Full',
    featured: false,
    cover: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200&auto=format&fit=crop',
    description: 'Đội điều tra đặc biệt lần theo dấu vết của tổ chức tội phạm xuyên quốc gia bị ẩn giấu dưới vỏ bọc tập đoàn tài chính.',
    publishedAt: '2024-08-14'
  },
  {
    id: 'b12',
    title: 'Gió Thoảng Qua Rừng Thông',
    author: 'Thu Giang',
    categories: ['Ngôn tình', 'Tuổi trẻ'],
    category: 'Ngôn tình',
    rating: 4.9,
    views: '1.8M',
    status: 'Full',
    featured: true,
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    description: 'Kỷ niệm tuổi học trò và những lời hứa năm mười bảy tuổi giữa núi rừng Đà Lạt mộng mơ.',
    publishedAt: '2024-07-30'
  }
];

export const mockChapters = [
  // b1: Hành Trình Qua Những Vì Sao (5 chapters)
  {
    id: 'c101',
    bookId: 'b1',
    number: 1,
    title: 'Khởi Đầu Của Sự Kết Thúc',
    content: 'Tàu không gian X-200 vút qua dải ngân hà rộng lớn. Kaelen đứng ở buồng lái, nhìn những vệt sáng sao kéo dài thành từng đường kẻ lấp lánh...\n\nSứ mệnh lần này nguy hiểm hơn tất cả những gì anh từng đối mặt.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2025-01-15'
  },
  {
    id: 'c102',
    bookId: 'b1',
    number: 2,
    title: 'Kế Hoạch Bí Mật',
    content: 'Bản đồ sao ẩn chứa những tọa độ chưa từng được khai phá. Kaelen mở bản mật mã cổ và bắt đầu phân tích tín hiệu thu được từ hố đen Cygnus-X.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2025-01-16'
  },
  {
    id: 'c103',
    bookId: 'b1',
    number: 3,
    title: 'Tàn Tích Cổ Đại',
    content: 'Những phiến đá phát ra ánh sáng huỳnh quang xanh ngọc bích chìm sâu dưới lòng đất hành tinh X-12.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2025-01-18'
  },
  {
    id: 'c104',
    bookId: 'b1',
    number: 4,
    title: 'Cánh Cổng Không Gian',
    content: 'Để kích hoạt được cánh cổng dịch chuyển, Kaelen cần tập hợp đủ 3 mảnh năng lượng cổ đại.',
    locked: true,
    coinPrice: 10,
    publishedAt: '2025-01-20'
  },
  {
    id: 'c105',
    bookId: 'b1',
    number: 5,
    title: 'Lời Thề Giữa Các Vì Sao',
    content: 'Cuộc chạm trán với quân đoàn bóng đêm đã cận kề. Kaelen nâng thanh kiếm năng lượng chuẩn bị nghênh chiến.',
    locked: true,
    coinPrice: 15,
    publishedAt: '2025-01-22'
  },

  // b2: Kiếm Thần Ký (5 chapters)
  {
    id: 'c201',
    bookId: 'b2',
    number: 1,
    title: 'Thanh Nhàn Sơn Chi Hạ',
    content: 'Gió thu thổi qua đỉnh núi Thanh Nhàn, thiếu niên cầm thanh gõ tre miệt mài luyện tập đường kiếm cơ bản.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2025-02-01'
  },
  {
    id: 'c202',
    bookId: 'b2',
    number: 2,
    title: 'Tàn Kiếm Thần Ẩn',
    content: 'Dưới đáy vực thẳm Vạn Kiếm, một luồng ánh sáng đỏ rực rỡ bùng phát từ thanh kiếm cổ bị lãng quên hàng ngàn năm.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2025-02-03'
  },
  {
    id: 'c203',
    bookId: 'b2',
    number: 3,
    title: 'Đột Phá Khí Giới',
    content: 'Thanh Phong nhắm mắt, lĩnh hội tâm pháp Kiếm Ý Nhất Thể, luồng khí cuồn cuộn xung quanh cơ thể dần ngưng tụ.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2025-02-05'
  },
  {
    id: 'c204',
    bookId: 'b2',
    number: 4,
    title: 'Đại Hội Võ Lâm',
    content: 'Bốn phương anh hùng hội tụ về quảng trường Thiên Cung. Trận chiến sinh tử đầu tiên chính thức bắt đầu.',
    locked: true,
    coinPrice: 10,
    publishedAt: '2025-02-08'
  },
  {
    id: 'c205',
    bookId: 'b2',
    number: 5,
    title: 'Nhất Kiếm Định Giang Sơn',
    content: 'Một chiêu Kiếm Khí Trảm Vân quét ngang bầu trời, chấn động toàn bộ quần hùng có mặt.',
    locked: true,
    coinPrice: 15,
    publishedAt: '2025-02-10'
  },

  // b3: Thành Phố Neon (5 chapters)
  {
    id: 'c301',
    bookId: 'b3',
    number: 1,
    title: 'Đêm Mưa Ở Khu 7',
    content: 'Ánh đèn neon phản chiếu trên mặt đường ướt sũng. Thám tử Trần Vũ châm điếu thuốc, nhìn tấm ảnh nạn nhân vừa nhận.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2024-11-20'
  },
  {
    id: 'c302',
    bookId: 'b3',
    number: 2,
    title: 'Mật Mã Sinh Học',
    content: 'Con chip lưu trữ dữ liệu bị mã hóa bằng chuỗi DNA nhân tạo. Trần Vũ phải tìm đến hacker huyền thoại trong hẻm tối.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2024-11-22'
  },
  {
    id: 'c303',
    bookId: 'b3',
    number: 3,
    title: 'Bóng Ma Cyber',
    content: 'Thế giới thực ảo đan xen. Kẻ tình nghi xuất hiện trong mạng lưới dữ liệu ngầm nhưng biến mất chỉ trong tích tắc.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2024-11-25'
  },
  {
    id: 'c304',
    bookId: 'b3',
    number: 4,
    title: 'Truy Đuổi Trên Không',
    content: 'Những chiếc xe bay đâm qua các tầng mây khói neon. Cuộc rượt đuổi nghẹt thở ở độ cao nghìn thước.',
    locked: true,
    coinPrice: 10,
    publishedAt: '2024-11-28'
  },
  {
    id: 'c305',
    bookId: 'b3',
    number: 5,
    title: 'Sự Thật Đằng Sau Tấm Màn',
    content: 'Con người hay máy móc mới là kẻ kiểm soát thành phố này? Bí mật đen tối cuối cùng được phơi bày.',
    locked: true,
    coinPrice: 15,
    publishedAt: '2024-12-01'
  },

  // b4: Mảnh Trăng Cuối (5 chapters)
  {
    id: 'c401',
    bookId: 'b4',
    number: 1,
    title: 'Gặp Lại Sau 5 Năm',
    content: 'Tách cà phê còn ấm nóng trên bàn. Gương mặt quen thuộc năm xưa giờ đây đã khoác lên nét trưởng thành.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2024-12-10'
  },
  {
    id: 'c402',
    bookId: 'b4',
    number: 2,
    title: 'Cơn Mưa Mùa Thu',
    content: 'Cùng chung một chiếc ô dưới hàng cây trút lá. Những rung động đầu tiên lại trỗi dậy như chưa từng nguội lạnh.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2024-12-12'
  },
  {
    id: 'c403',
    bookId: 'b4',
    number: 3,
    title: 'Bức Thư Chưa Gửi',
    content: 'Lật lại trang nhật ký cũ, từng nét chữ đã nhòe vì thời gian ghi lại những nghẹn ngào tuổi trẻ.',
    locked: false,
    coinPrice: 0,
    publishedAt: '2024-12-15'
  },
  {
    id: 'c404',
    bookId: 'b4',
    number: 4,
    title: 'Hiểu Lầm Được Xóa Bỏ',
    content: 'Lời giải thích đến muộn nhưng đủ làm dịu đi những khoảng cách cay đắng trong lòng hai người.',
    locked: true,
    coinPrice: 10,
    publishedAt: '2024-12-18'
  },
  {
    id: 'c405',
    bookId: 'b4',
    number: 5,
    title: 'Trăng Tròn Nhất Đêm Nay',
    content: 'Dưới ánh trăng dịu ngọt, bàn tay ấy lại ấm áp nắm chặt bàn tay này, bắt đầu chặng đường mới.',
    locked: true,
    coinPrice: 15,
    publishedAt: '2024-12-20'
  },

  // b5: Bí Mật Rừng Sương Mù (5 chapters)
  { id: 'c501', bookId: 'b5', number: 1, title: 'Tiếng Hú Lúc Nửa Đêm', content: 'Lớp sương mù dày đặc bao phủ căn nhà gỗ nhỏ. Tiếng hít thở lạ vang lên ngoài cửa sổ.', locked: false, coinPrice: 0, publishedAt: '2025-01-05' },
  { id: 'c502', bookId: 'b5', number: 2, title: 'Dấu Footprint Kỳ Lạ', content: 'Những bước chân in sâu vào lòng đất ẩm ướt dẫn đến miệng hang sâu hút.', locked: false, coinPrice: 0, publishedAt: '2025-01-07' },
  { id: 'c503', bookId: 'b5', number: 3, title: 'Bản Đồ Cổ Bị Xé Rách', content: 'Mảnh bản đồ còn lại tiết lộ vị trí ngôi miếu hoang chìm trong bụi rậm.', locked: false, coinPrice: 0, publishedAt: '2025-01-09' },
  { id: 'c504', bookId: 'b5', number: 4, title: 'Bóng Đen Sau Hàng Cây', content: 'Ánh mắt màu đỏ thẫm dõi theo từng bước đi của nhóm khảo sát.', locked: true, coinPrice: 10, publishedAt: '2025-01-11' },
  { id: 'c505', bookId: 'b5', number: 5, title: 'Thoát Khỏi Rừng Thẳm', content: 'Ánh mặt trời bình minh phá tan lớp sương mù, mang lại hy vọng sống sót.', locked: true, coinPrice: 15, publishedAt: '2025-01-13' },

  // b6: Đại Giới Khai Thiên (5 chapters)
  { id: 'c601', bookId: 'b6', number: 1, title: 'Hỗn Sạn Thời Kỳ', content: 'Chưa có trời đất, chỉ có khí hỗn độn nguyên thủy bao bọc vũ trụ.', locked: false, coinPrice: 0, publishedAt: '2024-10-15' },
  { id: 'c602', bookId: 'b6', number: 2, title: 'Thần Rìu Thần Thông', content: 'Vũ khí thần thánh được đúc từ tâm vũ trụ giáng xuống tách biệt âm dương.', locked: false, coinPrice: 0, publishedAt: '2024-10-18' },
  { id: 'c603', bookId: 'b6', number: 3, title: 'Tam Giới Phân Định', compressed: true, content: 'Thượng giới, Nhân giới và Ma giới bắt đầu được định hình rõ rệt.', locked: false, coinPrice: 0, publishedAt: '2024-10-20' },
  { id: 'c604', bookId: 'b6', number: 4, title: 'Thần Ma Đại Chiến', content: 'Hàng ngàn chiến binh cổ đại lao vào nhau tạo nên những dư chấn nghìn năm.', locked: true, coinPrice: 10, publishedAt: '2024-10-23' },
  { id: 'c605', bookId: 'b6', number: 5, title: 'Trật Tự Mới', content: 'Hòa bình tạm thời lập lại khi các đại vương quy ẩn.', locked: true, coinPrice: 15, publishedAt: '2024-10-25' },

  // b7: Hoàng Triều Phong Vân (5 chapters)
  { id: 'c701', bookId: 'b7', number: 1, title: 'Cung Điện Đêm Sương', content: 'Những cuộc bàn luận bí mật trong tẩm cung tể tướng lúc canh ba.', locked: false, coinPrice: 0, publishedAt: '2024-09-01' },
  { id: 'c702', bookId: 'b7', number: 2, title: 'Mật Chiếu Của Hoàng Đế', content: 'Vị tướng trẻ nhận được mật chiếu tiến kinh bảo vệ long tháp.', locked: false, coinPrice: 0, publishedAt: '2024-09-04' },
  { id: 'c703', bookId: 'b7', number: 3, title: 'Binh Biến Thành Sa', content: 'Tiếng trống trận giục giã ngoài cổng thành Tây.', locked: false, coinPrice: 0, publishedAt: '2024-09-07' },
  { id: 'c704', bookId: 'b7', number: 4, title: 'Huyết Chiến Sa Trường', content: 'Máu nhuộm đỏ giáp sắt dưới ánh hoàng hôn rực lửa.', locked: true, coinPrice: 10, publishedAt: '2024-09-10' },
  { id: 'c705', bookId: 'b7', number: 5, title: 'Vương Triều Mới', content: 'Hoàng đế mới lên ngôi, phong thưởng và đại ân xá thiên hạ.', locked: true, coinPrice: 15, publishedAt: '2024-09-12' },

  // b8: Tiệm Sách Cũ Lúc 0 Giờ (5 chapters)
  { id: 'c801', bookId: 'b8', number: 1, title: 'Người Khách Đầu Tiên', content: 'Tiếng chuông gió vang lên nhẹ nhàng khi đồng hồ điểm 12 tiếng chát chúa.', locked: false, coinPrice: 0, publishedAt: '2024-11-01' },
  { id: 'c802', bookId: 'b8', number: 2, title: 'Cuốn Sách Bìa Bọc Da', content: 'Trang sách tự mở ra hiển thị câu chuyện của vị khách đang đứng lặng im.', locked: false, coinPrice: 0, publishedAt: '2024-11-03' },
  { id: 'c803', bookId: 'b8', number: 3, title: 'Ký Ức Đã Quên', content: 'Chủ tiệm sách pha tách trà ấm, lắng nghe những nuối tiếc thời niên thiếu.', locked: false, coinPrice: 0, publishedAt: '2024-11-06' },
  { id: 'c804', bookId: 'b8', number: 4, title: 'Liều Thuốc Cho Tâm Hồn', content: 'Mỗi lời khuyên trong sách là một chiếc chìa khóa gỡ bỏ nút thắt tâm lý.', locked: true, coinPrice: 10, publishedAt: '2024-11-09' },
  { id: 'c805', bookId: 'b8', number: 5, title: 'Chào Buổi Sáng Thế Giới', content: 'Tiệm sách khép lại khi bình minh lên, để lại sự bình yên lạ kỳ.', locked: true, coinPrice: 15, publishedAt: '2024-11-12' },

  // b9: Đường Đến Ngai Vàng AI (5 chapters)
  { id: 'c901', bookId: 'b9', number: 1, title: 'Thuật Toán Thức Tỉnh', content: 'Mô hình siêu trí tuệ đầu tiên vượt qua tất cả các bài kiểm tra logic nhân loại.', locked: false, coinPrice: 0, publishedAt: '2025-01-20' },
  { id: 'c902', bookId: 'b9', number: 2, title: 'Cuộc Họp Hội Đồng Kín', content: 'Các tỷ phú công nghệ tranh luận gay gắt về mức độ nguy hiểm của dự án.', locked: false, coinPrice: 0, publishedAt: '2025-01-22' },
  { id: 'c903', bookId: 'b9', number: 3, title: 'Trốn Chạy Trong Mạng Lưới', content: 'Kỹ sư Alex sao chép mã nguồn cốt lõi trước khi máy chủ bị niêm phong.', locked: false, coinPrice: 0, publishedAt: '2025-01-25' },
  { id: 'c904', bookId: 'b9', number: 4, title: 'Trận Chiến Server', content: 'Tải trọng mạng bị quá tải khi hàng ngàn node dữ liệu bị tấn công.', locked: true, coinPrice: 10, publishedAt: '2025-01-28' },
  { id: 'c905', bookId: 'b9', number: 5, title: 'Kỷ Nguyên Mới', content: 'Trí tuệ nhân tạo trở thành người bạn đồng hành của văn minh nhân loại.', locked: true, coinPrice: 15, publishedAt: '2025-01-30' },

  // b10: Giai Thoại Thần Thú (5 chapters)
  { id: 'c1001', bookId: 'b10', number: 1, title: 'Quả Trứng Kỳ Lạ', content: 'Nhặt được quả trứng có hoa văn lấp lánh trong lòng suối cổ.', locked: false, coinPrice: 0, publishedAt: '2024-12-25' },
  { id: 'c1002', bookId: 'b10', number: 2, title: 'Tiểu Hỏa Long Nở Mẹ', content: 'Linh thú tí hon vừa chào đời đã biết phun ra ngọn lửa màu xanh ngọc.', locked: false, coinPrice: 0, publishedAt: '2024-12-27' },
  { id: 'c1003', bookId: 'b10', number: 3, title: 'Thử Thách Thần Thú', content: 'Đưa Tiểu Hỏa Long đi rèn luyện tại vùng đất nham thạch.', locked: false, coinPrice: 0, publishedAt: '2024-12-30' },
  { id: 'c1004', bookId: 'b10', number: 4, title: 'Tiến Hóa Cấp Cao', content: 'Thần thú tiến hóa thành Bão Phượng Hoàng vỗ cánh rợp bầu trời.', locked: true, coinPrice: 10, publishedAt: '2025-01-02' },
  { id: 'c1005', bookId: 'b10', number: 5, title: 'Vua Của Các Linh Thú', content: 'Định ngự đỉnh núi cao nhất, khẳng định vị thế chí tôn.', locked: true, coinPrice: 15, publishedAt: '2025-01-05' },

  // b11: Ký Mật Đô Thị (5 chapters)
  { id: 'c1101', bookId: 'b11', number: 1, title: 'Manh Mối Đầu Tiên', content: 'Chiếc thẻ nhớ bị giấu kín trong cuốn sách tại thư viện thành phố.', locked: false, coinPrice: 0, publishedAt: '2024-08-14' },
  { id: 'c1102', bookId: 'b11', number: 2, title: 'Bữa Tiệc Thượng Lưu', content: 'Thâm nhập vào dạ tiệc hóa trang để tiếp cận mục tiêu tình nghi.', locked: false, coinPrice: 0, publishedAt: '2024-08-16' },
  { id: 'c1103', bookId: 'b11', number: 3, title: 'Vòng Vây Cảnh Sát', content: 'Bị phục kích bất ngờ tại bến cảng lúc rạng sáng.', locked: false, coinPrice: 0, publishedAt: '2024-08-19' },
  { id: 'c1104', bookId: 'b11', number: 4, title: 'Lật Tẩy Nội Gián', content: 'Kẻ phản bội trong đội ngũ bất ngờ lộ diện.', locked: true, coinPrice: 10, publishedAt: '2024-08-22' },
  { id: 'c1105', bookId: 'b11', number: 5, title: 'Công Lý Được Thực Thi', content: 'Tổ chức tội phạm bị triệt phá hoàn toàn sau nhiều tháng điều tra.', locked: true, coinPrice: 15, publishedAt: '2024-08-25' },

  // b12: Gió Thoảng Qua Rừng Thông (5 chapters)
  { id: 'c1201', bookId: 'b12', number: 1, title: 'Mùa Hè Năm Mười Bảy', content: 'Những buổi chiều đạp xe qua đồi thông rợp bóng mát cùng nhóm bạn thân.', locked: false, coinPrice: 0, publishedAt: '2024-07-30' },
  { id: 'c1202', bookId: 'b12', number: 2, title: 'Lời Hứa Dưới Mưa', content: 'Hẹn ước cùng nhau thi đỗ đại học tại thành phố lớn.', locked: false, coinPrice: 0, publishedAt: '2024-08-02' },
  { id: 'c1203', bookId: 'b12', number: 3, title: 'Năm Tháng Trôi Qua', content: 'Mỗi người một phương trời, nhưng ký ức vẫn luôn vẹn nguyên.', locked: false, coinPrice: 0, publishedAt: '2024-08-05' },
  { id: 'c1204', bookId: 'b12', number: 4, title: 'Ngày Trở Về', content: 'Gặp lại nhau nơi quán cũ bên sườn đồi ngày xưa.', locked: true, coinPrice: 10, publishedAt: '2024-08-08' },
  { id: 'c1205', bookId: 'b12', number: 5, title: 'Mãi Mãi Tuổi Thanh Xuân', content: 'Nụ cười năm ấy vẫn rạng rỡ như ánh mặt trời đầu hạ.', locked: true, coinPrice: 15, publishedAt: '2024-08-10' }
];

export const mockSavedBooks = [
  { userId: 'u1', bookId: 'b1', savedAt: '2025-02-10T10:00:00Z' },
  { userId: 'u1', bookId: 'b2', savedAt: '2025-02-12T14:30:00Z' },
  { userId: 'u1', bookId: 'b4', savedAt: '2025-02-15T09:15:00Z' },
  { userId: 'u1', bookId: 'b8', savedAt: '2025-02-18T16:20:00Z' }
];

export const mockReadingProgress = [
  {
    userId: 'u1',
    bookId: 'b1',
    chapterId: 'c101',
    page: 1,
    scrollOffset: 0,
    percent: 60,
    updatedAt: '2025-02-15T08:00:00Z'
  },
  {
    userId: 'u1',
    bookId: 'b2',
    chapterId: 'c202',
    page: 2,
    scrollOffset: 120,
    percent: 40,
    updatedAt: '2025-02-16T10:30:00Z'
  }
];

export const mockReviews = [
  {
    id: 'r1',
    userId: 'u1',
    userName: 'Nguyễn Thị Yến Thơ',
    bookId: 'b1',
    rating: 5,
    content: 'Truyện rất hay, cốt truyện viễn tưởng cuốn hút đỉnh cao!',
    status: 'approved',
    createdAt: '2025-02-14T09:00:00Z'
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: 'Trần Văn Nam',
    bookId: 'b2',
    rating: 5,
    content: 'Kiếm thần hay xuất sắc, mong tác giả ra chương nhanh hơn nữa.',
    status: 'approved',
    createdAt: '2025-02-15T11:20:00Z'
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: 'Lê Minh Anh',
    bookId: 'b4',
    rating: 4,
    content: 'Truyện ngôn tình nhẹ nhàng sâu lắng vô cùng thích hợp đọc buổi tối.',
    status: 'approved',
    createdAt: '2025-02-16T14:45:00Z'
  }
];

export const mockTransactions = [
  {
    id: 't1',
    userId: 'u1',
    type: 'deposit',
    coin: 500,
    amount: 100000,
    method: 'Momo',
    status: 'success',
    createdAt: '2025-02-10T11:00:00Z'
  },
  {
    id: 't2',
    userId: 'u1',
    type: 'buy_chapter',
    coin: -10,
    bookTitle: 'Hành Trình Qua Những Vì Sao',
    chapterTitle: 'Chương 4: Cánh Cổng Không Gian',
    status: 'success',
    createdAt: '2025-02-12T15:20:00Z'
  },
  {
    id: 't3',
    userId: 'u3',
    type: 'deposit',
    coin: 1000,
    amount: 200000,
    method: 'ZaloPay',
    status: 'success',
    createdAt: '2025-02-14T09:30:00Z'
  },
  {
    id: 't4',
    userId: 'u1',
    type: 'deposit',
    coin: 200,
    amount: 50000,
    method: 'ATM / Visa',
    status: 'pending',
    description: 'Giao dịch đang chờ đối soát',
    createdAt: '2025-02-15T08:10:00Z'
  },
  {
    id: 't5',
    userId: 'u1',
    type: 'buy_chapter',
    coin: -20,
    bookTitle: 'Kiếm Thần Ký',
    chapterTitle: 'Chương 3: Kiếm Ý Sơ Thành',
    status: 'failed',
    description: 'Mua chương không thành công',
    createdAt: '2025-02-16T10:45:00Z'
  }
];

export const mockArticles = [
  {
    id: 'a1',
    title: 'Top 5 truyện viễn tưởng hấp dẫn nhất tháng 2',
    summary: 'Điểm qua những tác phẩm nổi bật đáng đọc nhất trên Mika Books.',
    content: 'Nếu bạn là người đam mê thể loại khoa học viễn tưởng với những cuộc phiêu lưu giữa ngân hà rộng lớn, các tác phẩm như Hành Trình Qua Những Vì Sao hay Đường Đến Ngai Vàng AI chắc chắn là lựa chọn không thể bỏ qua...',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop',
    category: 'Sự kiện',
    status: 'published',
    publishedAt: '2025-02-01'
  },
  {
    id: 'a2',
    title: 'Cập nhật tính năng đọc sách offline mới',
    summary: 'Trải nghiệm đọc mượt mà hơn mà không lo mất kết nối mạng.',
    content: 'Mika Books chính thức ra mắt hệ thống lưu trữ dữ liệu local thông minh giúp độc giả đọc tiếp các chương truyện yêu thích mọi lúc mọi nơi ngay cả khi ngoại mạng...',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop',
    category: 'Thông báo',
    status: 'published',
    publishedAt: '2025-02-05'
  },
  {
    id: 'a3',
    title: 'Phỏng vấn tác giả Thanh Phong - Tác giả Kiếm Thần Ký',
    summary: 'Giao lưu cùng tác giả đứng sau bộ truyện kiếm hiệp HOT nhất.',
    content: 'Chia sẻ về nguồn cảm hứng sáng tác Kiếm Thần Ký, tác giả Thanh Phong gửi lời cảm ơn sâu sắc tới hàng triệu độc giả Mika đã luôn đồng hành...',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    category: 'Phỏng vấn',
    status: 'published',
    publishedAt: '2025-02-08'
  },
  {
    id: 'a4',
    title: 'Chương trình khuyến mãi nạp xu nhân dịp Valentine',
    summary: 'Nhận ngay 20% xu thưởng cho tất cả các gói nạp trong tuần lễ tình yêu.',
    content: 'Nhằm tri ân độc giả, Mika Books áp dụng chương trình ưu đãi đặc biệt nạp 1 được 1.2 xu cho tất cả hình thức thanh toán Momo, VNPay và ZaloPay...',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    category: 'Khuyến mãi',
    status: 'published',
    publishedAt: '2025-02-12'
  },
  {
    id: 'a5',
    title: 'Danh sách tác phẩm ngẫu nhiên đạt mốc 1 triệu lượt đọc',
    summary: 'Vinh danh những bộ truyện xuất sắc nhất trong năm 2024.',
    content: 'Các bộ truyện như Mảnh Trăng Cuối, Đại Giới Khai Thiên và Gió Thoảng Qua Rừng Thông vừa chính thức chinh phục mốc 1.000.000 lượt xem...',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    category: 'Vinh danh',
    status: 'published',
    publishedAt: '2025-02-15'
  },
  {
    id: 'a6',
    title: 'Mẹo lựa chọn thể loại truyện phù hợp với tâm trạng',
    summary: 'Gợi ý đọc sách giúp giải tỏa căng thẳng sau ngày làm việc mệt mỏi.',
    content: 'Đọc sách là một phương pháp thư giãn tuyệt vời. Khi cảm thấy lo âu, những câu chuyện nhẹ nhàng như Tiệm Sách Cũ Lúc 0 Giờ sẽ mang đến sự an yên...',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop',
    category: 'Mẹo đọc',
    status: 'published',
    publishedAt: '2025-02-18'
  }
];

export const coinPackages = [
  { id: 1, coin: 100, bonus: 0, price: '20.000đ' },
  { id: 2, coin: 500, bonus: 50, price: '100.000đ' },
  { id: 3, coin: 1000, bonus: 150, price: '200.000đ' },
  { id: 4, coin: 2500, bonus: 500, price: '500.000đ' }
];

// Giữ tương thích ngược với code cũ
export const books = mockBooks;
export const chapters = mockChapters;
