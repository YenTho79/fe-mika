# 07. Kiểm thử và lộ trình thực hiện

## Lộ trình đề xuất

### Sprint 1 — Nền tảng local

- Chuẩn hóa mock data.
- Tạo local storage service và seed data.
- Gộp màn đăng nhập, sửa route.
- Tạo component trạng thái dùng chung.
- Hoàn thiện điều hướng User/Admin.

Kết quả: ứng dụng chạy hoàn toàn local với một nguồn dữ liệu thống nhất.

### Sprint 2 — Luồng đọc chính

- Trang chủ lấy dữ liệu local.
- Tìm kiếm và lọc thể loại.
- Chi tiết truyện và danh sách chương.
- Trình đọc dùng đúng nội dung chương.
- Lưu tiến độ, tủ sách và lịch sử đọc.

Kết quả: demo được luồng đăng nhập → tìm truyện → đọc → đóng app → đọc tiếp.

### Sprint 3 — Tài khoản và tương tác

- Hồ sơ cá nhân.
- Đánh giá.
- Thông báo local.
- Tin tức và chi tiết bài viết.
- Chia sẻ.
- Cài đặt trình đọc.

Kết quả: khu vực User hoàn chỉnh.

### Sprint 4 — Xu và giao dịch demo

- Nạp xu mô phỏng.
- Giao dịch và số dư local.
- Mua/mở khóa chương.
- Lịch sử giao dịch.

Kết quả: luồng xu nhất quán và không còn số liệu hard-code trên UI.

### Sprint 5 — Admin

- Dashboard.
- CRUD truyện và chương.
- Quản lý người dùng.
- Giao dịch, đánh giá và tin tức.
- Đồng bộ thay đổi sang giao diện User.

Kết quả: Admin quản lý được toàn bộ dữ liệu demo.

### Sprint 6 — Hoàn thiện và trình bày

- Responsive trên nhiều kích thước màn hình.
- Accessibility cơ bản.
- Skeleton, empty, error và confirm state.
- Kiểm thử toàn bộ luồng.
- Sửa tài liệu hướng dẫn chạy.
- Chuẩn bị tài khoản và kịch bản demo.

## Checklist kiểm thử chức năng

### Xác thực

- Đăng nhập User đúng/sai.
- Đăng nhập Admin đúng/sai.
- Đăng ký email mới/trùng.
- Đăng xuất và mở lại app.
- User thường không truy cập Admin.

### Truyện

- Tìm kiếm theo tên, tác giả, thể loại.
- Mỗi card mở đúng ID.
- Lưu và bỏ lưu không tạo bản ghi trùng.
- Xem chương miễn phí.
- Mở chương khóa khi đủ/thiếu xu.
- Lưu và khôi phục tiến độ đọc.

### Giao dịch

- Chọn từng gói và phương thức.
- Màn xác nhận hiển thị đúng dữ liệu.
- Thanh toán demo chỉ cộng xu một lần.
- Giao dịch xuất hiện trong tài khoản và Admin.

### Admin

- Thêm/sửa/xóa truyện.
- Thêm/sửa/xóa chương.
- Kiểm tra thay đổi bên giao diện User.
- Khóa/mở người dùng.
- Ẩn/khôi phục đánh giá.
- Thêm/sửa/xóa bài viết.
- Khôi phục seed data.

## Checklist giao diện

- Không bị che bởi tai thỏ hoặc thanh điều hướng hệ thống.
- Bàn phím không che input và nút lưu.
- Text dài không phá vỡ bố cục.
- Nút bấm có vùng chạm đủ lớn.
- Có phản hồi khi nhấn nút.
- Màu chữ đủ tương phản.
- Danh sách dài cuộn mượt.
- Modal đóng được bằng nút và thao tác Back trên Android.
- Màn hình rỗng có hướng dẫn hành động tiếp theo.

## Thiết bị/kích thước cần kiểm tra

- Android màn nhỏ khoảng 360 × 640.
- Android phổ biến khoảng 412 × 915.
- iPhone màn tai thỏ.
- Expo Web ở chiều rộng mobile.
- Chế độ chữ lớn nếu có thời gian.

## Kịch bản demo đồ án

1. Đăng nhập User.
2. Tìm một truyện và lọc theo thể loại.
3. Mở chi tiết, lưu truyện và viết đánh giá.
4. Đọc một chương, thay đổi theme và thoát.
5. Quay lại Trang chủ để chứng minh tiến độ đã lưu.
6. Mở chương khóa, nạp xu mô phỏng và mở khóa.
7. Đăng xuất, đăng nhập Admin.
8. Thêm một truyện và một chương mới.
9. Chuyển sang giao diện User để thấy dữ liệu vừa thêm.
10. Mở Dashboard và lịch sử giao dịch để kết thúc demo.

## Điều kiện bàn giao

- Không cần backend khi chạy demo.
- Có tài khoản User và Admin mẫu trong tài liệu.
- Không có lỗi đỏ trong console khi chạy luồng chính.
- Expo Web export thành công.
- README phản ánh đúng trạng thái local của dự án.
- Có video hoặc ảnh chụp luồng demo nếu giảng viên yêu cầu.
