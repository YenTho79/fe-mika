from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='nguoi_dung.ho_ten', read_only=True)
    user_avatar = serializers.CharField(source='nguoi_dung.avatar_url', read_only=True)  # assuming avatar_url field exists
    book_title = serializers.CharField(source='sach.tieu_de', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'nguoi_dung', 'sach', 'rating', 'content', 'status', 'created_at', 'updated_at', 'user_name', 'user_avatar', 'book_title']
        read_only_fields = ['nguoi_dung', 'sach']
