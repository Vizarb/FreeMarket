# Backend/base/views/debug_cache.py

import time
from typing import Any, Dict
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from base.utils.cache_utils import get_or_set_json, cache_key_preview

class CacheDemoView(APIView):
    """
    A safe endpoint to verify Redis caching end-to-end.
    Protected by IsAdminUser to keep it internal in production.
    """
    permission_classes = [IsAdminUser]
    API_CACHE_VERSION = "v1"

    def get(self, request):
        # In real views you'll pick a logical key. Here we use a demo key.
        # Example key: freemarket:debug:demo:v1:ua
        ttl = settings.CACHE_TTL.get("ITEM_DETAIL", 60)  # reuse an existing TTL; any is fine here

        def produce() -> Dict[str, Any]:
            # Simulate some work; we return a payload with a timestamp.
            return {"ok": True, "computed_at": time.time()}

        data, hit = get_or_set_json(
            ["debug", "demo", self.API_CACHE_VERSION],
            producer=produce,
            ttl=ttl,
            vary_user_id=None,  # set to request.user.id if you want a per-user cache
        )

        # Helpful for you while learning: what key did we use?
        key_preview = cache_key_preview(["debug", "demo", self.API_CACHE_VERSION])

        resp = Response({
            "cache_key_preview": key_preview,
            "cache_hit": hit,
            "ttl_used": ttl,
            "data": data,
        })
        resp["X-Cache"] = "HIT" if hit else "MISS"
        return resp
