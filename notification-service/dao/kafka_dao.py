import json
import logging
import time as time_mod
from kafka import KafkaProducer
from kafka.errors import NoBrokersAvailable
from django.conf import settings

logger    = logging.getLogger(__name__)
_producer = None


def get_producer() -> KafkaProducer:
    global _producer
    if _producer is not None:
        return _producer
    retries = 5
    for attempt in range(retries):
        try:
            _producer = KafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v, default=str).encode(),
                retries=3,
            )
            logger.info("Kafka producer connected.")
            return _producer
        except NoBrokersAvailable:
            wait = 2 ** attempt
            logger.warning(f"Kafka not ready, retrying in {wait}s ({attempt+1}/{retries})")
            time_mod.sleep(wait)
    logger.error("Could not connect to Kafka after retries.")
    return None


def publish(topic: str, payload: dict) -> None:
    try:
        producer = get_producer()
        if producer:
            producer.send(topic, payload)
    except Exception as e:
        logger.error(f"Kafka publish failed [{topic}]: {e}")
