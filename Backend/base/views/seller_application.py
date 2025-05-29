# base/views/seller_application.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth.models import Group

from base.models.seller_application import SellerApplication
from base.serializers.seller_application import SellerApplicationSerializer
from base.permissions import HasRole


class SellerApplicationViewSet(viewsets.ModelViewSet):
    """
    /api/seller-applications/
      POST    → create new application (any authenticated user)
      GET     → list your own (admins see all)
      GET /pk → retrieve
      POST /pk/approve  → admin-only
      POST /pk/reject   → admin-only
    """
    queryset = SellerApplication.objects.all()
    serializer_class = SellerApplicationSerializer

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        if self.action in ("approve", "reject"):
            return [IsAuthenticated(), HasRole()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return SellerApplication.objects.all()
        return SellerApplication.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        app = self.get_object()
        if app.status != SellerApplication.STATUS_PENDING:
            return Response({"detail": "Already reviewed."}, status=400)
        app.status = SellerApplication.STATUS_APPROVED
        app.reviewed_at = timezone.now()
        app.reviewer = request.user
        app.save()

        # Add to Seller group
        seller_group, _ = Group.objects.get_or_create(name="Seller")
        app.user.groups.add(seller_group)

        return Response({"status": app.status})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        app = self.get_object()
        if app.status != SellerApplication.STATUS_PENDING:
            return Response({"detail": "Already reviewed."}, status=400)
        app.status = SellerApplication.STATUS_REJECTED
        app.reviewed_at = timezone.now()
        app.reviewer = request.user
        app.save()
        return Response({"status": app.status})
