def paginate(queryset, page: int, page_size: int) -> dict:
    page      = max(1, page)
    page_size = min(max(1, page_size), 100)
    total     = queryset.count()
    start     = (page - 1) * page_size
    end       = start + page_size
    items     = list(queryset[start:end])
    return {
        'count':       total,
        'total_pages': (total + page_size - 1) // page_size,
        'page':        page,
        'page_size':   page_size,
        'results':     items,
    }
