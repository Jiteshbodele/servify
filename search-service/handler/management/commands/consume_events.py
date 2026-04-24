from django.core.management.base import BaseCommand
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
from django.conf import settings
import json, logging, time

logger = logging.getLogger(__name__)


def wait_for_es():
    from dao.es_dao import create_index_if_not_exists
    for attempt in range(10):
        try:
            create_index_if_not_exists()
            logger.info("Elasticsearch ready.")
            return
        except Exception as e:
            logger.warning(f"Waiting for Elasticsearch... ({attempt+1}/10): {e}")
            time.sleep(3)
    logger.error("Elasticsearch not available after retries.")


def get_consumer():
    topics = ['provider_service.created', 'provider_service.updated', 'provider_service.deleted']
    for attempt in range(10):
        try:
            return KafkaConsumer(
                *topics,
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_deserializer=lambda v: json.loads(v.decode('utf-8')),
                group_id='search-service',
                auto_offset_reset='earliest',
            )
        except NoBrokersAvailable:
            logger.warning(f"Kafka not ready, retrying ({attempt+1}/10)...")
            time.sleep(3)
    raise RuntimeError("Could not connect to Kafka")


class Command(BaseCommand):
    help = 'Sync Elasticsearch index from Kafka events'

    def handle(self, *args, **options):
        from service.search_service import SearchService

        wait_for_es()
        consumer = get_consumer()
        self.stdout.write("Search consumer started.")

        for msg in consumer:
            topic   = msg.topic
            payload = msg.value
            self.stdout.write(f"[{topic}] {payload}")
            try:
                if topic in ('provider_service.created', 'provider_service.updated'):
                    SearchService.index(payload)
                elif topic == 'provider_service.deleted':
                    SearchService.remove(payload.get('provider_service_id'))
            except Exception as e:
                logger.error(f"Index error [{topic}]: {e}")
