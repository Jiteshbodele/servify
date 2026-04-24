from django.test import TestCase
from datetime import date, timedelta
from handler.serializers import (
    CreateBookingSerializer, AvailabilitySerializer,
    UpdateStatusSerializer, AvailableSlotsQuerySerializer,
)


class TestCreateBookingSerializer(TestCase):

    def _valid(self, **overrides):
        data = {
            'provider_service_id': '11111111-1111-1111-1111-111111111111',
            'address_id':          '22222222-2222-2222-2222-222222222222',
            'booking_date':        str(date.today() + timedelta(days=3)),
            'booking_time':        '10:00:00',
        }
        data.update(overrides)
        return data

    def test_valid(self):
        s = CreateBookingSerializer(data=self._valid())
        self.assertTrue(s.is_valid(), s.errors)

    def test_past_date_rejected(self):
        s = CreateBookingSerializer(data=self._valid(booking_date='2020-01-01'))
        self.assertFalse(s.is_valid())
        self.assertIn('booking_date', s.errors)

    def test_invalid_uuid_rejected(self):
        s = CreateBookingSerializer(data=self._valid(provider_service_id='not-a-uuid'))
        self.assertFalse(s.is_valid())
        self.assertIn('provider_service_id', s.errors)


class TestAvailabilitySerializer(TestCase):

    def test_slot_end_before_start_rejected(self):
        s = AvailabilitySerializer(data={
            'provider_service_id': '11111111-1111-1111-1111-111111111111',
            'day_of_week':         1,
            'slot_start':          '14:00:00',
            'slot_end':            '10:00:00',
        })
        self.assertFalse(s.is_valid())

    def test_invalid_day_of_week_rejected(self):
        s = AvailabilitySerializer(data={
            'provider_service_id': '11111111-1111-1111-1111-111111111111',
            'day_of_week':         9,
            'slot_start':          '09:00:00',
            'slot_end':            '17:00:00',
        })
        self.assertFalse(s.is_valid())
        self.assertIn('day_of_week', s.errors)

    def test_valid_slot(self):
        s = AvailabilitySerializer(data={
            'provider_service_id': '11111111-1111-1111-1111-111111111111',
            'day_of_week':         1,
            'slot_start':          '09:00:00',
            'slot_end':            '17:00:00',
        })
        self.assertTrue(s.is_valid(), s.errors)


class TestUpdateStatusSerializer(TestCase):

    def test_valid_statuses(self):
        for s in ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']:
            ser = UpdateStatusSerializer(data={'status': s})
            self.assertTrue(ser.is_valid(), f'{s} should be valid')

    def test_invalid_status(self):
        s = UpdateStatusSerializer(data={'status': 'invalid_status'})
        self.assertFalse(s.is_valid())
