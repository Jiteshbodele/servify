from django.test import TestCase
from unittest.mock import patch, MagicMock
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound

from service.review_service import ReviewService


class TestReviewService(TestCase):

    def _completed_booking(self, seeker_id='seeker-id', provider_id='provider-id'):
        return {
            'id':               'book-id',
            'status':           'completed',
            'seeker_user_id':   seeker_id,
            'provider_user_id': provider_id,
        }

    @patch('service.review_service.update_provider_rating')
    @patch('service.review_service.ReviewDAO')
    @patch('service.review_service.get_booking')
    def test_seeker_can_review_provider(self, mock_get, mock_dao, mock_rating):
        mock_get.return_value = self._completed_booking()
        mock_dao.already_reviewed.return_value = False
        review = MagicMock()
        review.id          = 'rev-id'
        review.booking_id  = 'book-id'
        review.reviewer_id = 'seeker-id'
        review.target_id   = 'provider-id'
        review.target_type = 'provider'
        review.rating      = 5
        review.comment     = 'Great!'
        review.created_at.isoformat.return_value = '2024-01-01'
        mock_dao.create.return_value = review
        mock_dao.get_avg_rating.return_value = 4.5

        result = ReviewService.create(
            reviewer_id='seeker-id', reviewer_role='seeker',
            booking_id='book-id', rating=5, comment='Great!',
        )
        self.assertEqual(result['rating'], 5)
        mock_rating.assert_called_once_with('provider-id', 4.5)

    @patch('service.review_service.get_booking')
    def test_pending_booking_rejected(self, mock_get):
        mock_get.return_value = {
            'id': 'book-id', 'status': 'pending',
            'seeker_user_id': 'seeker-id', 'provider_user_id': 'prov-id',
        }
        with self.assertRaises(ValidationError):
            ReviewService.create(
                reviewer_id='seeker-id', reviewer_role='seeker',
                booking_id='book-id', rating=4,
            )

    @patch('service.review_service.get_booking')
    def test_wrong_seeker_rejected(self, mock_get):
        mock_get.return_value = self._completed_booking(seeker_id='other-seeker')
        with self.assertRaises(PermissionDenied):
            ReviewService.create(
                reviewer_id='seeker-id', reviewer_role='seeker',
                booking_id='book-id', rating=4,
            )

    @patch('service.review_service.get_booking')
    def test_booking_not_found_raises(self, mock_get):
        mock_get.return_value = None
        with self.assertRaises(NotFound):
            ReviewService.create(
                reviewer_id='seeker-id', reviewer_role='seeker',
                booking_id='book-id', rating=4,
            )

    @patch('service.review_service.ReviewDAO')
    @patch('service.review_service.get_booking')
    def test_duplicate_review_rejected(self, mock_get, mock_dao):
        mock_get.return_value = self._completed_booking()
        mock_dao.already_reviewed.return_value = True
        with self.assertRaises(ValidationError):
            ReviewService.create(
                reviewer_id='seeker-id', reviewer_role='seeker',
                booking_id='book-id', rating=4,
            )
