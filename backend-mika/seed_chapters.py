import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Sach, Chuong

def seed():
    try:
        sach = Sach.objects.get(pk=1)
    except Sach.DoesNotExist:
        print("Book with id=1 not found. Creating a fake Book 1.")
        sach = Sach.objects.create(
            id=1,
            tieu_de="Hành Trình Vô Tận Của Các Tinh Hệ",
            tac_gia="Mika Writer",
            diem_danh_gia=4.8,
            so_chuong=0,
            luot_doc=1240,
            trang_thai="Đang ra",
            anh_bia_url="https://images.unsplash.com/photo-1541701494587-cb58502866ab",
            mo_ta="Cuộc phiêu lưu khoa học viễn tưởng xuyên không gian vũ trụ rộng lớn."
        )

    # Clean existing chapters for Book 1
    Chuong.objects.filter(sach=sach).delete()

    chapters = []
    for i in range(1, 101):
        is_locked = (i >= 21)
        cost = 20 if is_locked else 0
        
        title = f"Chương {i}: "
        if i == 1:
            title += "Khởi Đầu Mới Ở Trạm Vũ Trụ Alpha"
        elif i == 2:
            title += "Tín Hiệu Lạ Từ Tinh Vân Tối"
        elif i == 3:
            title += "Khám Phá Hành Tinh Cổ Đại"
        elif i == 4:
            title += "Bí Ẩn Về Năng Lượng Đen"
        elif i == 5:
            title += "Cuộc Chạm Trán Không Báo Trước"
        elif i == 20:
            title += "Ranh Giới Cuối Cùng (Chương Miễn Phí Cuối)"
        elif i == 21:
            title += "Bước Ngoặt Kịch Tính (Chương Thu Phí Đầu Tiên)"
        else:
            title += f"Cuộc Phiêu Lưu Kì Thú Tập {i}"

        content = (
            f"Đây là nội dung chi tiết của Chương {i} thuộc cuốn sách '{sach.tieu_de}'.\n\n"
            f"Vũ trụ bao la rộng lớn chứa đựng vô số điều kỳ diệu và nguy hiểm chưa được khám phá. "
            f"Phi thuyền vũ trụ Vanguard tiếp tục lao đi trong không gian, mang theo hy vọng cuối cùng của nhân loại "
            f"để tìm kiếm một ngôi nhà mới giữa các vì sao lấp lánh...\n\n"
            f"Mọi liên hệ bản quyền thuộc về Mika Library. Nghiêm cấm sao chép dưới mọi hình thức."
        )

        chapters.append(
            Chuong(
                sach=sach,
                tieu_de=title,
                so_thu_tu_chuong=i,
                co_khoa=is_locked,
                xu_yeu_cau=cost,
                noi_dung=content
            )
        )

    Chuong.objects.bulk_create(chapters)
    sach.so_chuong = 100
    sach.save()
    print("Successfully seeded 100 chapters for Book 1!")

if __name__ == '__main__':
    seed()
