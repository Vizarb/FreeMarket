from django.conf import settings
from django.db import models
from django.utils import timezone
from .base_modle import BaseModel  # or wherever your BaseModel lives

class SellerApplication(BaseModel):
    STATUS_PENDING  = "PENDING"
    STATUS_APPROVED = "APPROVED"
    STATUS_REJECTED = "REJECTED"

    STATUS_CHOICES = [
        (STATUS_PENDING,  "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_applications"
    )
    data         = models.JSONField(
        blank=True, null=True,
        help_text="Optional extra info (e.g. bank details, docs)"
    )
    status       = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at  = models.DateTimeField(blank=True, null=True)
    reviewer     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True, null=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_seller_applications"
    )

    class Meta:
        ordering = ["-submitted_at"]
        # if you want to prevent multiple pending, enforce in view

    def __str__(self):
        return f"{self.user.username} → {self.status}"
