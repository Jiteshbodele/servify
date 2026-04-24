from django.test import TestCase
from unittest.mock import patch, MagicMock
from datetime import date, time, timedelta
from rest_framework.exceptions import ValidationError

from service.booking_service import BookingManager, AvailabilityManager


class TestBookingManagerCreate(TestCase):

    def _make_ps(self, price_override=None):
        ps = MagicMock()
        ps.id          = 'ps-id'
        ps.is_active   = True
        ps.service_id  = 'svc-id'
        ps.price_override = price_override
        ps.provider_user_id = 'prov-id'
        return ps

    @patch('service.booking_service.BookingDAO')
    @patch('service.booking_service.AvailabilityDAO')
    @patch('service.booking_service.ProviderServiceDAO')
    @patch('service.booking_service.get_service')
    @patch('service.booking_service.publish')
    def test_create_booking_success(self, mock_pub, mock_get_svc,
                                     mock_ps_dao, mock_avail_dao, mock_book_dao):
        next_monday = date.today() + timedelta(days=(7 - date.today().weekday()))
        mock_ps_dao.get_by_id.return_value = self._make_ps()
        mock_avail_dao.slot_exists.return_value = True
        mock_book_dao.has_conflict.return_value = False
        mock_get_svc.return_value = {'base_price': 500}

        booking = MagicMock()
        booking.id                     = 'book-id'
        booking.seeker_user_id         = 'seeker-id'
        booking.provider_service_id    = 'ps-id'
        booking.provider_service.provider_user_id = 'prov-id'
        booking.address_id             = 'addr-id'
        booking.booking_date           = next_monday
        booking.booking_time           = time(10, 0)
        booking.status                 = 'pending'
        booking.notes                  = ''
        booking.amount_charged         = 500
        booking.created_at.isoformat.return_value = '2024-01-01T00:00:00'
        mock_book_dao.create.return_value = booking

        result = BookingManager.create(
            seeker_user_id='seeker-id',
            provider_service_id='ps-id',
            address_id='addr-id',
            booking_date=next_monday,
            booking_time=time(10, 0),
        )
        self.assertEqual(result['status'], 'pending')
        mock_pub.assert_called_once()

    def test_create_booking_past_date_raises(self):
        with self.assertRaises(ValidationError):
            BookingManager.create(
                seeker_user_id='seeker-id',
                provider_service_id='ps-id',
                address_id='addr-id',
                booking_date=date(2020, 1, 1),
                booking_time=time(10, 0),
            )

    @patch('service.booking_service.ProviderServiceDAO')
    def test_create_booking_inactive_service_raises(self, mock_ps_dao):
        ps = MagicMock()
        ps.is_active = False
        mock_ps_dao.get_by_id.return_value = ps
        with self.assertRaises(Exception):
            BookingManager.create(
                seeker_user_id='seeker-id',
                provider_service_id='ps-id',
                address_id='addr-id',
                booking_date=date.today() + timedelta(days=7),
                booking_time=time(10, 0),
            )

    @patch('service.booking_service.BookingDAO')
    @patch('service.booking_service.AvailabilityDAO')
    @patch('service.booking_service.ProviderServiceDAO')
    def test_double_booking_raises(self, mock_ps_dao, mock_avail_dao, mock_book_dao):
        mock_ps_dao.get_by_id.return_value = self._make_ps()
        mock_avail_dao.slot_exists.return_value = True
        mock_book_dao.has_conflict.return_value = True
        with self.assertRaises(ValidationError):
            BookingManager.create(
                seeker_user_id='seeker-id',
                provider_service_id='ps-id',
                address_id='addr-id',
                booking_date=date.today() + timedelta(days=7),
                booking_time=time(10, 0),
            )


class TestBookingStatusTransitions(TestCase):

    def _make_booking(self, current_status='pending'):
        b = MagicMock()
        b.id     = 'book-id'
        b.status = current_status
        b.seeker_user_id = 'seeker-id'
        b.provider_service.provider_user_id = 'prov-id'
        b.created_at.isoformat.return_value = '2024-01-01T00:00:00'
        return b

    @patch('service.booking_service.publish')
    @patch('service.booking_service.BookingDAO')
    def test_provider_can_confirm(self, mock_dao, mock_pub):
        mock_dao.get_by_id.return_value = self._make_booking('pending')
        mock_dao.update_status.return_value = True
        result = BookingManager.update_status('book-id', 'confirmed', 'prov-id', 'provider')
        self.assertEqual(result['status'], 'confirmed')

    @patch('service.booking_service.BookingDAO')
    def test_seeker_cannot_confirm(self, mock_dao):
        mock_dao.get_by_id.return_value = self._make_booking('pending')
        with self.assertRaises(ValidationError):
            BookingManager.update_status('book-id', 'confirmed', 'seeker-id', 'seeker')

    @patch('service.booking_service.publish')
    @patch('service.booking_service.BookingDAO')
    def test_seeker_can_cancel_pending(self, mock_dao, mock_pub):
        mock_dao.get_by_id.return_value = self._make_booking('pending')
        mock_dao.update_status.return_value = True
        result = BookingManager.update_status('book-id', 'cancelled', 'seeker-id', 'seeker')
        self.assertEqual(result['status'], 'cancelled')
