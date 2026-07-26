# Kế hoạch hoàn thiện giao diện Mika Books

## Mục tiêu

Hoàn thiện giao diện và toàn bộ luồng thao tác của ứng dụng Mika Books bằng dữ liệu local. Giai đoạn này không kết nối API, không xử lý thanh toán thật và không yêu cầu backend Django.

Ứng dụng gồm hai khu vực:

- Người dùng: khám phá, đọc, lưu và tương tác với truyện.
- Quản trị viên: quản lý dữ liệu demo của truyện, chương, người dùng, giao dịch, đánh giá và tin tức.

## Nguyên tắc triển khai

- Dữ liệu danh mục ban đầu đặt trong `data/`.
- Dữ liệu phát sinh và chỉnh sửa lưu bằng AsyncStorage.
- Mỗi màn hình phải có đủ trạng thái: có dữ liệu, rỗng, đang tải giả lập và lỗi giả lập nếu phù hợp.
- Các màn hình dùng chung component, màu sắc và khoảng cách từ design system.
- Luồng điều hướng phải hoạt động hoàn chỉnh, không có nút bấm chỉ để trang trí.
- Admin chỉ là giao diện mô phỏng local; không được coi là cơ chế bảo mật thật.

## Danh sách tài liệu

1. [Tổng quan kiến trúc và dữ liệu](./00-tong-quan-kien-truc.md)
2. [Xác thực, trang chủ và khám phá](./02-xac-thuc-trang-chu-kham-pha.md)
3. [Chi tiết, đọc truyện và tủ sách](./03-doc-truyen-va-tu-sach.md)
5. [Tài khoản, lịch sử và cài đặt](./05-tai-khoan-lich-su-cai-dat.md)
7. [Kiểm thử và lộ trình thực hiện](./07-kiem-thu-va-lo-trinh.md)

## Thứ tự ưu tiên

| Giai đoạn | Nội dung | Kết quả |
|---|---|---|
| 1 | Chuẩn hóa dữ liệu local, route và component dùng chung | Nền tảng ổn định |
| 2 | Hoàn thiện luồng người dùng cốt lõi | Có thể demo từ đăng nhập đến đọc truyện |
| 3 | Lịch sử đọc, tìm kiếm, cài đặt trình đọc | Trải nghiệm đọc đầy đủ |
| 4 | Tin tức, đánh giá, chia sẻ và thanh toán mô phỏng | Hoàn thiện các chức năng phụ |
| 5 | Xây dựng toàn bộ khu vực Admin | Có thể quản lý dữ liệu ngay trong app |
| 6 | Kiểm thử đa thiết bị và xử lý trạng thái biên | Sẵn sàng trình bày đồ án |

## Tiêu chí hoàn thành chung

- Chạy được bằng `npm start` mà không cần backend.
- Build Expo Web thành công.
- Không còn route sai hoặc màn hình trùng lặp.
- Không còn nút chính không có hành động.
- Dữ liệu thay đổi trong phiên demo được lưu sau khi đóng và mở lại app.
- Người dùng và Admin có luồng điều hướng riêng, rõ ràng.
- Giao diện hiển thị tốt trên màn hình điện thoại nhỏ và lớn.
