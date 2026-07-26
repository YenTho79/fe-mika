HƯỚNG DẪN CHẠY MIKA BOOKS MOBILE - EXPO

1) Cài Node.js nếu máy chưa có.
2) Mở VS Code -> Open Folder -> chọn thư mục Mika-Mobile-Expo.
3) Mở Terminal trong VS Code.
4) Chạy lệnh:

   npm install

5) Chạy app:

   npx expo start

6) Quét QR bằng Expo Go trên điện thoại.

Luồng test:
- Mở app -> login
- Nhập email + mật khẩu bất kỳ -> vào trang chủ
- Vào Khám phá -> tìm kiếm/lọc truyện
- Vào Chi tiết -> lưu truyện, xem chương, nạp xu
- Chọn gói nạp -> thanh toán -> thanh toán thành công
- Vào Tài khoản -> đăng xuất

Ghi chú:
- Đây là bản mobile demo chuyển từ giao diện HTML FE.
- Chưa nối backend/API thật.
- Dữ liệu truyện đang để trong data/books.js.
- Màu sắc giữ phong cách dark mode tím giống bản HTML.
