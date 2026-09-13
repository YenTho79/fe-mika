# 📚 Mika Books - Mobile Reading App & Digital Library

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-Expo%20Router-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Frontend-Nguyễn%20Thị%20Yến%20Thơ-FF69B4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Backend-Django%20REST-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
</p>

Ứng dụng đọc truyện và thư viện sách điện tử trực tuyến hiện đại trên nền tảng di động, kết hợp hệ sinh thái nội dung số, mở khóa chương VIP bằng xu và giao diện Dark Theme tối ưu trải nghiệm đọc.

---

## 🌟 1. TÂM ĐIỂM DỰ ÁN: FRONTEND MOBILE APP (`fe-mika`)

> **Frontend Developer:** Nguyễn Thị Yến Thơ  
> **Nền tảng:** React Native (Expo) & Expo Router  
> **Ngôn ngữ:** JavaScript (ES6+)  
> **Trạng thái:** Hoàn thiện 100% giao diện, luồng nghiệp vụ & cơ chế Fallback Offline/Online linh hoạt.

### 🎨 Thiết Kế Giao Diện & Trải Nghiệm Người Dùng (UI/UX)
- **Modern Dark Theme:** Phối màu chuẩn đêm (Deep Slate `#0a0d14`, Purple Indigo `#a07cf0`, Gold Accent `#f59e0b`) giúp bảo vệ mắt độc giả khi đọc sách thời gian dài.
- **Glassmorphism Design System:** Bộ components tái sử dụng cao (`components/UI.js`) với hiệu ứng thẻ kính mờ, viền neon tinh tế, bóng đổ mềm mại.
- **Floating Bottom Navigation:** Thanh điều hướng nổi đáy màn hình linh hoạt, tối ưu thao tác một tay trên smartphone.
- **Safe Area & Responsive:** Tương thích tốt với các màn hình tai thỏ, Dynamic Island trên cả iOS và Android.

### 🚀 Tính Năng Nổi Bật Trên Mobile App

#### 👤 Phân Hệ Độc Giả (Client - 15+ Màn hình hoàn thiện)
1. **Xác thực người dùng:** Đăng ký, Đăng nhập với cơ chế bảo mật sinh trắc học (**Biometric Authentication** - Vân tay / FaceID).
2. **Trang chủ (`trang-chu.jsx`):** Banner slider chuyển động mượt mà, gợi ý sách thông minh, tìm kiếm tức thì (live search) và bộ lọc nhanh theo thể loại.
3. **Khám phá & Sách mới (`noi-bat.jsx`, `sach-moi.jsx`):** Bố cục lưới Grid 2 cột trực quan, phân trang và sắp xếp theo lượt đọc, điểm đánh giá.
4. **Chi tiết tác phẩm (`chi-tiet.jsx`):** Hiển thị tác giả, điểm sao, mô tả tóm tắt, mục lục chương, gắn nhãn chương Miễn phí và chương VIP khóa xu.
5. **Trình đọc sách chuyên nghiệp (`doc-sach.jsx`):** 
   - Tùy chỉnh kích thước chữ linh hoạt theo thị lực.
   - Điều hướng chương trước / chương sau liền mạch.
   - Cơ chế tự động nhận diện chương khóa để dẫn người dùng đến luồng nạp xu.
6. **Hệ thống Xu & Thanh toán đa kênh (`nap-xu.jsx`, `thanh-toan.jsx`, `thanh-toan-thanh-cong.jsx`):** 
   - Đa dạng gói nạp xu kèm ưu đãi quà tặng.
   - Hỗ trợ mô phỏng thanh toán qua Ví MoMo, VNPay và quét mã VietQR.
   - Tự động cộng xu vào ví số dư ngay khi thanh toán hoàn tất.
7. **Tủ sách cá nhân & Lịch sử (`truyen-da-luu.jsx`, `lich-su-doc.jsx`):** Lưu trữ truyện yêu thích, đánh dấu tiến độ chương đang đọc dở.
8. **Chia sẻ truyện mạng xã hội (`chia-se.jsx`, `xem-truoc-chia-se.jsx`):** Trích dẫn câu nói hay, thiết kế thẻ trích dẫn nghệ thuật để chia sẻ lên Facebook/Instagram/TikTok.
9. **Trung tâm tài khoản (`tai-khoan.jsx`):** Quản lý hồ sơ, số dư xu, lịch sử giao dịch, thông báo hệ thống và tùy chọn giao diện.

#### 🛡️ Phân Hệ Quản Trị Hệ Thống (Admin Portal)
Hệ thống quản trị di động thu nhỏ tích hợp trực tiếp trong app (`app/admin/*`):
- **Quản lý truyện & chương:** Thêm mới, chỉnh sửa nội dung, thiết lập giá xu cho từng chương.
- **Quản lý người dùng & phân quyền:** Xem danh sách độc giả, cấp quyền VIP/Admin.
- **Quản trị giao dịch & doanh thu:** Theo dõi lịch sử nạp xu và dòng tiền.
- **Kiểm duyệt tin tức & đánh giá:** Quản lý bài đăng thông báo và bình luận của cộng đồng.

