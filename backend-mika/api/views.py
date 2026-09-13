from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, serializers
from django.core.exceptions import ObjectDoesNotExist
from django.db import models as dj_models
from django.db.models import F
from django.utils import timezone

from .models import (
    NguoiDung,
    Sach,
    Chuong,
    ChuongDaMoKhoa,
    LichSuDoc,
    LichSuGiaoDich,
    GoiNapXu,
    ThanhVienVip,
)
import secrets

FREE_CHAPTER_COUNT = 2


@csrf_exempt
@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response(
            {'success': False, 'message': 'Email và mật khẩu là bắt buộc.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = NguoiDung.objects.get(email=email)
    except ObjectDoesNotExist:
        return Response(
            {
                'success': False,
                'message': 'Email hoặc mật khẩu không đúng.'
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    password_match = (
        user.mat_khau_hash == password or
        check_password(password, user.mat_khau_hash)
    )

    if not password_match:
        return Response(
            {'success': False, 'message': 'Email hoặc mật khẩu không đúng.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response(
        {
            'success': True,
            'user': {
                'id': user.id,
                'ho_ten': user.ho_ten,
                'email': user.email,
                'so_du_xu': user.so_du_xu,
                'is_vip': user.is_vip_active,
                'vip_expires_at': user.vip_expires_at.isoformat() if user.vip_expires_at else None,
                'ngay_tao': user.ngay_tao,
                'api_token': getattr(user, 'api_token', None),
                'vai_tro': user.vai_tro,
                'trang_thai': user.trang_thai,
            },
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['GET'])
def list_stories(request):
    q = request.GET.get('q')
    qs = Sach.objects.all().order_by('-ngay_tao')
    if q:
        qs = qs.filter(
            dj_models.Q(tieu_de__icontains=q) |
            dj_models.Q(tac_gia__icontains=q)
        )

    results = []
    for s in qs:
        rating = (
            float(s.diem_danh_gia)
            if s.diem_danh_gia is not None
            else 0
        )

        results.append(
            {
                'id': s.id,
                'tieu_de': s.tieu_de,
                'tac_gia': s.tac_gia,
                'diem_danh_gia': rating,
                'so_chuong': s.so_chuong,
                'luot_doc': s.luot_doc,
                'trang_thai': s.trang_thai,
                'anh_bia_url': s.anh_bia_url,
                'mo_ta': s.mo_ta,
                'ngay_tao': s.ngay_tao,
                'the_loai': [tl.ten_the_loai for tl in s.the_loai.all()],
            }
        )

    return Response(
        {'success': True, 'results': results},
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['GET'])
def story_detail(request, pk):
    try:
        s = Sach.objects.get(pk=pk)
    except Sach.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy truyện.'}, status=status.HTTP_404_NOT_FOUND)

    user = get_user_from_request(request)
    unlocked_chapter_ids = set()
    is_vip = getattr(user, 'is_vip_active', False)
    if user and not is_vip:
        unlocked_chapter_ids = set(ChuongDaMoKhoa.objects.filter(nguoi_dung=user, chuong__sach=s).values_list('chuong_id', flat=True))

    chapters = []
    for c in s.chuongs.all().order_by('so_thu_tu_chuong'):
        c_free = is_chapter_free(c)
        c_unlocked = is_vip or (c.id in unlocked_chapter_ids)
        chapters.append(
            {
                'id': c.id,
                'tieu_de': c.tieu_de,
                'so_thu_tu_chuong': c.so_thu_tu_chuong,
                'co_khoa': c.co_khoa,
                'xu_yeu_cau': c.xu_yeu_cau,
                'is_free': c_free,
                'is_paid': c.co_khoa and not c_free,
                'is_unlocked': c_unlocked,
            }
        )

    rating = (
        float(s.diem_danh_gia)
        if s.diem_danh_gia is not None
        else 0
    )

    data = {
        'id': s.id,
        'tieu_de': s.tieu_de,
        'tac_gia': s.tac_gia,
        'diem_danh_gia': rating,
        'so_chuong': s.so_chuong,
        'luot_doc': s.luot_doc,
        'trang_thai': s.trang_thai,
        'anh_bia_url': s.anh_bia_url,
        'mo_ta': s.mo_ta,
        'ngay_tao': s.ngay_tao,
        'the_loai': [tl.ten_the_loai for tl in s.the_loai.all()],
        'chuongs': chapters,
    }

    return Response(
        {'success': True, 'story': data},
        status=status.HTTP_200_OK,
    )


def get_user_from_request(request):
    token = None
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    if auth_header:
        if auth_header.startswith('Token '):
            token = auth_header.split(' ', 1)[1].strip()
        else:
            token = auth_header.strip()

    if not token:
        token = request.GET.get('api_token') or request.data.get('api_token')

    if not token:
        return None

    try:
        return NguoiDung.objects.get(api_token=token)
    except NguoiDung.DoesNotExist:
        return None


def is_chapter_free(chapter):
    return (
        chapter.so_thu_tu_chuong is not None and
        chapter.so_thu_tu_chuong <= FREE_CHAPTER_COUNT
    )


def has_unlocked_chapter(user, chapter):
    return ChuongDaMoKhoa.objects.filter(
        nguoi_dung=user,
        chuong=chapter,
    ).exists()


def save_reading_history(user, story, chapter):
    if not user:
        return

    LichSuDoc.objects.update_or_create(
        nguoi_dung=user,
        sach=story,
        defaults={
            'chuong': chapter,
            'ngay_doc': timezone.now(),
        },
    )


@csrf_exempt
@api_view(['GET'])
def read_chapter(request, story_pk, chapter_pk):
    try:
        story = Sach.objects.get(pk=story_pk)
    except Sach.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Không tìm thấy truyện.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        chapter = Chuong.objects.get(pk=chapter_pk, sach=story)
    except Chuong.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Không tìm thấy chương.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    user = get_user_from_request(request)
    is_vip = getattr(user, 'is_vip_active', False)
    chapter_free = is_chapter_free(chapter)
    chapter_unlocked = is_vip or (user and has_unlocked_chapter(user, chapter))
    
    is_locked_by_rule = chapter.co_khoa and not chapter_free
    chapter_locked = is_locked_by_rule and not chapter_unlocked
    cost = chapter.xu_yeu_cau if chapter.xu_yeu_cau > 0 else 20

    if chapter_locked:
        return Response(
            {
                'success': False,
                'message': 'Chương này đang bị khoá. Vui lòng mở khoá hoặc đọc chương miễn phí.',
                'xu_yeu_cau': cost,
                'free_chapters': FREE_CHAPTER_COUNT,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    save_reading_history(user, story, chapter)

    # Tăng lượt đọc của truyện khi đọc chương thành công
    story.luot_doc = F('luot_doc') + 1
    story.save(update_fields=['luot_doc'])

    return Response(
        {
            'success': True,
            'chapter': {
                'id': chapter.id,
                'tieu_de': chapter.tieu_de,
                'so_thu_tu_chuong': chapter.so_thu_tu_chuong,
                'noi_dung': chapter.noi_dung,
                'co_khoa': chapter.co_khoa,
                'xu_yeu_cau': chapter.xu_yeu_cau,
                'is_free': chapter_free,
                'is_unlocked': bool(chapter_unlocked),
            },
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['POST'])
def unlock_chapter(request, chapter_pk):
    user = get_user_from_request(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Yêu cầu đăng nhập để mở khoá chương.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        chapter = Chuong.objects.select_related('sach').get(pk=chapter_pk)
    except Chuong.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Không tìm thấy chương.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    if not chapter.co_khoa or is_chapter_free(chapter):
        return Response(
            {
                'success': False,
                'message': 'Chương này không cần mở khoá. Chỉ những chương trả phí mới cần mở khoá.',
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if user.is_vip_active:
        return Response(
            {
                'success': True,
                'message': 'Bạn là thành viên VIP, chương này đã được mở khóa tự động.',
                'so_du_xu': user.so_du_xu,
            },
            status=status.HTTP_200_OK,
        )

    if has_unlocked_chapter(user, chapter):
        return Response(
            {
                'success': True,
                'message': 'Chương đã được mở khoá trước đó.',
                'so_du_xu': user.so_du_xu,
            },
            status=status.HTTP_200_OK,
        )

    cost = max(chapter.xu_yeu_cau or 0, 0)
    if user.so_du_xu < cost:
        return Response(
            {
                'success': False,
                'message': 'Số dư xu không đủ để mở khoá chương.',
                'so_du_xu': user.so_du_xu,
                'xu_yeu_cau': cost,
            },
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )

    user.so_du_xu = F('so_du_xu') - cost
    user.save(update_fields=['so_du_xu'])
    user.refresh_from_db(fields=['so_du_xu'])

    ChuongDaMoKhoa.objects.create(
        nguoi_dung=user,
        chuong=chapter,
        xu_da_tra=cost,
    )

    return Response(
        {
            'success': True,
            'message': 'Mở khoá chương thành công.',
            'so_du_xu': user.so_du_xu,
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['GET'])
def reading_history(request):
    user = get_user_from_request(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Yêu cầu đăng nhập để xem lịch sử đọc.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    history_qs = LichSuDoc.objects.filter(nguoi_dung=user).select_related('sach', 'chuong').order_by('-ngay_doc')
    results = []
    for entry in history_qs:
        results.append(
            {
                'story_id': entry.sach.id,
                'story_title': entry.sach.tieu_de,
                'chapter_id': entry.chuong.id if entry.chuong else None,
                'chapter_title': entry.chuong.tieu_de if entry.chuong else None,
                'chapter_number': entry.chuong.so_thu_tu_chuong if entry.chuong else None,
                'updated_at': entry.ngay_doc,
            }
        )

    return Response(
        {'success': True, 'history': results},
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['GET'])
def search_stories(request):
    # delegate to list_stories by using query param `q`
    return list_stories(request)


@csrf_exempt
@api_view(['POST'])
def register_user(request):
    ho_ten = request.data.get('ho_ten')
    email = request.data.get('email')
    password = request.data.get('password')

    if not ho_ten or not email or not password:
        return Response(
            {'success': False, 'message': 'Họ tên, email và mật khẩu là bắt buộc.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if NguoiDung.objects.filter(email=email).exists():
        return Response(
            {'success': False, 'message': 'Email đã được sử dụng.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = NguoiDung.objects.create(
        ho_ten=ho_ten,
        email=email,
        mat_khau_hash=make_password(password),
        so_du_xu=0,
    )

    # create simple API token
    token = secrets.token_hex(20)
    user.api_token = token
    user.save(update_fields=['api_token'])

    return Response(
        {
            'success': True,
            'user': {
                'id': user.id,
                'ho_ten': user.ho_ten,
                'email': user.email,
                'so_du_xu': user.so_du_xu,
                'is_vip': user.is_vip_active,
                'vip_expires_at': user.vip_expires_at.isoformat() if user.vip_expires_at else None,
                'ngay_tao': user.ngay_tao,
                'api_token': user.api_token,
                'vai_tro': user.vai_tro,
                'trang_thai': user.trang_thai,
            },
        },
        status=status.HTTP_201_CREATED,
    )


@csrf_exempt
@api_view(['GET'])
def read_chapter_detail(request, pk):
    try:
        chapter = Chuong.objects.select_related('sach').get(pk=pk)
    except Chuong.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Không tìm thấy chương.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    story = chapter.sach
    user = get_user_from_request(request)
    
    is_vip = getattr(user, 'is_vip_active', False)
    is_admin = getattr(user, 'vai_tro', '') == 'admin'
    chapter_free = is_chapter_free(chapter)
    chapter_unlocked = is_vip or is_admin or (user and has_unlocked_chapter(user, chapter))
    
    is_locked_by_rule = chapter.co_khoa and not chapter_free
    chapter_locked = is_locked_by_rule and not chapter_unlocked
    cost = chapter.xu_yeu_cau if chapter.xu_yeu_cau > 0 else 20

    if chapter_locked:
        return Response(
            {
                'success': False,
                'message': 'Chương này đã bị khóa. Vui lòng mở khóa hoặc nâng cấp VIP để đọc.',
                'xu_yeu_cau': cost,
                'free_chapters': 20,
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    save_reading_history(user, story, chapter)

    # Tăng lượt đọc của truyện khi đọc chương thành công
    story.luot_doc = F('luot_doc') + 1
    story.save(update_fields=['luot_doc'])

    return Response(
        {
            'success': True,
            'chapter': {
                'id': chapter.id,
                'bookId': chapter.sach_id,
                'tieu_de': chapter.tieu_de,
                'so_thu_tu_chuong': chapter.so_thu_tu_chuong,
                'noi_dung': chapter.noi_dung,
                'co_khoa': is_locked_by_rule,
                'xu_yeu_cau': cost,
                'is_free': chapter_free,
                'is_unlocked': bool(chapter_unlocked),
            },
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['POST'])
def upgrade_vip(request):
    user = get_user_from_request(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Yêu cầu đăng nhập để nâng cấp VIP.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    cost = 1000
    is_vip_currently = user.is_vip_active

    if user.so_du_xu < cost:
        return Response(
            {
                'success': False,
                'message': f'Số dư xu không đủ để nâng cấp VIP (Cần {cost} xu).',
                'so_du_xu': user.so_du_xu,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    from datetime import timedelta
    current_expiry = user.vip_expires_at
    if is_vip_currently and current_expiry:
        new_expiry = current_expiry + timedelta(days=30)
    else:
        new_expiry = timezone.now() + timedelta(days=30)

    user.so_du_xu = F('so_du_xu') - cost
    user.is_vip = True
    user.save(update_fields=['so_du_xu', 'is_vip'])
    user.refresh_from_db(fields=['so_du_xu', 'is_vip'])

    ThanhVienVip.objects.create(
        nguoi_dung=user,
        ngay_het_han=new_expiry,
        xu_da_tra=cost
    )

    return Response(
        {
            'success': True,
            'message': 'Gia hạn VIP thành công 30 ngày!' if is_vip_currently else 'Nâng cấp VIP thành công 30 ngày!',
            'user': {
                'id': user.id,
                'ho_ten': user.ho_ten,
                'email': user.email,
                'so_du_xu': user.so_du_xu,
                'is_vip': user.is_vip_active,
                'vip_expires_at': user.vip_expires_at.isoformat() if user.vip_expires_at else None,
            }
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['GET'])
def get_user_profile(request):
    user = get_user_from_request(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Yêu cầu đăng nhập.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response(
        {
            'success': True,
            'user': {
                'id': user.id,
                'ho_ten': user.ho_ten,
                'email': user.email,
                'so_du_xu': user.so_du_xu,
                'is_vip': user.is_vip_active,
                'vip_expires_at': user.vip_expires_at.isoformat() if user.vip_expires_at else None,
                'ngay_tao': user.ngay_tao,
                'vai_tro': user.vai_tro,
                'trang_thai': user.trang_thai,
            }
        },
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['GET'])
def list_transactions(request):
    user = get_user_from_request(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Yêu cầu đăng nhập để xem lịch sử giao dịch.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    results = []
    is_admin = (user.vai_tro == 'admin')

    # 1. Fetch deposit transactions from LichSuGiaoDich
    if is_admin:
        deposit_qs = LichSuGiaoDich.objects.all().select_related('goi_nap', 'nguoi_dung').order_by('-ngay_giao_dich')
    else:
        deposit_qs = LichSuGiaoDich.objects.filter(nguoi_dung=user).select_related('goi_nap').order_by('-ngay_giao_dich')

    for tx in deposit_qs:
        coin_amount = 0
        amount_money = 0
        tx_type = 'deposit'
        
        if tx.goi_nap:
            coin_amount = (tx.goi_nap.so_xu or 0) + (tx.goi_nap.xu_tang_kem or 0)
            amount_money = float(tx.goi_nap.gia_tien or 0)
            
            base_coin = tx.goi_nap.so_xu if tx.goi_nap else 0
            bonus_coin = tx.goi_nap.xu_tang_kem if tx.goi_nap else 0
            desc = f"Nạp {base_coin} xu"
            if bonus_coin > 0:
                desc += f" + {bonus_coin} xu thưởng"
        elif tx.ma_giao_dich_cong and tx.ma_giao_dich_cong.startswith('adj|'):
            tx_type = 'admin_adjustment'
            parts = tx.ma_giao_dich_cong.split('|')
            coin_amount = int(parts[1])
            amount_money = 0
            desc = f"Admin điều chỉnh: {parts[2]}"
            bonus_coin = 0
        else:
            desc = "Giao dịch nạp xu"
            bonus_coin = 0
        
        status_map = {
            'Chờ xử lý': 'processing',
            'Thành công': 'success',
            'Thất bại': 'failed',
        }
        status_str = status_map.get(tx.trang_thai, 'success')

        results.append({
            'id': f'dep-{tx.id}',
            'userId': tx.nguoi_dung_id,
            'type': tx_type,
            'coin': coin_amount,
            'amount': amount_money,
            'status': status_str,
            'method': tx.phuong_thuc or 'MoMo',
            'createdAt': tx.ngay_giao_dich.isoformat(),
            'description': desc,
            'bonus': bonus_coin,
            'balanceAfter': tx.nguoi_dung.so_du_xu if tx.nguoi_dung else 0,
        })

    # 2. Fetch purchase transactions from ChuongDaMoKhoa
    if is_admin:
        purchase_qs = ChuongDaMoKhoa.objects.all().values(
            'nguoi_dung_id',
            'chuong_id',
            'chuong__tieu_de',
            'chuong__so_thu_tu_chuong',
            'chuong__sach__tieu_de',
            'xu_da_tra',
            'ngay_mo_khoa'
        ).order_by('-ngay_mo_khoa')
    else:
        purchase_qs = ChuongDaMoKhoa.objects.filter(nguoi_dung=user).values(
            'nguoi_dung_id',
            'chuong_id',
            'chuong__tieu_de',
            'chuong__so_thu_tu_chuong',
            'chuong__sach__tieu_de',
            'xu_da_tra',
            'ngay_mo_khoa'
        ).order_by('-ngay_mo_khoa')

    for uc in purchase_qs:
        chapter_title = uc['chuong__tieu_de'] or f"Chương {uc['chuong__so_thu_tu_chuong']}"
        results.append({
            'id': f"pur-{uc['nguoi_dung_id']}-{uc['chuong_id']}",
            'userId': uc['nguoi_dung_id'],
            'type': 'buy_chapter',
            'coin': -(uc['xu_da_tra'] or 0),
            'amount': 0,
            'status': 'success',
            'method': None,
            'createdAt': uc['ngay_mo_khoa'].isoformat() if uc['ngay_mo_khoa'] else None,
            'description': f"Mở khóa {chapter_title}",
            'chapterTitle': chapter_title,
            'bookTitle': uc['chuong__sach__tieu_de'] or '',
        })

    # Sort merged transactions by createdAt descending
    results.sort(key=lambda x: x['createdAt'] if x['createdAt'] else '', reverse=True)

    return Response(
        {'success': True, 'results': results},
        status=status.HTTP_200_OK,
    )


@csrf_exempt
@api_view(['GET'])
def transaction_detail(request, tx_id):
    user = get_user_from_request(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Yêu cầu đăng nhập.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if tx_id.startswith('dep-'):
        try:
            db_id = int(tx_id.split('-')[1])
            tx = LichSuGiaoDich.objects.select_related('goi_nap').get(pk=db_id, nguoi_dung=user)
            coin_amount = (tx.goi_nap.so_xu or 0) + (tx.goi_nap.xu_tang_kem or 0) if tx.goi_nap else 0
            amount_money = float(tx.goi_nap.gia_tien or 0) if tx.goi_nap else 0
            base_coin = tx.goi_nap.so_xu if tx.goi_nap else 0
            bonus_coin = tx.goi_nap.xu_tang_kem if tx.goi_nap else 0
            
            status_map = {
                'Chờ xử lý': 'processing',
                'Thành công': 'success',
                'Thất bại': 'failed',
            }
            status_str = status_map.get(tx.trang_thai, 'success')
            
            desc = f"Nạp {base_coin} xu"
            if bonus_coin > 0:
                desc += f" + {bonus_coin} xu thưởng"

            return Response({
                'success': True,
                'transaction': {
                    'id': tx_id,
                    'type': 'deposit',
                    'coin': coin_amount,
                    'amount': amount_money,
                    'status': status_str,
                    'method': tx.phuong_thuc or 'MoMo',
                    'createdAt': tx.ngay_giao_dich.isoformat(),
                    'description': desc,
                    'bonus': bonus_coin,
                    'balanceAfter': user.so_du_xu,
                }
            }, status=status.HTTP_200_OK)
        except (ValueError, LichSuGiaoDich.DoesNotExist):
            return Response({'success': False, 'message': 'Không tìm thấy giao dịch nạp xu.'}, status=status.HTTP_404_NOT_FOUND)

    elif tx_id.startswith('pur-'):
        try:
            parts = tx_id.split('-')
            if len(parts) == 3:
                user_id = int(parts[1])
                db_id = int(parts[2])
            else:
                user_id = user.id
                db_id = int(parts[1])

            if user_id != user.id:
                return Response({'success': False, 'message': 'Không tìm thấy giao dịch mua chương.'}, status=status.HTTP_404_NOT_FOUND)

            uc_qs = ChuongDaMoKhoa.objects.filter(chuong_id=db_id, nguoi_dung=user).values(
                'chuong_id',
                'chuong__tieu_de',
                'chuong__so_thu_tu_chuong',
                'chuong__sach__tieu_de',
                'xu_da_tra',
                'ngay_mo_khoa'
            )
            if not uc_qs.exists():
                return Response({'success': False, 'message': 'Không tìm thấy giao dịch mua chương.'}, status=status.HTTP_404_NOT_FOUND)
            
            uc = uc_qs[0]
            chapter_title = uc['chuong__tieu_de'] or f"Chương {uc['chuong__so_thu_tu_chuong']}"
            return Response({
                'success': True,
                'transaction': {
                    'id': tx_id,
                    'type': 'purchase',
                    'coin': -(uc['xu_da_tra'] or 0),
                    'amount': 0,
                    'status': 'success',
                    'method': None,
                    'createdAt': uc['ngay_mo_khoa'].isoformat() if uc['ngay_mo_khoa'] else None,
                    'description': f"Mở khóa {chapter_title}",
                    'chapterTitle': chapter_title,
                    'bookTitle': uc['chuong__sach__tieu_de'] or '',
                    'balanceAfter': user.so_du_xu,
                }
            }, status=status.HTTP_200_OK)
        except ValueError:
            return Response({'success': False, 'message': 'Không tìm thấy giao dịch mua chương.'}, status=status.HTTP_404_NOT_FOUND)

    return Response({'success': False, 'message': 'Định dạng mã giao dịch không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
def topup_coins(request):
    user = get_user_from_request(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Yêu cầu đăng nhập để nạp xu.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    transaction_id = request.data.get('transactionId')
    coin = int(request.data.get('coin', 0))
    bonus = int(request.data.get('bonus', 0))
    price = float(request.data.get('price', 0))
    method = request.data.get('method', 'MoMo')

    if not transaction_id:
        return Response(
            {'success': False, 'message': 'Mã giao dịch là bắt buộc.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if coin <= 0:
        return Response(
            {'success': False, 'message': 'Số xu nạp không hợp lệ.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if this transaction_id has already been processed on the backend
    if LichSuGiaoDich.objects.filter(ma_giao_dich_cong=transaction_id).exists():
        tx = LichSuGiaoDich.objects.select_related('goi_nap').get(ma_giao_dich_cong=transaction_id)
        return Response({
            'success': True,
            'alreadyProcessed': True,
            'balance': user.so_du_xu,
            'transaction': {
                'id': transaction_id,
                'method': tx.phuong_thuc,
                'coin': (tx.goi_nap.so_xu or 0) + (tx.goi_nap.xu_tang_kem or 0) if tx.goi_nap else coin,
                'amount': float(tx.goi_nap.gia_tien or 0) if tx.goi_nap else price,
                'status': 'success',
            }
        }, status=status.HTTP_200_OK)

    # Find or create a matching GoiNapXu
    package = GoiNapXu.objects.filter(so_xu=coin).first()
    if not package:
        package = GoiNapXu.objects.create(
            ten_goi=f"Gói nạp {coin} xu",
            so_xu=coin,
            xu_tang_kem=bonus,
            gia_tien=price
        )

    # Update user's coin balance
    credited_coins = coin + bonus
    user.so_du_xu = F('so_du_xu') + credited_coins
    user.save(update_fields=['so_du_xu'])
    user.refresh_from_db(fields=['so_du_xu'])

    # Create transaction record in backend database
    tx = LichSuGiaoDich.objects.create(
        nguoi_dung=user,
        goi_nap=package,
        ma_giao_dich_cong=transaction_id,
        phuong_thuc=method,
        trang_thai='Thành công',
    )

    return Response({
        'success': True,
        'alreadyProcessed': False,
        'balance': user.so_du_xu,
        'transaction': {
            'id': transaction_id,
            'method': method,
            'coin': credited_coins,
            'amount': price,
            'status': 'success',
        }
    }, status=status.HTTP_200_OK)


def get_admin_user_from_request(request):
    user = get_user_from_request(request)
    if user and user.vai_tro == 'admin':
        return user
    return None


@csrf_exempt
@api_view(['GET'])
def admin_stats(request):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    total_books = Sach.objects.count()
    total_chapters = Chuong.objects.count()
    total_users = NguoiDung.objects.count()
    total_transactions = LichSuGiaoDich.objects.count()

    # Calculate revenue
    total_revenue = 0
    total_coins = 0
    for tx in LichSuGiaoDich.objects.filter(trang_thai='Thành công').select_related('goi_nap'):
        if tx.goi_nap:
            total_revenue += float(tx.goi_nap.gia_tien or 0)
            total_coins += (tx.goi_nap.so_xu or 0) + (tx.goi_nap.xu_tang_kem or 0)

    # Top books
    top_books = []
    for s in Sach.objects.order_by('-luot_doc')[:5]:
        top_books.append({
            'id': s.id,
            'title': s.tieu_de,
            'views': str(s.luot_doc),
        })

    # Recent transactions
    recent_transactions = []
    tx_qs = LichSuGiaoDich.objects.select_related('goi_nap', 'nguoi_dung').order_by('-ngay_giao_dich')[:7]
    for tx in tx_qs:
        coin_amount = 0
        amount_money = 0
        tx_type = 'deposit'
        if tx.goi_nap:
            coin_amount = (tx.goi_nap.so_xu or 0) + (tx.goi_nap.xu_tang_kem or 0)
            amount_money = float(tx.goi_nap.gia_tien or 0)
            desc = f"Nạp {tx.goi_nap.so_xu} xu"
        elif tx.ma_giao_dich_cong and tx.ma_giao_dich_cong.startswith('adj|'):
            tx_type = 'admin_adjustment'
            parts = tx.ma_giao_dich_cong.split('|')
            coin_amount = int(parts[1])
            desc = f"Admin điều chỉnh: {parts[2]}"
        else:
            desc = "Nạp xu"

        status_map = {
            'Chờ xử lý': 'processing',
            'Thành công': 'success',
            'Thất bại': 'failed',
        }
        status_str = status_map.get(tx.trang_thai, 'success')

        recent_transactions.append({
            'id': f'dep-{tx.id}',
            'userId': tx.nguoi_dung_id,
            'type': tx_type,
            'coin': coin_amount,
            'amount': amount_money,
            'status': status_str,
            'method': tx.phuong_thuc or 'MoMo',
            'createdAt': tx.ngay_giao_dich.isoformat(),
            'description': desc,
        })

    # Recent books
    recent_books = []
    for s in Sach.objects.order_by('-ngay_tao')[:3]:
        recent_books.append({
            'id': s.id,
            'title': s.tieu_de,
            'author': s.tac_gia,
            'cover': s.anh_bia_url,
            'status': 'Full' if s.trang_thai == 'Hoàn thành' else s.trang_thai,
            'publishedAt': s.ngay_tao.isoformat().split('T')[0],
        })

    return Response({
        'success': True,
        'stats': {
            'totalBooks': total_books,
            'totalChapters': total_chapters,
            'totalUsers': total_users,
            'totalTransactions': total_transactions,
            'totalRevenue': total_revenue,
            'totalCoins': total_coins,
            'topBooks': top_books,
            'recentTransactions': recent_transactions,
            'recentBooks': recent_books,
        }
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['GET'])
def admin_list_users(request):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    users = NguoiDung.objects.all().order_by('-ngay_tao')
    results = []
    for u in users:
        results.append({
            'id': u.id,
            'ho_ten': u.ho_ten,
            'email': u.email,
            'so_du_xu': u.so_du_xu,
            'is_vip': u.is_vip_active,
            'vip_expires_at': u.vip_expires_at.isoformat() if u.vip_expires_at else None,
            'ngay_tao': u.ngay_tao.isoformat(),
            'vai_tro': u.vai_tro,
            'trang_thai': u.trang_thai,
        })

    return Response({'success': True, 'results': results}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
def admin_toggle_user_status(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        u = NguoiDung.objects.get(pk=pk)
    except NguoiDung.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy người dùng.'}, status=status.HTTP_404_NOT_FOUND)

    if u.id == user.id:
        return Response({'success': False, 'message': 'Không thể tự khóa tài khoản đang đăng nhập.'}, status=status.HTTP_400_BAD_REQUEST)

    u.trang_thai = 'blocked' if u.trang_thai == 'active' else 'active'
    u.save(update_fields=['trang_thai'])

    return Response({'success': True, 'status': u.trang_thai}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
def admin_adjust_user_coins(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        u = NguoiDung.objects.get(pk=pk)
    except NguoiDung.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy người dùng.'}, status=status.HTTP_404_NOT_FOUND)

    amount = int(request.data.get('amount', 0))
    reason = request.data.get('reason', '').strip()

    if amount == 0:
        return Response({'success': False, 'message': 'Số xu điều chỉnh phải khác 0.'}, status=status.HTTP_400_BAD_REQUEST)
    if not reason:
        return Response({'success': False, 'message': 'Lý do điều chỉnh là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

    if u.so_du_xu + amount < 0:
        return Response({'success': False, 'message': 'Số dư sau điều chỉnh không thể âm.'}, status=status.HTTP_400_BAD_REQUEST)

    u.so_du_xu = F('so_du_xu') + amount
    u.save(update_fields=['so_du_xu'])
    u.refresh_from_db(fields=['so_du_xu'])

    # Create transaction log using ma_giao_dich_cong "adj|{amount}|{reason}"
    LichSuGiaoDich.objects.create(
        nguoi_dung=u,
        goi_nap=None,
        ma_giao_dich_cong=f"adj|{amount}|{reason}",
        phuong_thuc="Admin",
        trang_thai="Thành công"
    )

    return Response({
        'success': True,
        'balance': u.so_du_xu,
        'message': f'Đã điều chỉnh số dư thành {u.so_du_xu} xu.'
    }, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
def admin_create_story(request):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    title = request.data.get('title')
    author = request.data.get('author')
    description = request.data.get('description', '')
    cover = request.data.get('cover', '')
    status_str = request.data.get('status', 'Đang ra')
    rating = float(request.data.get('rating', 5.0))
    categories = request.data.get('categories', [])

    if not title or not author:
        return Response({'success': False, 'message': 'Tên truyện và tác giả là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

    s = Sach.objects.create(
        tieu_de=title,
        tac_gia=author,
        mo_ta=description,
        anh_bia_url=cover,
        trang_thai='Đang ra' if status_str == 'Đang ra' else 'Full' if status_str == 'Hoàn thành' else status_str,
        diem_danh_gia=rating
    )

    # Link categories
    from .models import TheLoai, SachTheLoai
    from django.utils.text import slugify
    for tl_name in categories:
        tl_name_strip = tl_name.strip()
        if tl_name_strip:
            tl, created = TheLoai.objects.get_or_create(
                ten_the_loai=tl_name_strip,
                defaults={'duong_dan_slug': slugify(tl_name_strip) or tl_name_strip.lower()}
            )
            SachTheLoai.objects.get_or_create(sach=s, the_loai=tl)

    return Response({
        'success': True,
        'story': {
            'id': s.id,
            'tieu_de': s.tieu_de,
            'tac_gia': s.tac_gia,
            'anh_bia_url': s.anh_bia_url,
            'trang_thai': s.trang_thai,
            'ngay_tao': s.ngay_tao,
        }
    }, status=status.HTTP_201_CREATED)


def admin_update_story(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        s = Sach.objects.get(pk=pk)
    except Sach.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy truyện.'}, status=status.HTTP_404_NOT_FOUND)

    title = request.data.get('title')
    author = request.data.get('author')
    description = request.data.get('description', s.mo_ta)
    cover = request.data.get('cover', s.anh_bia_url)
    status_str = request.data.get('status', s.trang_thai)
    rating = float(request.data.get('rating', s.diem_danh_gia))
    categories = request.data.get('categories')

    if title:
        s.tieu_de = title
    if author:
        s.tac_gia = author

    s.mo_ta = description
    s.anh_bia_url = cover
    s.trang_thai = 'Đang ra' if status_str == 'Đang ra' else 'Full' if status_str == 'Hoàn thành' else status_str
    s.diem_danh_gia = rating
    s.save()

    # Re-link categories
    from .models import TheLoai, SachTheLoai
    from django.utils.text import slugify
    if categories is not None:
        SachTheLoai.objects.filter(sach=s).delete()
        for tl_name in categories:
            tl_name_strip = tl_name.strip()
            if tl_name_strip:
                tl, created = TheLoai.objects.get_or_create(
                    ten_the_loai=tl_name_strip,
                    defaults={'duong_dan_slug': slugify(tl_name_strip) or tl_name_strip.lower()}
                )
                SachTheLoai.objects.get_or_create(sach=s, the_loai=tl)

    return Response({
        'success': True,
        'story': {
            'id': s.id,
            'tieu_de': s.tieu_de,
            'tac_gia': s.tac_gia,
            'anh_bia_url': s.anh_bia_url,
            'trang_thai': s.trang_thai,
            'ngay_tao': s.ngay_tao,
        }
    }, status=status.HTTP_200_OK)


def admin_delete_story(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        s = Sach.objects.get(pk=pk)
    except Sach.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy truyện.'}, status=status.HTTP_404_NOT_FOUND)

    s.delete()
    return Response({'success': True, 'message': 'Đã xóa truyện thành công.'}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['GET'])
def admin_list_chapters(request):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    book_id = request.GET.get('bookId')
    qs = Chuong.objects.all().order_by('sach_id', 'so_thu_tu_chuong')
    if book_id and book_id != 'undefined':
        qs = qs.filter(sach_id=book_id)

    results = []
    for c in qs:
        results.append({
            'id': c.id,
            'bookId': c.sach_id,
            'number': c.so_thu_tu_chuong,
            'title': c.tieu_de,
            'content': c.noi_dung or '',
            'locked': c.co_khoa,
            'coinPrice': c.xu_yeu_cau,
            'status': 'published',
            'publishedAt': '2025-01-01',
        })

    return Response({'success': True, 'results': results}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
def admin_create_chapter(request):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    book_id = request.data.get('bookId')
    number = int(request.data.get('number', 1))
    title = request.data.get('title')
    content = request.data.get('content', '')
    locked = bool(request.data.get('locked', False))
    coin_price = int(request.data.get('coinPrice', 0))

    if not book_id or not title:
        return Response({'success': False, 'message': 'Truyện và tiêu đề chương là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        sach = Sach.objects.get(pk=book_id)
    except Sach.DoesNotExist:
        return Response({'success': False, 'message': 'Truyện không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

    c = Chuong.objects.create(
        sach=sach,
        so_thu_tu_chuong=number,
        tieu_de=title,
        noi_dung=content,
        co_khoa=locked,
        xu_yeu_cau=coin_price if locked else 0
    )

    sach.so_chuong = sach.chuongs.count()
    sach.save(update_fields=['so_chuong'])

    return Response({
        'success': True,
        'chapter': {
            'id': c.id,
            'bookId': c.sach_id,
            'number': c.so_thu_tu_chuong,
            'title': c.tieu_de,
        }
    }, status=status.HTTP_201_CREATED)


def admin_update_chapter(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        c = Chuong.objects.get(pk=pk)
    except Chuong.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy chương.'}, status=status.HTTP_404_NOT_FOUND)

    number = int(request.data.get('number', c.so_thu_tu_chuong))
    title = request.data.get('title', c.tieu_de)
    content = request.data.get('content', c.noi_dung)
    locked = bool(request.data.get('locked', c.co_khoa))
    coin_price = int(request.data.get('coinPrice', c.xu_yeu_cau))

    c.so_thu_tu_chuong = number
    c.tieu_de = title
    c.noi_dung = content
    c.co_khoa = locked
    c.xu_yeu_cau = coin_price if locked else 0
    c.save()

    return Response({
        'success': True,
        'chapter': {
            'id': c.id,
            'bookId': c.sach_id,
            'number': c.so_thu_tu_chuong,
            'title': c.tieu_de,
        }
    }, status=status.HTTP_200_OK)


def admin_delete_chapter(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        c = Chuong.objects.get(pk=pk)
    except Chuong.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy chương.'}, status=status.HTTP_404_NOT_FOUND)

    sach = c.sach
    c.delete()

    sach.so_chuong = sach.chuongs.count()
    sach.save(update_fields=['so_chuong'])

    return Response({'success': True, 'message': 'Đã xóa chương thành công.'}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['POST'])
def admin_move_chapter(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        c = Chuong.objects.get(pk=pk)
    except Chuong.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy chương.'}, status=status.HTTP_404_NOT_FOUND)

    direction = request.data.get('direction')
    if direction not in ['up', 'down']:
        return Response({'success': False, 'message': 'Hướng di chuyển không hợp lệ.'}, status=status.HTTP_400_BAD_REQUEST)

    chapters = list(c.sach.chuongs.all().order_by('so_thu_tu_chuong'))
    index = next((i for i, x in enumerate(chapters) if x.id == c.id), -1)

    if index == -1:
        return Response({'success': False, 'message': 'Không tìm thấy chương.'}, status=status.HTTP_404_NOT_FOUND)

    target_index = index - 1 if direction == 'up' else index + 1
    if target_index < 0 or target_index >= len(chapters):
        return Response({'success': False, 'message': 'Không thể di chuyển theo hướng này.'}, status=status.HTTP_400_BAD_REQUEST)

    target_c = chapters[target_index]

    # Swap sequence numbers
    temp = c.so_thu_tu_chuong
    c.so_thu_tu_chuong = target_c.so_thu_tu_chuong
    target_c.so_thu_tu_chuong = temp

    c.save(update_fields=['so_thu_tu_chuong'])
    target_c.save(update_fields=['so_thu_tu_chuong'])

    return Response({'success': True, 'message': 'Đã di chuyển chương thành công.'}, status=status.HTTP_200_OK)


@csrf_exempt
@api_view(['PUT', 'DELETE'])
def admin_story_detail(request, pk):
    if request.method == 'PUT':
        return admin_update_story(request, pk)
    elif request.method == 'DELETE':
        return admin_delete_story(request, pk)


@csrf_exempt
@api_view(['PUT', 'DELETE'])
def admin_chapter_detail(request, pk):
    if request.method == 'PUT':
        return admin_update_chapter(request, pk)
    elif request.method == 'DELETE':
        return admin_delete_chapter(request, pk)


@csrf_exempt
@api_view(['POST'])
def admin_update_transaction_status(request, pk):
    user = get_admin_user_from_request(request)
    if not user:
        return Response({'success': False, 'message': 'Không có quyền thực hiện.'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        tx = LichSuGiaoDich.objects.get(pk=pk)
    except LichSuGiaoDich.DoesNotExist:
        return Response({'success': False, 'message': 'Không tìm thấy giao dịch.'}, status=status.HTTP_404_NOT_FOUND)

    next_status = request.data.get('status')
    if next_status == 'success':
        if tx.trang_thai != 'Thành công' and tx.goi_nap:
            u = tx.nguoi_dung
            credited_coins = (tx.goi_nap.so_xu or 0) + (tx.goi_nap.xu_tang_kem or 0)
            u.so_du_xu = F('so_du_xu') + credited_coins
            u.save(update_fields=['so_du_xu'])
        tx.trang_thai = 'Thành công'
    elif next_status == 'failed':
        tx.trang_thai = 'Thất bại'
    else:
        tx.trang_thai = next_status
        
    tx.save()
    return Response({'success': True, 'message': 'Cập nhật trạng thái giao dịch thành công.'}, status=status.HTTP_200_OK)


from rest_framework import viewsets
from .models import Review
from .serializers import ReviewSerializer
from rest_framework.permissions import BasePermission

class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow read for all requests (actually we want everyone to see approved reviews, but for simplicity let's handle that in get_queryset)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        # For write permissions, must be owner or admin
        user = get_user_from_request(request)
        if not user:
            return False
        if getattr(user, 'vai_tro', '') == 'admin':
            return True
        return obj.nguoi_dung == user

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAdminOrOwner]

    def get_queryset(self):
        queryset = Review.objects.all().order_by('-created_at')
        book_id = self.request.query_params.get('bookId')
        if book_id:
            queryset = queryset.filter(sach_id=book_id)
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset

    def perform_create(self, serializer):
        user = get_user_from_request(self.request)
        if not user:
            raise serializers.ValidationError("User must be authenticated")
        
        book_id = self.request.data.get('bookId')
        if not book_id:
            raise serializers.ValidationError("bookId is required")
        
        try:
            sach = Sach.objects.get(id=book_id)
        except Sach.DoesNotExist:
            raise serializers.ValidationError("Book not found")
            
        serializer.save(nguoi_dung=user, sach=sach)


# ─── Push Notification helpers ────────────────────────────────────────────────

import json
import urllib.request
import urllib.error

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'


def _send_expo_push(messages: list):
    """
    Gửi danh sách messages đến Expo Push API.
    Mỗi message có dạng:
      { 'to': '<ExpoPushToken>', 'title': str, 'body': str, 'data': dict }
    Trả về list kết quả từ Expo hoặc [] nếu lỗi.
    """
    if not messages:
        return []
    try:
        payload = json.dumps(messages).encode('utf-8')
        req = urllib.request.Request(
            EXPO_PUSH_URL,
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            method='POST',
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return result.get('data', [])
    except Exception as exc:
        print(f'[push] Expo API error: {exc}')
        return []


def _require_token(request):
    """Trả về NguoiDung nếu header Authorization hợp lệ, ngược lại None."""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Token '):
        return None
    token = auth.split(' ', 1)[1].strip()
    try:
        return NguoiDung.objects.get(api_token=token)
    except NguoiDung.DoesNotExist:
        return None


# ─── Endpoint: Lưu Expo Push Token ────────────────────────────────────────────

@csrf_exempt
@api_view(['POST'])
def save_push_token(request):
    """
    POST /api/user/push-token/
    Body: { "push_token": "ExponentPushToken[xxx]" }
    Header: Authorization: Token <api_token>
    """
    user = _require_token(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Xác thực không hợp lệ.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    push_token = (request.data.get('push_token') or '').strip()
    if not push_token:
        return Response(
            {'success': False, 'message': 'push_token là bắt buộc.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.push_token = push_token
    user.save(update_fields=['push_token'])
    return Response({'success': True, 'message': 'Đã lưu push token.'})


# ─── Endpoint: Admin broadcast notification ────────────────────────────────────

@csrf_exempt
@api_view(['POST'])
def broadcast_notification(request):
    """
    POST /api/admin/broadcast-notification/
    Body: { "title": str, "body": str, "data": {} }
    Header: Authorization: Token <admin_api_token>
    Gửi push notification đến tất cả user có push_token trong DB.
    """
    user = _require_token(request)
    if not user:
        return Response(
            {'success': False, 'message': 'Xác thực không hợp lệ.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if user.vai_tro != 'admin':
        return Response(
            {'success': False, 'message': 'Chỉ admin mới có thể gửi thông báo hàng loạt.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    title = (request.data.get('title') or '').strip()
    body = (request.data.get('body') or '').strip()
    data = request.data.get('data') or {}

    if not title or not body:
        return Response(
            {'success': False, 'message': 'title và body là bắt buộc.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Lấy tất cả push token không rỗng
    tokens = list(
        NguoiDung.objects.filter(
            push_token__isnull=False,
            trang_thai='active',
        ).exclude(push_token='').values_list('push_token', flat=True)
    )

    if not tokens:
        return Response({
            'success': True,
            'message': 'Không có thiết bị nào đã đăng ký nhận thông báo.',
            'sent': 0,
        })

    # Chia thành batches 100 token (giới hạn Expo)
    batch_size = 100
    messages = [
        {'to': token, 'title': title, 'body': body, 'data': data, 'sound': 'default'}
        for token in tokens
    ]
    results = []
    for i in range(0, len(messages), batch_size):
        results.extend(_send_expo_push(messages[i:i + batch_size]))

    return Response({
        'success': True,
        'message': f'Đã gửi thông báo đến {len(tokens)} thiết bị.',
        'sent': len(tokens),
        'results': results,
    })

