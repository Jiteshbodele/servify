import httpx
import logging
from dao.es_dao import search, index_document, delete_document
from django.conf import settings

logger = logging.getLogger(__name__)

INTERNAL_HEADERS = {'X-Internal-Token': settings.INTERNAL_SECRET}


def _fetch(url: str, headers: dict = None) -> dict:
    try:
        r = httpx.get(url, headers=headers or {}, timeout=5)
        return r.json() if r.status_code == 200 else {}
    except Exception as e:
        logger.warning(f"HTTP fetch failed {url}: {e}")
        return {}


class SearchService:

    @staticmethod
    def search_providers(**kwargs) -> dict:
        return search(**kwargs)

    @staticmethod
    def index(event: dict) -> None:
        doc_id = event.get('provider_service_id') or event.get('id')
        if not doc_id:
            return

        # Enrich with catalog data
        service_id = event.get('service_id', '')
        catalog = _fetch(
            f"{settings.CATALOG_SERVICE_URL}/api/catalog/services/{service_id}/"
        ) if service_id else {}

        category     = catalog.get('category', {})
        service_name = catalog.get('name', event.get('service_name', ''))
        description  = catalog.get('description', event.get('description', ''))
        category_name = category.get('name', event.get('category_name', ''))
        base_price   = catalog.get('base_price', 0)

        # Enrich with provider data
        provider_user_id = event.get('provider_user_id', '')
        provider = _fetch(
            f"{settings.USER_SERVICE_URL}/internal/users/{provider_user_id}/",
            headers=INTERNAL_HEADERS,
        ) if provider_user_id else {}

        provider_name = provider.get('name', event.get('provider_name', ''))
        avg_rating    = provider.get('avg_rating', event.get('avg_rating', 0.0))

        effective_price = event.get('price_override') or event.get('effective_price') or base_price

        index_document(doc_id, {
            'id':               doc_id,
            'provider_user_id': provider_user_id,
            'service_name':     service_name,
            'category_name':    category_name,
            'provider_name':    provider_name,
            'description':      description,
            'effective_price':  float(effective_price or 0),
            'avg_rating':       float(avg_rating or 0),
            'city': event.get('city', '') or _get_provider_city(provider_user_id),
            'is_active':        event.get('is_active', True),
            'experience':       event.get('experience', ''),
        })

    @staticmethod
    def remove(provider_service_id: str) -> None:
        delete_document(provider_service_id)


def _get_provider_city(provider_user_id: str) -> str:
    try:
        r = httpx.get(
            f"{settings.USER_SERVICE_URL}/internal/users/{provider_user_id}/addresses/",
            headers=INTERNAL_HEADERS,
            timeout=5,
        )
        if r.status_code == 200:
            addresses = r.json()
            default = next((a for a in addresses if a.get('is_default')), None)
            if default:
                return default.get('city', '')
            if addresses:
                return addresses[0].get('city', '')
    except Exception:
        pass
    return ''
