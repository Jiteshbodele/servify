from dao.es_dao import search, index_document, delete_document


class SearchService:

    @staticmethod
    def search_providers(**kwargs) -> dict:
        return search(**kwargs)

    @staticmethod
    def index(event: dict) -> None:
        doc_id = event.get('provider_service_id')
        if not doc_id:
            return
        index_document(doc_id, {
            'provider_service_id': doc_id,
            'service_name':        event.get('service_name', ''),
            'category_name':       event.get('category_name', ''),
            'provider_name':       event.get('provider_name', ''),
            'description':         event.get('description', ''),
            'effective_price':     float(event.get('effective_price', 0)),
            'avg_rating':          float(event.get('avg_rating', 0)),
            'city':                event.get('city', ''),
            'is_active':           event.get('is_active', True),
        })

    @staticmethod
    def remove(provider_service_id: str) -> None:
        delete_document(provider_service_id)
