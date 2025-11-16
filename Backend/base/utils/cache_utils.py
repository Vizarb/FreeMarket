"""
Small helpers to make Redis-backed caching easy and consistent.

Concepts:
- Keys: human-readable, namespaced, and versioned so we can invalidate broadly by bumping versions.
- TTL: set per-use (endpoint decides freshness).
- Vary: if a response is different per user, add their ID to the key.
- Invalidation: delete keys by prefix when source data changes (signals call delete_prefix()).
"""

from typing import Callable, Iterable, Optional, Tuple, Any, Dict
from django.core.cache import cache

# This prefix is inside the value; Django also adds settings.KEY_PREFIX in front.
# Net result in Redis will look like: <KEY_PREFIX>:freemarket:item:123:detail:v1:ua
VALUE_PREFIX = "freemarket"


def make_key(parts: Iterable[object]) -> str:
    """
    Build a readable cache key like:
        freemarket:item:123:detail:v1:ua
    Django will prepend KEY_PREFIX automatically (e.g., fm:dev:...).
    """
    return ":".join([VALUE_PREFIX, *map(str, parts)])


def get_or_set_json(
    key_parts: Iterable[object],
    producer: Callable[[], Any],
    ttl: int,
    vary_user_id: Optional[int] = None,
) -> Tuple[Any, bool]:
    """
    Get cached value if present, otherwise compute via producer(), cache it, and return.

    Returns:
        (data, hit) where hit=True means it came from cache.
    """
    suffix = f"u{vary_user_id}" if vary_user_id else "ua"  # ua = unauth/shared
    key = make_key([*key_parts, suffix])

    cached = cache.get(key)
    if cached is not None:
        return cached, True

    data = producer()
    cache.set(key, data, ttl)
    return data, False


def delete_prefix(prefix_parts: Iterable[object]) -> None:
    """
    Delete all keys that start with the given prefix.
    Requires django-redis so cache.delete_pattern() exists.
    """
    pattern = make_key([*prefix_parts]) + "*"
    delete_pattern = getattr(cache, "delete_pattern", None)
    if callable(delete_pattern):
        delete_pattern(pattern)


def cache_key_preview(key_parts: Iterable[object], vary_user_id: Optional[int] = None) -> str:
    """
    Utility for debugging/logging to see what key will be used (without writing to cache).
    """
    suffix = f"u{vary_user_id}" if vary_user_id else "ua"
    return make_key([*key_parts, suffix])
