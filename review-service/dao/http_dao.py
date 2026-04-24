import httpx
from django.conf import settings

HEADERS = {'X-Internal-Token': settings.INTERNAL_SECRET}


def get_booking(booking_id: str) -> dict | None:
    try:
        r = httpx.get(
            f"{settings.BOOKING_SERVICE_URL}/api/booking/internal/{booking_id}/",
            headers=HEADERS, timeout=5,
        )
        return r.json() if r.status_code == 200 else None
    except Exception:
        return None


def update_provider_rating(user_id: str, avg_rating: float) -> None:
    try:
        httpx.patch(
            f"{settings.USER_SERVICE_URL}/internal/users/{user_id}/provider-rating/",
            json={'avg_rating': avg_rating},
            headers=HEADERS, timeout=5,
        )
    except Exception:
        pass


def update_seeker_rating(user_id: str, avg_rating: float) -> None:
    try:
        httpx.patch(
            f"{settings.USER_SERVICE_URL}/internal/users/{user_id}/seeker-rating/",
            json={'avg_rating': avg_rating},
            headers=HEADERS, timeout=5,
        )
    except Exception:
        pass
