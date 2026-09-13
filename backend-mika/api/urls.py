from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    login_user,
    register_user,
    list_stories,
    story_detail,
    search_stories,
    read_chapter,
    unlock_chapter,
    reading_history,
    read_chapter_detail,
    upgrade_vip,
    list_transactions,
    transaction_detail,
    topup_coins,
    get_user_profile,
    admin_stats,
    admin_list_users,
    admin_toggle_user_status,
    admin_adjust_user_coins,
    admin_create_story,
    admin_story_detail,
    admin_list_chapters,
    admin_create_chapter,
    admin_chapter_detail,
    admin_move_chapter,
    admin_update_transaction_status,
    ReviewViewSet,
    save_push_token,
    broadcast_notification,
)

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('login/', login_user, name='login_user'),
    path('register/', register_user, name='register_user'),
    path('stories/', list_stories, name='list_stories'),
    path('stories/search/', search_stories, name='search_stories'),
    path('stories/<int:pk>/', story_detail, name='story_detail'),
    path('stories/<int:story_pk>/chapters/<int:chapter_pk>/read/', read_chapter, name='read_chapter'),
    path('chapters/<int:pk>/read-detail/', read_chapter_detail, name='read_chapter_detail'),
    path('chuong/<int:pk>/', read_chapter_detail, name='read_chapter_detail_legacy'),
    path('chapters/<int:chapter_pk>/unlock/', unlock_chapter, name='unlock_chapter'),
    path('reading-history/', reading_history, name='reading_history'),
    path('user/upgrade-vip/', upgrade_vip, name='upgrade_vip'),
    path('user/profile/', get_user_profile, name='get_user_profile'),
    path('transactions/', list_transactions, name='list_transactions'),
    path('transactions/topup/', topup_coins, name='topup_coins'),
    path('transactions/<str:tx_id>/', transaction_detail, name='transaction_detail'),
    
    # Admin URLs
    path('admin/stats/', admin_stats, name='admin_stats'),
    path('admin/users/', admin_list_users, name='admin_list_users'),
    path('admin/users/<int:pk>/toggle-status/', admin_toggle_user_status, name='admin_toggle_user_status'),
    path('admin/users/<int:pk>/adjust-coins/', admin_adjust_user_coins, name='admin_adjust_user_coins'),
    path('admin/stories/', admin_create_story, name='admin_create_story'),
    path('admin/stories/<int:pk>/', admin_story_detail, name='admin_story_detail'),
    path('admin/chapters/', admin_list_chapters, name='admin_list_chapters'),
    path('admin/chapters/create/', admin_create_chapter, name='admin_create_chapter'),
    path('admin/chapters/<int:pk>/', admin_chapter_detail, name='admin_chapter_detail'),
    path('admin/chapters/<int:pk>/move/', admin_move_chapter, name='admin_move_chapter'),
    path('admin/transactions/<int:pk>/status/', admin_update_transaction_status, name='admin_update_transaction_status'),
    path('admin/broadcast-notification/', broadcast_notification, name='broadcast_notification'),
    
    # User push token
    path('user/push-token/', save_push_token, name='save_push_token'),
    
    # ViewSets
    path('', include(router.urls)),
]
