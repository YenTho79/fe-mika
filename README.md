# 📚 MIKA BOOKS - ỨNG DỤNG ĐỌC SÁCH & TRUYỆN ONLINE TRÊN DI ĐỘNG

> **Dự án:** Ứng dụng đọc sách và truyện trực tuyến    
> **Nền tảng:** Mobile App (iOS / Android / Web)

---

## 1. GIỚI THIỆU DỰ ÁN

**Mika Books** là ứng dụng di động đọc sách và truyện điện tử hiện đại, tập trung tối ưu hóa trải nghiệm đọc của người dùng với giao diện Dark Mode cao cấp, tích hợp hệ thống kinh tế số (nạp xu và mở khóa chương VIP), cùng trung tâm quản trị di động (Admin Portal) toàn diện.

### ✨ Các tính năng nổi bật (Trọng tâm trải nghiệm Frontend Mobile):
- **Đọc sách thông minh & công thái học:** Tùy chỉnh kích thước phông chữ, chế độ đọc ban đêm, lưu tiến độ đọc tự động, chuyển chương mượt mà.
- **Bảo mật sinh trắc học:** Đăng nhập an toàn và nhanh chóng bằng **Vân tay / FaceID** (Biometric Authentication).
- **Hệ sinh thái Xu & Thanh toán đa kênh:** Mở khóa chương VIP, hỗ trợ các cổng thanh toán MoMo, VNPay và quét mã VietQR.
- **Tủ sách cá nhân (Offline-First):** Lưu truyện yêu thích, xem lịch sử đọc ngay cả khi không có kết nối Internet nhờ bộ lưu trữ `AsyncStorage`.
- **Chia sẻ câu trích dẫn (Quote Cards):** Tự động tạo thẻ trích dẫn sách đẹp mắt chuẩn tỷ lệ Story để chia sẻ lên mạng xã hội (Facebook, Instagram, TikTok).
- **Tìm kiếm & Phân loại linh hoạt:** Tìm kiếm thời gian thực (Live Search), lọc sách theo thể loại, sách mới xuất bản, tác phẩm nổi bật.
- **Trang quản trị tích hợp (Admin Portal):** Quản lý đầu sách, biên tập chương, theo dõi người dùng và kiểm duyệt tin tức trực tiếp trên di động.

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN (MONOREPO)

Dự án được phân chia rõ ràng thành 3 phần độc lập, thuận tiện cho việc phát triển và triển khai:

```text
mika_book/
├── 📁 fe-mika/              # [CHỦ ĐẠO] Mã nguồn ứng dụng di động (React Native - Expo)
│   ├── app/                # Cấu trúc điều hướng các màn hình (Expo Router)
│   │   ├── admin/          # Phân hệ quản trị di động (Admin Portal)
│   │   ├── chi-tiet.jsx    # Chi tiết sách & danh sách chương
│   │   ├── doc-sach.jsx    # Trình đọc sách tùy chỉnh font
│   │   ├── nap-xu.jsx      # Cửa hàng nạp xu
│   │   ├── thanh-toan.jsx  # Cổng thanh toán MoMo, VNPay, QR
│   │   └── ...             # 15+ màn hình chức năng độc giả
│   ├── components/         # Design System giao diện Dark Theme dùng chung (UI.js, AdminUI.js)
│   ├── constants/          # Cấu hình API, theme màu sắc
│   ├── hooks/              # Custom React Hooks
│   └── services/           # Repositories dữ liệu, Biometric, Storage, Notifications
│
├── 📁 backend-mika/         # Dịch vụ máy chủ Backend (Django REST Framework)
│   ├── api/                # Các endpoint REST API (Models, Views, Serializers)
│   ├── backend/            # Cấu hình Django settings, URLs
│   └── manage.py           # Quản trị Django
│
└── 📁 database/             # Cơ sở dữ liệu quan hệ
    └── db_mika_books.sql   # Script cấu trúc và dữ liệu mẫu MySQL (9 bảng)
```

