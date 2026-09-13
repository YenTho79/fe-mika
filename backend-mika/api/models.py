from django.db import models


class NguoiDung(models.Model):
    ho_ten = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    mat_khau_hash = models.CharField(max_length=255)
    api_token = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        unique=True,
    )
    push_token = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text='Expo Push Token để gửi thông báo đẩy đến thiết bị.',
    )
    so_du_xu = models.IntegerField(default=0)
    is_vip = models.BooleanField(default=False)
    vai_tro = models.CharField(max_length=50, default='user')
    trang_thai = models.CharField(max_length=50, default='active')
    ngay_tao = models.DateTimeField(auto_now_add=True)

    @property
    def is_vip_active(self):
        from django.utils import timezone
        if not self.is_vip:
            return False
        return self.vip_subscriptions.filter(ngay_het_han__gt=timezone.now()).exists()

    @property
    def vip_expires_at(self):
        latest_sub = self.vip_subscriptions.order_by('-ngay_het_han').first()
        if latest_sub:
            return latest_sub.ngay_het_han
        return None

    class Meta:
        db_table = 'nguoi_dung'
        verbose_name = 'Người dùng'
        verbose_name_plural = 'Người dùng'

    def __str__(self):
        return str(self.ho_ten or self.email or "")


class TheLoai(models.Model):
    ten_the_loai = models.CharField(max_length=100, unique=True)
    duong_dan_slug = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'the_loai'
        verbose_name = 'Thể loại'
        verbose_name_plural = 'Thể loại'

    def __str__(self):
        return str(self.ten_the_loai or "")


class Sach(models.Model):
    tieu_de = models.CharField(max_length=255)
    tac_gia = models.CharField(max_length=150)
    diem_danh_gia = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
    )
    so_chuong = models.IntegerField(default=0)
    luot_doc = models.IntegerField(default=0)
    trang_thai = models.CharField(max_length=50, default='Đang ra')
    anh_bia_url = models.CharField(max_length=512)
    mo_ta = models.TextField(null=True, blank=True)
    ngay_tao = models.DateTimeField(auto_now_add=True)
    the_loai = models.ManyToManyField(
        TheLoai,
        through='SachTheLoai',
        related_name='saches',
    )

    class Meta:
        db_table = 'sach'
        verbose_name = 'Sách'
        verbose_name_plural = 'Sách'

    def __str__(self):
        return str(self.tieu_de or "")


class GoiNapXu(models.Model):
    ten_goi = models.CharField(max_length=100, null=True, blank=True)
    so_xu = models.IntegerField(null=True, blank=True)
    xu_tang_kem = models.IntegerField(default=0)
    gia_tien = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    ngay_tao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'goi_nap_xu'
        verbose_name = 'Gói nạp xu'
        verbose_name_plural = 'Gói nạp xu'

    def __str__(self):
        return str(self.ten_goi or f'Gói {self.pk}')


class Chuong(models.Model):
    sach = models.ForeignKey(
        Sach,
        on_delete=models.CASCADE,
        related_name='chuongs',
    )
    tieu_de = models.CharField(max_length=255, null=True, blank=True)
    so_thu_tu_chuong = models.IntegerField(null=True, blank=True)
    co_khoa = models.BooleanField(default=False)
    xu_yeu_cau = models.IntegerField(default=0)
    noi_dung = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'chuong'
        verbose_name = 'Chương'
        verbose_name_plural = 'Chương'

    def __str__(self):
        return str(self.tieu_de or f'Chương {self.so_thu_tu_chuong}')


class SachTheLoai(models.Model):
    sach = models.ForeignKey(Sach, on_delete=models.CASCADE)
    the_loai = models.ForeignKey(TheLoai, on_delete=models.CASCADE)
    ngay_gan = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sach_the_loai'
        unique_together = ('sach', 'the_loai')
        verbose_name = 'Sách - Thể loại'
        verbose_name_plural = 'Sách - Thể loại'

    def __str__(self):
        return str(f'{self.sach} / {self.the_loai}')


class SachYeuThich(models.Model):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE)
    sach = models.ForeignKey(Sach, on_delete=models.CASCADE)
    ngay_them = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sach_yeu_thich'
        unique_together = ('nguoi_dung', 'sach')
        verbose_name = 'Sách yêu thích'
        verbose_name_plural = 'Sách yêu thích'

    def __str__(self):
        return str(f'{self.nguoi_dung} yêu thích {self.sach}')


class ChuongDaMoKhoa(models.Model):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE)
    chuong = models.ForeignKey(Chuong, on_delete=models.CASCADE)
    xu_da_tra = models.IntegerField(null=True, blank=True)
    ngay_mo_khoa = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chuong_da_mo_khoa'
        unique_together = ('nguoi_dung', 'chuong')
        verbose_name = 'Chương đã mở khóa'
        verbose_name_plural = 'Chương đã mở khóa'

    def __str__(self):
        return str(f'{self.nguoi_dung} mở khóa {self.chuong}')


class LichSuDoc(models.Model):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE)
    sach = models.ForeignKey(Sach, on_delete=models.CASCADE)
    chuong = models.ForeignKey(Chuong, on_delete=models.CASCADE, null=True, blank=True)
    ngay_doc = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lich_su_doc'
        unique_together = ('nguoi_dung', 'sach')
        verbose_name = 'Lịch sử đọc'
        verbose_name_plural = 'Lịch sử đọc'

    def __str__(self):
        return str(f'{self.nguoi_dung} đọc {self.sach} - {self.chuong}')


class LichSuGiaoDich(models.Model):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, null=True, blank=True)
    goi_nap = models.ForeignKey(GoiNapXu, on_delete=models.CASCADE, null=True, blank=True)
    ma_giao_dich_cong = models.CharField(max_length=100, null=True, blank=True)
    phuong_thuc = models.CharField(max_length=50, null=True, blank=True)
    trang_thai = models.CharField(max_length=50, default='Chờ xử lý')
    ngay_giao_dich = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lich_su_giao_dich'
        verbose_name = 'Lịch sử giao dịch'
        verbose_name_plural = 'Lịch sử giao dịch'

    def __str__(self):
        return str(f'Giao dịch #{self.pk} - {self.trang_thai}')


class ThanhVienVip(models.Model):
    nguoi_dung = models.ForeignKey(
        NguoiDung,
        on_delete=models.CASCADE,
        related_name='vip_subscriptions',
    )
    ngay_kich_hoat = models.DateTimeField(auto_now_add=True)
    ngay_het_han = models.DateTimeField()
    xu_da_tra = models.IntegerField(default=1000)
    ngay_tao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'thanh_vien_vip'
        verbose_name = 'Thành viên VIP'
        verbose_name_plural = 'Thành viên VIP'

    def __str__(self):
        return str(f'VIP #{self.pk} - {self.nguoi_dung} - Hạn: {self.ngay_het_han}')

class Review(models.Model):
    nguoi_dung = models.ForeignKey(NguoiDung, on_delete=models.CASCADE, related_name='reviews')
    sach = models.ForeignKey(Sach, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=0)
    content = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, default='approved')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'review'
        verbose_name = 'Đánh giá'
        verbose_name_plural = 'Đánh giá'

    def __str__(self):
        return f'Review #{self.pk} by {self.nguoi_dung} for {self.sach}'
