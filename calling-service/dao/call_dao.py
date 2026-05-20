from django.utils import timezone
from dao.models import Call


class CallDAO:

    @staticmethod
    def create(booking_id, caller_user_id, callee_user_id,
               direction, virtual_number, exotel_call_sid='') -> Call:
        return Call.objects.create(
            booking_id=booking_id,
            caller_user_id=caller_user_id,
            callee_user_id=callee_user_id,
            direction=direction,
            virtual_number=virtual_number,
            exotel_call_sid=exotel_call_sid,
        )

    @staticmethod
    def get_by_id(call_id) -> Call | None:
        return Call.objects.filter(id=call_id).first()

    @staticmethod
    def get_by_booking(booking_id):
        return Call.objects.filter(booking_id=booking_id)

    @staticmethod
    def get_by_user(user_id):
        from django.db.models import Q
        return Call.objects.filter(
            Q(caller_user_id=user_id) | Q(callee_user_id=user_id)
        )

    @staticmethod
    def update_status(call_id, status, duration_sec=0,
                      recording_url='', exotel_call_sid='') -> None:
        updates = {'status': status}
        if duration_sec:
            updates['duration_sec'] = duration_sec
        if recording_url:
            updates['recording_url'] = recording_url
        if exotel_call_sid:
            updates['exotel_call_sid'] = exotel_call_sid
        if status in ('completed', 'failed', 'missed'):
            updates['ended_at'] = timezone.now()
        Call.objects.filter(id=call_id).update(**updates)
