from elasticsearch import Elasticsearch
from django.conf import settings

_client = None


def get_client() -> Elasticsearch:
    global _client
    if _client is None:
        _client = Elasticsearch(settings.ELASTICSEARCH_URL)
    return _client


INDEX = 'provider_services'


def create_index_if_not_exists() -> None:
    es = get_client()
    if not es.indices.exists(index=INDEX):
        es.indices.create(index=INDEX, body={
            'mappings': {
                'properties': {
                    'provider_service_id': {'type': 'keyword'},
                    'service_name':        {'type': 'text', 'analyzer': 'english'},
                    'category_name':       {'type': 'keyword'},
                    'provider_name':       {'type': 'text'},
                    'description':         {'type': 'text', 'analyzer': 'english'},
                    'effective_price':     {'type': 'float'},
                    'avg_rating':          {'type': 'float'},
                    'city':                {'type': 'keyword'},
                    'is_active':           {'type': 'boolean'},
                }
            }
        })


def index_document(doc_id: str, body: dict) -> None:
    get_client().index(index=INDEX, id=doc_id, body=body)


def delete_document(doc_id: str) -> None:
    try:
        get_client().delete(index=INDEX, id=doc_id)
    except Exception:
        pass


def search(query: str = None, category: str = None, city: str = None,
           min_price: float = None, max_price: float = None,
           min_rating: float = None, page: int = 1,
           page_size: int = 20) -> dict:

    must   = [{'term': {'is_active': True}}]
    filter_ = []

    if query:
        must.append({
            'multi_match': {
                'query':     query,
                'fields':    ['service_name^3', 'description', 'provider_name', 'category_name^2'],
                'fuzziness': 'AUTO',
            }
        })
    if category:
        filter_.append({'term': {'category_name': category}})
    if city:
        filter_.append({'term': {'city': city}})
    if min_price is not None:
        filter_.append({'range': {'effective_price': {'gte': min_price}}})
    if max_price is not None:
        filter_.append({'range': {'effective_price': {'lte': max_price}}})
    if min_rating is not None:
        filter_.append({'range': {'avg_rating': {'gte': min_rating}}})

    sort = [{'avg_rating': 'desc'}] if not query else ['_score']

    body = {
        'query': {'bool': {'must': must, 'filter': filter_}},
        'sort':  sort,
        'from':  (page - 1) * page_size,
        'size':  page_size,
    }

    result = get_client().search(index=INDEX, body=body)
    hits   = result['hits']['hits']
    total  = result['hits']['total']['value']

    return {
        'total':   total,
        'page':    page,
        'results': [h['_source'] for h in hits],
    }
