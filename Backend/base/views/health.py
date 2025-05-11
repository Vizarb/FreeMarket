# backend/base/views/health.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class HealthCheckView(APIView):
    """
    Basic health check: returns 200 OK if the app process is alive.
    """
    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)