### 🏗️ Kiến Trúc Mã Nguồn Frontend Chuyên Nghiệp
- **File-based Routing (Expo Router):** Cấu trúc thư mục định tuyến chuẩn mực, dễ mở rộng và bảo trì.
- **Repository Pattern:** Tách rời tầng giao diện (UI) và tầng dữ liệu thông qua các repositories (`bookRepository`, `chapterRepository`, `userRepository`, `transactionRepository`, `reviewRepository`, `articleRepository`).
- **Hybrid Data Flow (Online & Offline First):**
  - Kết nối REST API Django qua axios/fetch với cơ chế tự động nhận diện IP máy chủ nội bộ (`constants/api.js - getDevServerIp`).
  - **Tự động chuyển sang Mock Data / Local Storage** khi Backend ngắt kết nối hoặc chạy offline độc lập mà không làm đứt đoạn trải nghiệm của người dùng.
- **Dịch vụ thông báo (Notification Service):** Hỗ trợ Local Notification và chuẩn bị sẵn hạ tầng cho Expo Push Notification.

---

## 🗂️ 2. CẤU TRÚC REPOSITORY (MONOREPO)

Dự án được phân chia gọn gàng thành 3 thành phần độc lập trong cùng một repository:

```text
mika-app/
├── 📁 fe-mika/              # [TÂM ĐIỂM] Mã nguồn ứng dụng di động React Native (Expo)
│   ├── app/                # Các màn hình ứng dụng (Expo Router)
│   │   ├── admin/          # Phân hệ quản trị di động (Admin Portal)
│   │   ├── chi-tiet.jsx    # Màn hình chi tiết truyện
│   │   ├── doc-sach.jsx    # Trình đọc truyện
│   │   └── ...
│   ├── components/         # Design System (UI.js, AdminUI.js,...)
│   ├── constants/          # Cấu hình API, theme màu sắc
│   ├── hooks/              # Custom Hooks (useTheme, useLocalBooks,...)
│   └── services/           # Repositories, Biometrics, Notifications, Storage
│
├── 📁 backend-mika/         # Mã nguồn máy chủ Backend (Django REST Framework)
│   ├── api/                # Ứng dụng API chính (Models, Views, Serializers, URLs)
│   ├── backend/            # Cấu hình Django settings, wsgi, asgi
│   └── manage.py           # Quản lý lệnh Django
│
├── 📁 database/             # Cơ sở dữ liệu
│   └── db_mika_books.sql   # Script khởi tạo và dữ liệu mẫu MySQL
│
└── 📄 .gitignore            # Loại trừ node_modules, .venv, thư mục tạm
```

---

## ⚙️ 3. TỔNG QUAN HỆ THỐNG BACKEND & CƠ SỞ DỮ LIỆU

### 💻 Backend (`backend-mika`)
- **Tech Stack:** Python 3.12+, Django 6.0, Django REST Framework (DRF).
- **Chức năng chính:**
  - Cung cấp RESTful APIs: Đăng ký, Đăng nhập (tạo Token & hash mật khẩu), Danh sách truyện, Tìm kiếm, Chi tiết chương.
  - Tích hợp Django Admin trực quan để quản lý dữ liệu gốc.
  - Phục vụ API mượt mà cho Mobile App giao tiếp qua mạng LAN hoặc máy ảo.

### 🗄️ Cơ sở dữ liệu (`database`)
- **Hệ quản trị:** MySQL (`db_mika_books`).
- **Thực thể dữ liệu:** Bao gồm 9 bảng hoàn chỉnh: `NguoiDung`, `TheLoai`, `Sach`, `Chuong`, `SachTheLoai`, `SachYeuThich`, `GoiNapXu`, `ChuongDaMoKhoa`, `LichSuGiaoDich`.

---

## 🚀 4. HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Bước 1: Khởi chạy Frontend Mobile (Ưu tiên)
Ứng dụng hỗ trợ chạy ngay lập tức bằng dữ liệu Local / Offline mà không bắt buộc phải bật backend trước:

```bash
# Di chuyển vào thư mục Frontend
cd fe-mika

# Cài đặt thư viện phụ thuộc
npm install

# Khởi động máy chủ Expo
npx expo start
```
> 📱 **Cách xem ứng dụng:**
> - Cài ứng dụng **Expo Go** trên điện thoại (Android hoặc iOS).
> - Quét mã QR trên màn hình terminal để mở ứng dụng trực tiếp trên điện thoại của bạn.
> - Hoặc bấm phím `w` để chạy thử nghiệm trên trình duyệt Web.

---

### Bước 2: Chạy Backend & Database (Tùy chọn khi cần kết nối full API)
1. **Import Database:**
   - Mở MySQL Workbench / phpMyAdmin / DBeaver, tạo cơ sở dữ liệu `db_mika_books`.
   - Import file script `database/db_mika_books.sql`.
2. **Chạy Django Backend:**
   ```bash
   cd backend-mika
   python -m venv .venv
   .venv\Scripts\activate      # Trên Windows
   pip install django djangorestframework django-cors-headers mysqlclient
   python manage.py runserver 0.0.0.0:8000
   ```

---

## 🔑 5. TÀI KHOẢN TRẢI NGHIỆM DEMO

Bạn có thể đăng nhập ngay vào ứng dụng di động bằng các tài khoản mẫu sau:

| Vai trò | Email đăng nhập | Mật khẩu | Đặc quyền |
| :--- | :--- | :--- | :--- |
| **Độc giả (User)** | `user@mika.vn` | `12345678` | Đọc truyện, nạp xu, lưu sách yêu thích, đánh giá |
| **Quản trị (Admin)** | `admin@mika.vn` | `12345678` | Truy cập Admin Portal quản lý truyện, chương, doanh thu |

---

<p align="center">
  <i>Được phát triển với niềm đam mê dành cho trải nghiệm đọc sách số trên di động.</i>
</p>
