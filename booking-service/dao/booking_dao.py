from django.db import models
from datetime import date, time
from dao.models import ProviderService, Availability, Booking


class ProviderServiceDAO:

    @staticmethod
    def get_all(service_id: str = None):
        qs = ProviderService.objects.filter(is_active=True).prefetch_related('slots')
        if service_id:
            qs = qs.filter(service_id=service_id)
        return qs

    @staticmethod
    def get_by_id(ps_id: str):
        return ProviderService.objects.prefetch_related('slots').filter(id=ps_id).first()

    @staticmethod
    def get_by_provider(provider_user_id: str):
        return ProviderService.objects.filter(provider_user_id=provider_user_id).prefetch_related('slots')

    @staticmethod
    def exists(provider_user_id: str, service_id: str) -> bool:
        return ProviderService.objects.filter(
            provider_user_id=provider_user_id, service_id=service_id
        ).exists()

    @staticmethod
    def create(provider_user_id: str, service_id: str,
               price_override=None, experience: str = '') -> ProviderService:
        return ProviderService.objects.create(
            provider_user_id=provider_user_id, service_id=service_id,
            price_override=price_override, experience=experience,
        )


class AvailabilityDAO:

    @staticmethod
    def get_slots(provider_service_id: str, day_of_week: int):
        return Availability.objects.filter(
            provider_service_id=provider_service_id, day_of_week=day_of_week
        )

    @staticmethod
    def slot_exists(provider_service_id: str, day_of_week: int,
                    slot_start: time, slot_end: time) -> bool:
        return Availability.objects.filter(
            provider_service_id=provider_service_id,
            day_of_week=day_of_week,
            slot_start__lte=slot_start,
            slot_end__gt=slot_start,
        ).exists()

    @staticmethod
    def create(provider_service_id: str, day_of_week: int,
               slot_start: time, slot_end: time,
               is_recurring: bool = True) -> Availability:
        return Availability.objects.create(
            provider_service_id=provider_service_id,
            day_of_week=day_of_week, slot_start=slot_start,
            slot_end=slot_end, is_recurring=is_recurring,
        )

    @staticmethod
    def delete(slot_id: str, provider_service_id: str) -> bool:
        deleted, _ = Availability.objects.filter(
            id=slot_id, provider_service_id=provider_service_id
        ).delete()
        return deleted > 0


class BookingDAO:

    @staticmethod
    def has_conflict(provider_service_id: str, booking_date: date,
                     booking_time: time) -> bool:
        return Booking.objects.filter(
            provider_service_id=provider_service_id,
            booking_date=booking_date,
            booking_time=booking_time,
            status__in=['pending', 'confirmed', 'in_progress'],
        ).exists()

    @staticmethod
    def get_booked_times(provider_service_id: str, booking_date: date) -> set:
        return set(
            Booking.objects.filter(
                provider_service_id=provider_service_id,
                booking_date=booking_date,
                status__in=['pending', 'confirmed', 'in_progress'],
            ).values_list('booking_time', flat=True)
        )

    @staticmethod
    def create(seeker_user_id: str, provider_service_id: str, address_id: str,
               booking_date: date, booking_time: time,
               amount_charged: float, notes: str = '') -> Booking:
        return Booking.objects.create(
            seeker_user_id=seeker_user_id,
            provider_service_id=provider_service_id,
            address_id=address_id,
            booking_date=booking_date,
            booking_time=booking_time,
            amount_charged=amount_charged,
            notes=notes,
        )

    @staticmethod
    def get_by_id(booking_id: str):
        return Booking.objects.select_related('provider_service').filter(id=booking_id).first()

    @staticmethod
    def get_by_seeker(seeker_user_id: str):
        return Booking.objects.select_related('provider_service').filter(
            seeker_user_id=seeker_user_id
        ).order_by('-created_at')

    @staticmethod
    def get_by_provider(provider_user_id: str):
        return Booking.objects.select_related('provider_service').filter(
            provider_service__provider_user_id=provider_user_id
        ).order_by('-created_at')

    @staticmethod
    def update_status(booking_id: str, status: str) -> bool:
        updated = Booking.objects.filter(id=booking_id).update(status=status)
        return updated > 0


class AvailabilityOverlapDAO:

    @staticmethod
    def has_overlap(provider_service_id: str, day_of_week: int,
                    slot_start, slot_end) -> bool:
        """Check if a new slot overlaps with any existing slot for the same day."""
        return Availability.objects.filter(
            provider_service_id=provider_service_id,
            day_of_week=day_of_week,
        ).filter(
            models.Q(slot_start__lt=slot_end) & models.Q(slot_end__gt=slot_start)
        ).exists()
