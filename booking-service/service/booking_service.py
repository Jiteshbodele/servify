from datetime import date, time
from django.db import transaction
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied

from dao.booking_dao import ProviderServiceDAO, AvailabilityDAO, BookingDAO
from dao.kafka_dao import publish
from dao.http_dao import get_service


ALLOWED_TRANSITIONS = {
    'seeker':   {'pending': ['cancelled']},
    'provider': {
        'pending':     ['confirmed', 'cancelled'],
        'confirmed':   ['in_progress'],
        'in_progress': ['completed'],
    },
}


class ProviderServiceManager:

    @staticmethod
    def list_all(service_id=None):
        return [_fmt_ps(ps) for ps in ProviderServiceDAO.get_all(service_id=service_id)]

    @staticmethod
    def list_mine(provider_user_id):
        return [_fmt_ps(ps) for ps in ProviderServiceDAO.get_by_provider(provider_user_id)]

    @staticmethod
    def create(provider_user_id, service_id, price_override=None, experience=''):
        catalog_svc = get_service(service_id)
        if not catalog_svc:
            raise ValidationError({'service_id': 'Service not found in catalog.'})
        if ProviderServiceDAO.exists(provider_user_id, service_id):
            raise ValidationError('You already offer this service.')
        ps = ProviderServiceDAO.create(
            provider_user_id=provider_user_id, service_id=service_id,
            price_override=price_override, experience=experience,
        )
        publish('provider_service.created', {
            'provider_service_id': str(ps.id),
            'provider_user_id':    str(provider_user_id),
            'service_id':          str(service_id),
            'service_name':        catalog_svc.get('name', ''),
            'effective_price':     float(price_override or catalog_svc.get('base_price', 0)),
        })
        return _fmt_ps(ps)


class AvailabilityManager:

    @staticmethod
    def get_available_slots(provider_service_id, for_date):
        ps = ProviderServiceDAO.get_by_id(provider_service_id)
        if not ps:
            raise NotFound('Provider service not found.')
        day    = for_date.weekday()
        slots  = AvailabilityDAO.get_slots(provider_service_id, day)
        booked = BookingDAO.get_booked_times(provider_service_id, for_date)
        return [
            {
                'slot_start': str(s.slot_start),
                'slot_end':   str(s.slot_end),
                'available':  s.slot_start not in booked,
            }
            for s in slots
        ]

    @staticmethod
    def add_slot(provider_service_id, provider_user_id,
                 day_of_week, slot_start, slot_end, is_recurring=True):
        ps = ProviderServiceDAO.get_by_id(provider_service_id)
        if not ps:
            raise NotFound('Provider service not found.')
        if str(ps.provider_user_id) != str(provider_user_id):
            raise PermissionDenied('You can only add slots to your own services.')

        from dao.booking_dao import AvailabilityOverlapDAO
        if AvailabilityOverlapDAO.has_overlap(provider_service_id, day_of_week, slot_start, slot_end):
            raise ValidationError('This slot overlaps with an existing availability slot.')

        slot = AvailabilityDAO.create(
            provider_service_id=provider_service_id,
            day_of_week=day_of_week,
            slot_start=slot_start,
            slot_end=slot_end,
            is_recurring=is_recurring,
        )
        return _fmt_slot(slot)


class BookingManager:

    @staticmethod
    @transaction.atomic
    def create(seeker_user_id, provider_service_id, address_id,
               booking_date, booking_time, notes=''):
        if booking_date < date.today():
            raise ValidationError({'booking_date': 'Cannot book a past date.'})

        ps = ProviderServiceDAO.get_by_id(provider_service_id)
        if not ps or not ps.is_active:
            raise NotFound('Provider service not found or inactive.')

        day = booking_date.weekday()
        slot_exists = AvailabilityDAO.slot_exists(
            provider_service_id, day, booking_time, booking_time
        )
        if not slot_exists:
            raise ValidationError('No availability slot found for this time.')

        if BookingDAO.has_conflict(provider_service_id, booking_date, booking_time):
            raise ValidationError('This time slot is already booked.')

        catalog_svc    = get_service(str(ps.service_id))
        base_price     = float(catalog_svc['base_price']) if catalog_svc else 0
        amount_charged = float(ps.price_override) if ps.price_override else base_price

        booking = BookingDAO.create(
            seeker_user_id=seeker_user_id,
            provider_service_id=provider_service_id,
            address_id=address_id,
            booking_date=booking_date,
            booking_time=booking_time,
            amount_charged=amount_charged,
            notes=notes,
        )

        publish('booking.created', {
            'booking_id':       str(booking.id),
            'seeker_user_id':   str(seeker_user_id),
            'provider_user_id': str(ps.provider_user_id),
            'service_id':       str(ps.service_id),
            'booking_date':     str(booking_date),
            'booking_time':     str(booking_time),
            'amount_charged':   amount_charged,
        })
        return _fmt_booking(booking)

    @staticmethod
    def list_mine(user_id, role, page=1, page_size=20):
        from utils.pagination import paginate
        if role == 'seeker':
            qs = BookingDAO.get_by_seeker(user_id)
        else:
            qs = BookingDAO.get_by_provider(user_id)
        result = paginate(qs, page, page_size)
        result['results'] = [_fmt_booking(b) for b in result['results']]
        return result

    @staticmethod
    def get(booking_id):
        b = BookingDAO.get_by_id(booking_id)
        if not b:
            raise NotFound('Booking not found.')
        return _fmt_booking(b)

    @staticmethod
    def update_status(booking_id, new_status, user_id, role):
        booking = BookingDAO.get_by_id(booking_id)
        if not booking:
            raise NotFound('Booking not found.')

        if role != 'admin':
            allowed = ALLOWED_TRANSITIONS.get(role, {}).get(booking.status, [])
            if new_status not in allowed:
                raise ValidationError(
                    f"Cannot transition from '{booking.status}' to '{new_status}'."
                )

        BookingDAO.update_status(booking_id, new_status)
        booking.status = new_status

        publish('booking.status_updated', {
            'booking_id':       str(booking.id),
            'seeker_user_id':   str(booking.seeker_user_id),
            'provider_user_id': str(booking.provider_service.provider_user_id),
            'new_status':       new_status,
        })
        return _fmt_booking(booking)


def _fmt_ps(ps):
    return {
        'id':               str(ps.id),
        'provider_user_id': str(ps.provider_user_id),
        'service_id':       str(ps.service_id),
        'price_override':   float(ps.price_override) if ps.price_override else None,
        'experience':       ps.experience,
        'is_active':        ps.is_active,
        'slots':            [_fmt_slot(s) for s in ps.slots.all()],
    }


def _fmt_slot(s):
    return {
        'id':           str(s.id),
        'day_of_week':  s.day_of_week,
        'slot_start':   str(s.slot_start),
        'slot_end':     str(s.slot_end),
        'is_recurring': s.is_recurring,
    }


def _fmt_booking(b):
    return {
        'id':                  str(b.id),
        'seeker_user_id':      str(b.seeker_user_id),
        'provider_service_id': str(b.provider_service_id),
        'provider_user_id':    str(b.provider_service.provider_user_id),
        'address_id':          str(b.address_id),
        'booking_date':        str(b.booking_date),
        'booking_time':        str(b.booking_time),
        'status':              b.status,
        'notes':               b.notes,
        'amount_charged':      float(b.amount_charged),
        'created_at':          b.created_at.isoformat(),
    }
