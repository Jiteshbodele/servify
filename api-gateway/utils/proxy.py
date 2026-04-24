import httpx
from django.conf import settings
from rest_framework.response import Response
from rest_framework.request import Request


def proxy(request: Request, base_url: str, path: str) -> Response:
    """
    Forward an incoming request to the target service and return its response.
    Strips internal headers, forwards auth and body untouched.
    """
    url = f"{base_url.rstrip('/')}/{path.lstrip('/')}"

    # Forward all headers except host
    forward_headers = {
        k: v for k, v in request.headers.items()
        if k.lower() not in ('host', 'content-length')
    }

    # Forward query params
    params = dict(request.query_params)

    try:
        resp = httpx.request(
            method=request.method,
            url=url,
            headers=forward_headers,
            params=params,
            content=request.body,
            timeout=10,
        )
        try:
            data = resp.json()
        except Exception:
            data = {'detail': resp.text}

        return Response(data, status=resp.status_code)

    except httpx.ConnectError:
        return Response(
            {'detail': f'Service unavailable: {base_url}'},
            status=503,
        )
    except httpx.TimeoutException:
        return Response(
            {'detail': 'Service timed out'},
            status=504,
        )
