from django.db.models import Avg
from dao.models import Review


class ReviewDAO:

    @staticmethod
    def already_reviewed(booking_id: str, reviewer_id: str, target_type: str) -> bool:
        return Review.objects.filter(
            booking_id=booking_id,
            reviewer_id=reviewer_id,
            target_type=target_type,
        ).exists()

    @staticmethod
    def create(booking_id: str, reviewer_id: str, target_id: str,
               target_type: str, rating: int, comment: str = '') -> Review:
        return Review.objects.create(
            booking_id=booking_id, reviewer_id=reviewer_id,
            target_id=target_id, target_type=target_type,
            rating=rating, comment=comment,
        )

    @staticmethod
    def get_by_target(target_id: str, target_type: str):
        return Review.objects.filter(
            target_id=target_id, target_type=target_type
        ).order_by('-created_at')

    @staticmethod
    def get_avg_rating(target_id: str, target_type: str) -> float:
        result = Review.objects.filter(
            target_id=target_id, target_type=target_type
        ).aggregate(avg=Avg('rating'))
        return round(result['avg'] or 0, 2)
