from django.utils import timezone
from dao.models import Notification


class NotificationDAO:

    @staticmethod
    def create(user_id: str, channel: str, subject: str, body: str) -> Notification:
        return Notification.objects.create(
            user_id=user_id, channel=channel, subject=subject, body=body
        )

    @staticmethod
    def mark_sent(notif_id: str) -> None:
        Notification.objects.filter(id=notif_id).update(
            status='sent', sent_at=timezone.now()
        )

    @staticmethod
    def mark_failed(notif_id: str) -> None:
        Notification.objects.filter(id=notif_id).update(status='failed')

    @staticmethod
    def get_by_user(user_id: str):
        return Notification.objects.filter(user_id=user_id).order_by('-created_at')
