import logging
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from dao.call_dao import CallDAO
from dao.http_dao import get_booking, get_user
from dao.exotel_dao import initiate_masked_call
from dao.models import Call

logger = logging.getLogger(__name__)

VERSION = "v3_new_code"


class CallService:

    @staticmethod
    def initiate(caller_user_id: str, caller_role: str, booking_id: str) -> dict:
        print(f"CALL SERVICE {VERSION} - caller_user_id={caller_user_id} role={caller_role}")

        booking = get_booking(booking_id)
        if not booking:
            raise NotFound('Booking not found.')

        print(f"booking status={booking['status']} seeker={booking['seeker_user_id']} provider={booking['provider_user_id']}")

        if booking['status'] not in ('confirmed', 'in_progress', 'completed'):
            raise ValidationError('Calls are only allowed for active or completed bookings.')

        seeker_id   = str(booking['seeker_user_id'])
        provider_id = str(booking['provider_user_id'])

        print(f"comparing: caller={repr(caller_user_id)} seeker={repr(seeker_id)} match={caller_user_id == seeker_id}")

        if caller_role == 'seeker' and caller_user_id != seeker_id:
            raise PermissionDenied('This is not your booking.')
        if caller_role == 'provider' and caller_user_id != provider_id:
            raise PermissionDenied('This is not your booking.')

        if caller_role == 'seeker':
            callee_id = provider_id
            direction = Call.Direction.SEEKER_TO_PROVIDER
        else:
            callee_id = seeker_id
            direction = Call.Direction.PROVIDER_TO_SEEKER

        caller_data = get_user(caller_user_id)
        callee_data = get_user(callee_id)

        if not caller_data or not callee_data:
            raise ValidationError('Could not retrieve user phone numbers.')

        caller_phone = caller_data.get('phone')
        callee_phone = callee_data.get('phone')

        if not caller_phone or not callee_phone:
            raise ValidationError('Phone number missing for one or both users.')

        result = initiate_masked_call(caller_phone, callee_phone)

        if not result['success']:
            raise ValidationError(f"Call failed: {result.get('error', 'Unknown error')}")

        call = CallDAO.create(
            booking_id=booking_id,
            caller_user_id=caller_user_id,
            callee_user_id=callee_id,
            direction=direction,
            virtual_number=result['virtual_number'],
            exotel_call_sid=result.get('call_sid', ''),
        )

        return {
            **_fmt(call),
            'session_token': result.get('session_token', ''),
            'message': (
                f"Calling you now on {result['virtual_number']}. "
                f"The other party will also see this number — "
                f"your real numbers are never shared."
            ),
        }

    @staticmethod
    def handle_callback(call_sid: str, status: str,
                        duration: int = 0, recording_url: str = '') -> None:
        call = Call.objects.filter(exotel_call_sid=call_sid).first()
        if not call:
            logger.warning(f"Callback for unknown call_sid: {call_sid}")
            return
        status_map = {
            'completed':   'completed',
            'failed':      'failed',
            'busy':        'missed',
            'no-answer':   'missed',
            'canceled':    'failed',
            'in-progress': 'connected',
        }
        mapped = status_map.get(status.lower(), 'failed')
        CallDAO.update_status(
            str(call.id),
            status=mapped,
            duration_sec=duration,
            recording_url=recording_url,
        )

    @staticmethod
    def list_for_booking(booking_id: str) -> list:
        return [_fmt(c) for c in CallDAO.get_by_booking(booking_id)]

    @staticmethod
    def list_for_user(user_id: str) -> list:
        return [_fmt(c) for c in CallDAO.get_by_user(user_id)]


def _fmt(c: Call) -> dict:
    return {
        'id':             str(c.id),
        'booking_id':     str(c.booking_id),
        'direction':      c.direction,
        'status':         c.status,
        'virtual_number': c.virtual_number,
        'duration_sec':   c.duration_sec,
        'initiated_at':   c.initiated_at.isoformat(),
        'ended_at':       c.ended_at.isoformat() if c.ended_at else None,
    }
