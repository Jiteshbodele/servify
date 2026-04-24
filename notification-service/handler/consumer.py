from django.core.management.base import BaseCommand
from kafka import KafkaConsumer
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

TOPICS = ['booking.created', 'booking.status_updated', 'payment.success']


class Command(BaseCommand):
    help = 'Consume Kafka events and send notifications'

    def handle(self, *args, **options):
        from service.notification_service import NotificationService

        consumer = KafkaConsumer(
            *TOPICS,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_deserializer=lambda v: json.loads(v.decode('utf-8')),
            group_id='notification-service',
            auto_offset_reset='earliest',
        )

        self.stdout.write(f"Listening to topics: {TOPICS}")

        handlers = {
            'booking.created':        NotificationService.handle_booking_created,
            'booking.status_updated': NotificationService.handle_booking_status_updated,
            'payment.success':        NotificationService.handle_payment_success,
        }

        for msg in consumer:
            topic   = msg.topic
            payload = msg.value
            self.stdout.write(f"[{topic}] received: {payload}")
            try:
                handler = handlers.get(topic)
                if handler:
                    handler(payload)
            except Exception as e:
                logger.error(f"Error handling [{topic}]: {e}")
