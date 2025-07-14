# base/views/seller_application.py

from django.db import IntegrityError
from rest_framework import viewsets, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth.models import Group

from base.models.seller_application import SellerApplication
from base.serializers.seller_application import SellerApplicationSerializer
from base.permissions import HasRole
from base.enums import SellerApplicationStatus


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
        if self.action in ("approve", "reject"):
            self.required_roles = ["Seller"] 
            return [IsAuthenticated(), HasRole()]
        if self.action == "create":
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return SellerApplication.objects.all()
        return SellerApplication.objects.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user

        # 1. Check for active (non-rejected) application
        has_active_app = SellerApplication.objects.filter(
            user=user,
            is_deleted=False,
            status__in=[SellerApplicationStatus.PENDING, SellerApplicationStatus.APPROVED]
        ).exists()

        if has_active_app:
            raise serializers.ValidationError({
                "detail": "You already have an active or approved seller application."
            })

        # 2. Soft-delete old rejected applications
        SellerApplication.objects.filter(
            user=user,
            is_deleted=False,
            status=SellerApplicationStatus.REJECTED
        ).update(is_deleted=True)

        # 3. Create new application
        serializer.save(user=user)


    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        app = self.get_object()
        if app.status != SellerApplicationStatus.PENDING:
            return Response({"detail": "Already reviewed."}, status=400)
        
        app.status = SellerApplicationStatus.APPROVED
        app.reviewed_at = timezone.now()
        app.reviewer = request.user
        app.save()

        #  promote via manager
        app.user.manager.promote_to_seller(app.user)

        return Response({"status": app.status})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        app = self.get_object()
        if app.status != SellerApplicationStatus.PENDING:
            return Response({"detail": "Already reviewed."}, status=400)
        app.status = SellerApplicationStatus.REJECTED
        app.reviewed_at = timezone.now()
        app.reviewer = request.user
        app.save()
        return Response({"status": app.status})
