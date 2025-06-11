from django.conf import settings
from django.db import models
from django.db.models import Q
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

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_applications"
    )

    # Replace JSONField with strict fields
    business_name        = models.CharField(max_length=255)
    tax_id               = models.CharField(max_length=100)
    phone_number         = models.CharField(max_length=20, blank=True, null=True)
    description          = models.TextField(blank=True, null=True)
    website              = models.URLField(blank=True, null=True)
    country              = models.CharField(max_length=100)
    bank_account_number  = models.CharField(max_length=100, blank=True, null=True)
    bank_name            = models.CharField(max_length=100, blank=True, null=True)
    bank_swift_code      = models.CharField(max_length=50, blank=True, null=True)
    national_id          = models.CharField(max_length=100, blank=True, null=True)

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
        constraints = [
        models.UniqueConstraint(
            fields=["user"], name="unique_active_seller_application", condition=Q(is_deleted=False)
        )
    ]

    def __str__(self):
        return f"{self.user.username} → {self.status}"
