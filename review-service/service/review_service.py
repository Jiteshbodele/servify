from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied

from dao.review_dao import ReviewDAO
from dao.http_dao import get_booking, update_provider_rating, update_seeker_rating


class ReviewService:

    @staticmethod
    def create(reviewer_id: str, reviewer_role: str, booking_id: str,
               rating: int, comment: str = '') -> dict:

        booking = get_booking(booking_id)
        if not booking:
            raise NotFound('Booking not found.')
        if booking['status'] != 'completed':
            raise ValidationError('Can only review a completed booking.')

        if reviewer_role == 'seeker':
            if str(booking['seeker_user_id']) != str(reviewer_id):
                raise PermissionDenied('This is not your booking.')
            target_id   = str(booking['provider_user_id'])
            target_type = 'provider'
        elif reviewer_role == 'provider':
            if str(booking['provider_user_id']) != str(reviewer_id):
                raise PermissionDenied('This is not your booking.')
            target_id   = str(booking['seeker_user_id'])
            target_type = 'seeker'
        else:
            raise PermissionDenied('Only seekers and providers can review.')

        if ReviewDAO.already_reviewed(booking_id, reviewer_id, target_type):
            raise ValidationError('You have already reviewed this booking.')

        review = ReviewDAO.create(
            booking_id=booking_id, reviewer_id=reviewer_id,
            target_id=target_id, target_type=target_type,
            rating=rating, comment=comment,
        )

        avg = ReviewDAO.get_avg_rating(target_id, target_type)
        if target_type == 'provider':
            update_provider_rating(target_id, avg)
        else:
            update_seeker_rating(target_id, avg)

        return _fmt(review)

    @staticmethod
    def list_for_target(target_id: str, target_type: str) -> list:
        return [_fmt(r) for r in ReviewDAO.get_by_target(target_id, target_type)]


def _fmt(r) -> dict:
    return {
        'id':          str(r.id),
        'booking_id':  str(r.booking_id),
        'reviewer_id': str(r.reviewer_id),
        'target_id':   str(r.target_id),
        'target_type': r.target_type,
        'rating':      r.rating,
        'comment':     r.comment,
        'created_at':  r.created_at.isoformat(),
    }
