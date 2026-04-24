import logging
from django.core.mail import send_mail
from django.conf import settings

from dao.notification_dao import NotificationDAO

logger = logging.getLogger(__name__)


class NotificationService:

    @staticmethod
    def send_email(user_id: str, to_email: str, subject: str, body: str) -> dict:
        notif = NotificationDAO.create(
            user_id=user_id, channel='email', subject=subject, body=body
        )
        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            NotificationDAO.mark_sent(str(notif.id))
            notif.status = 'sent'
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            NotificationDAO.mark_failed(str(notif.id))
            notif.status = 'failed'
        return _fmt(notif)

    @staticmethod
    def handle_booking_created(event: dict) -> None:
        NotificationService.send_email(
            user_id=event['seeker_user_id'],
            to_email=event.get('seeker_email', ''),
            subject=f"Booking Request Placed",
            body=(
                f"Hi,\n\nYour booking has been placed for "
                f"{event.get('booking_date')} at {event.get('booking_time')}.\n"
                f"Amount: {event.get('amount_charged')}\n\nThank you!"
            ),
        )

    @staticmethod
    def handle_booking_status_updated(event: dict) -> None:
        status_msg = {
            'confirmed':   'has been confirmed by the provider',
            'in_progress': 'is now in progress',
            'completed':   'has been completed',
            'cancelled':   'has been cancelled',
        }.get(event.get('new_status', ''), f"status updated to {event.get('new_status')}")

        NotificationService.send_email(
            user_id=event['seeker_user_id'],
            to_email=event.get('seeker_email', ''),
            subject=f"Booking Update",
            body=f"Hi,\n\nYour booking {status_msg}.\n\nThank you!",
        )

    @staticmethod
    def handle_payment_success(event: dict) -> None:
        NotificationService.send_email(
            user_id=event['seeker_user_id'],
            to_email=event.get('seeker_email', ''),
            subject="Payment Successful",
            body=(
                f"Hi,\n\nYour payment of {event.get('amount')} INR was successful.\n"
                f"Reference: {event.get('transaction_id')}\n\nThank you!"
            ),
        )

    @staticmethod
    def list_for_user(user_id: str) -> list:
        return [_fmt(n) for n in NotificationDAO.get_by_user(user_id)]


def _fmt(n) -> dict:
    return {
        'id':         str(n.id),
        'channel':    n.channel,
        'subject':    n.subject,
        'body':       n.body,
        'status':     n.status,
        'sent_at':    n.sent_at.isoformat() if n.sent_at else None,
        'created_at': n.created_at.isoformat(),
    }
