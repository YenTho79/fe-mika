from django.contrib import admin
from . import models


@admin.register(models.NguoiDung)
class NguoiDungAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'ho_ten',
        'email',
        'so_du_xu',
        'vai_tro',
        'trang_thai',
        'ngay_tao',
    )
    search_fields = ('ho_ten', 'email')


@admin.register(models.TheLoai)
class TheLoaiAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'ten_the_loai',
        'duong_dan_slug',
    )
    search_fields = ('ten_the_loai',)


@admin.register(models.Sach)
class SachAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'tieu_de',
        'tac_gia',
        'trang_thai',
        'luot_doc',
        'so_chuong',
    )
    search_fields = ('tieu_de', 'tac_gia')


@admin.register(models.Chuong)
class ChuongAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'sach',
        'tieu_de',
        'so_thu_tu_chuong',
        'co_khoa',
        'xu_yeu_cau',
    )
    search_fields = ('tieu_de',)


@admin.register(models.GoiNapXu)
class GoiNapXuAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'ten_goi',
        'so_xu',
        'gia_tien',
        'xu_tang_kem',
    )


@admin.register(models.SachTheLoai)
class SachTheLoaiAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'sach',
        'the_loai',
        'ngay_gan',
    )


@admin.register(models.SachYeuThich)
class SachYeuThichAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nguoi_dung',
        'sach',
        'ngay_them',
    )


@admin.register(models.ChuongDaMoKhoa)
class ChuongDaMoKhoaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nguoi_dung',
        'chuong',
        'xu_da_tra',
        'ngay_mo_khoa',
    )


@admin.register(models.LichSuGiaoDich)
class LichSuGiaoDichAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nguoi_dung',
        'goi_nap',
        'ma_giao_dich_cong',
        'phuong_thuc',
        'trang_thai',
        'ngay_giao_dich',
    )
