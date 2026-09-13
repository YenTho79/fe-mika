from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review, Sach

def update_sach_rating(sach):
    # Only average approved reviews, if status matters. 
    # Or just all reviews if you want
    avg_rating = Review.objects.filter(sach=sach, status='approved').aggregate(Avg('rating'))['rating__avg']
    if avg_rating is not None:
        sach.diem_danh_gia = round(avg_rating, 2)
    else:
        sach.diem_danh_gia = 0
    sach.save(update_fields=['diem_danh_gia'])

@receiver(post_save, sender=Review)
def review_post_save(sender, instance, **kwargs):
    if instance.sach:
        update_sach_rating(instance.sach)

@receiver(post_delete, sender=Review)
def review_post_delete(sender, instance, **kwargs):
    if instance.sach:
        update_sach_rating(instance.sach)
