import logging
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied

from dao.call_dao import CallDAO
from dao.http_dao import get_booking, get_user
from dao.exotel_dao import initiate_masked_call
from dao.models import Call

logger = logging.getLogger(__name__)


class CallService:

    @staticmethod
    def initiate(caller_user_id: str, caller_role: str, booking_id: str) -> dict:
        booking = get_booking(booking_id)
        if not booking:
            raise NotFound('Booking not found.')

        if booking['status'] not in ('confirmed', 'in_progress'):
            raise ValidationError(
                'Calls are only allowed for confirmed or in-progress bookings.'
            )

        seeker_id   = str(booking['seeker_user_id'])
        provider_id = str(booking['provider_user_id'])

        # Verify caller is part of this booking
        if caller_role == 'seeker' and caller_user_id != seeker_id:
            raise PermissionDenied('This is not your booking.')
        if caller_role == 'provider' and caller_user_id != provider_id:
            raise PermissionDenied('This is not your booking.')

        # Determine who is being called
        if caller_role == 'seeker':
            callee_id = provider_id
            direction = Call.Direction.SEEKER_TO_PROVIDER
        else:
            callee_id = seeker_id
            direction = Call.Direction.PROVIDER_TO_SEEKER

        # Fetch real phone numbers from user-service
        caller_data = get_user(caller_user_id)
        callee_data = get_user(callee_id)

        if not caller_data or not callee_data:
            raise ValidationError('Could not retrieve user phone numbers.')

        caller_phone = caller_data.get('phone')
        callee_phone = callee_data.get('phone')

        if not caller_phone or not callee_phone:
            raise ValidationError('Phone number missing for one or both users.')

        # Initiate masked call via Exotel
        result = initiate_masked_call(caller_phone, callee_phone)

        if not result['success']:
            raise ValidationError(f"Call failed: {result.get('error', 'Unknown error')}")

        # Save call record
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
            'message': (
                f"Calling you now on {result['virtual_number']}. "
                f"The other party will also see this number — "
                f"your real numbers are never shared."
            ),
        }

    @staticmethod
    def handle_callback(call_sid: str, status: str,
                        duration: int = 0, recording_url: str = '') -> None:
        """Called by Exotel webhook when call status changes."""
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
        # real numbers are NEVER included in the response
    }
# Patch _fmt to include session_token when present
_original_fmt = _fmt

def _fmt(c) -> dict:
    data = _original_fmt(c)
    if hasattr(c, '_session_token'):
        data['session_token'] = c._session_token
    return data
