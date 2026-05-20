import uuid
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def initiate_masked_call(caller_phone: str, callee_phone: str) -> dict:
    """
    In MOCK_CALLING mode — returns a fake session token for WebRTC.
    In production — calls Exotel API for real masked phone calls.
    """

    if getattr(settings, 'MOCK_CALLING', True):
        # Development mode — no real call, return a session token
        # In a real app the frontend uses this token to connect via WebRTC
        session_token = str(uuid.uuid4()).replace('-', '')[:16].upper()
        logger.info(
            f"[MOCK] Call initiated: {caller_phone} → {callee_phone} "
            f"| Session: {session_token}"
        )
        return {
            'success':        True,
            'call_sid':       f"MOCK-{session_token}",
            'virtual_number': settings.MOCK_VIRTUAL_NUMBER,
            'status':         'initiated',
            'session_token':  session_token,
            'mock':           True,
        }

    # Production mode — real Exotel call
    if not all([settings.EXOTEL_SID, settings.EXOTEL_API_KEY,
                settings.EXOTEL_API_TOKEN, settings.EXOTEL_VIRTUAL_NUMBER]):
        logger.error("Exotel credentials not configured.")
        return {'success': False, 'error': 'Telephony provider not configured.'}

    url = (
        f"https://api.exotel.com/v1/Accounts/{settings.EXOTEL_SID}"
        f"/Calls/connect.json"
    )
    payload = {
        'From':           caller_phone,
        'To':             callee_phone,
        'CallerId':       settings.EXOTEL_VIRTUAL_NUMBER,
        'StatusCallback': settings.EXOTEL_CALLBACK_URL,
        'Record':         'false',
    }
    try:
        resp = requests.post(
            url,
            data=payload,
            auth=(settings.EXOTEL_API_KEY, settings.EXOTEL_API_TOKEN),
            timeout=10,
        )
        data = resp.json()
        if resp.status_code in (200, 201):
            call = data.get('Call', {})
            return {
                'success':        True,
                'call_sid':       call.get('Sid', ''),
                'virtual_number': settings.EXOTEL_VIRTUAL_NUMBER,
                'status':         call.get('Status', 'initiated'),
                'mock':           False,
            }
        logger.error(f"Exotel error: {data}")
        return {'success': False, 'error': str(data)}
    except Exception as e:
        logger.error(f"Exotel request failed: {e}")
        return {'success': False, 'error': str(e)}
