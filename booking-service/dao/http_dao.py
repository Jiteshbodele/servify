import httpx
from django.conf import settings

HEADERS = {'X-Internal-Token': settings.INTERNAL_SECRET}


def get_user(user_id: str) -> dict | None:
    try:
        r = httpx.get(
            f"{settings.USER_SERVICE_URL}/internal/users/{user_id}/",
            headers=HEADERS, timeout=5,
        )
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None


def get_service(service_id: str) -> dict | None:
    try:
        r = httpx.get(
            f"{settings.CATALOG_SERVICE_URL}/api/catalog/internal/services/{service_id}/",
            headers=HEADERS, timeout=5,
        )
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None