---

## 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

### 📱 Frontend (Trọng tâm phát triển)
- **Framework & Routing:** React Native, Expo SDK, Expo Router (File-based Routing).
- **Ngôn ngữ:** JavaScript (ES6+).
- **Bộ nhớ cục bộ & Lưu phiên:** AsyncStorage (Quản lý tủ sách, lịch sử, session đăng nhập offline).
- **Bảo mật & Tính năng thiết bị:** Expo Local Authentication (Xác thực Vân tay / FaceID), Local Notifications.
- **Giao diện & Trải nghiệm:** Design System chuẩn Dark Mode (Deep Slate `#0a0d14`, Purple Indigo `#a07cf0`), hiệu ứng kính mờ (Glassmorphism), thanh điều hướng nổi (Floating BottomNav).
- **Kiến trúc dữ liệu:** Áp dụng mô hình **Repository Pattern** cùng cơ chế **Hybrid Data Fallback** (tự động chuyển sang Mock Data khi mất kết nối Backend, đảm bảo không gián đoạn trải nghiệm người dùng).

### 🖥️ Backend
- **Framework:** Python 3.12+, Django 6.0, Django REST Framework (DRF).
- **Bảo mật:** Hash mật khẩu, Token Authentication.
- **Quản trị:** Django Admin Dashboard.

### 🗄️ Database
- **Hệ quản trị:** MySQL (`db_mika_books`).
- **Mô hình dữ liệu:** 9 bảng chuẩn hóa (`NguoiDung`, `TheLoai`, `Sach`, `Chuong`, `SachTheLoai`, `SachYeuThich`, `GoiNapXu`, `ChuongDaMoKhoa`, `LichSuGiaoDich`).

---

## 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### Bước 1: Chạy ứng dụng Frontend Mobile (Nhanh nhất)
*Ứng dụng hỗ trợ chạy độc lập với cơ chế dữ liệu offline, không bắt buộc phải bật backend trước:*

```bash
# 1. Đi vào thư mục Frontend
cd fe-mika

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi động Expo Dev Server
npx expo start
```
> 📲 **Cách trải nghiệm:**
> - Cài app **Expo Go** trên điện thoại Android hoặc iOS.
> - Quét mã QR hiển thị trên Terminal để mở app trực tiếp trên điện thoại.
> - Hoặc ấn phím `w` để chạy thử trực tiếp trên trình duyệt Web.

---

### Bước 2: Chạy Backend & Cơ sở dữ liệu (Tùy chọn)
Khi muốn kích hoạt kết nối máy chủ dữ liệu đầy đủ:

1. **Import Database:**
   - Mở MySQL Workbench / DBeaver / phpMyAdmin, tạo CSDL tên: `db_mika_books`.
   - Import file script: `database/db_mika_books.sql`.

2. **Chạy Backend Django:**
   ```bash
   cd backend-mika
   python -m venv .venv
   .venv\Scripts\activate
   pip install django djangorestframework django-cors-headers mysqlclient
   python manage.py runserver 0.0.0.0:8000
   ```

---

## 5. TÀI KHOẢN DÙNG THỬ / KIỂM THỬ

Bạn có thể đăng nhập trải nghiệm ngay trên ứng dụng di động bằng các tài khoản demo sau:

| Loại tài khoản | Email đăng nhập | Mật khẩu | Quyền hạn & Chức năng |
| :--- | :--- | :--- | :--- |
| **Độc giả (User)** | `24050094@student.bdu.edu.vn` | `12345Qwert@#` | Đọc truyện, nạp xu MoMo/VNPay, mở khóa chương VIP, lưu tủ sách |
| **Quản trị (Admin)** | `admin@mika.vn` | `admin123` | Toàn quyền truy cập **Admin Portal** trên app để quản lý sách, chương, doanh thu |

---

<p align="center">
  <b>Mika Books</b> — <i>Đồ án ứng dụng di động đọc sách điện tử</i>
</p>
