from django.conf import settings
from django.db import models
from django.db.models import Q, UniqueConstraint
from django.core.validators import RegexValidator
from .base_modle import BaseModel  # Ensure this provides `is_deleted`
from base.enums import SellerApplicationStatus

# Validators
phone_regex = RegexValidator(
    regex=r'^\+?[1-9]\d{1,14}$',
    message="Phone number must be in the format '+999999999'. Up to 15 digits allowed."
)

swift_code_validator = RegexValidator(
    regex=r'^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$',
    message="Enter a valid SWIFT/BIC code (8 or 11 uppercase letters/numbers)."
)

alphanumeric_id_validator = RegexValidator(
    regex=r'^[A-Za-z0-9]{9,15}$',
    message="ID must be alphanumeric and 9–15 characters long."
)


class SellerApplication(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_applications"
    )

    business_name = models.CharField(max_length=255)
    tax_id = models.CharField(
        max_length=15,
        validators=[alphanumeric_id_validator]
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[phone_regex]
    )
    description = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    country = models.CharField(max_length=100)

    bank_account_number = models.CharField(max_length=100, blank=True, null=True)
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    bank_swift_code = models.CharField(
        max_length=11,
        blank=True,
        null=True,
        validators=[swift_code_validator]
    )
    national_id = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[alphanumeric_id_validator]
    )

    status = models.CharField(
        max_length=20,
        choices=SellerApplicationStatus.choices,
        default=SellerApplicationStatus.PENDING
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_seller_applications"
    )

    class Meta:
        ordering = ["-submitted_at"]
        constraints = [
            UniqueConstraint(
                fields=["user"],
                condition=Q(is_deleted=False),
                name="unique_active_seller_application"
            )
        ]

    def __str__(self):
        return f"{self.user.username} → {self.status}"