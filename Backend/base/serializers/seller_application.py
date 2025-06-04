# base/serializers/seller_application.py

from rest_framework import serializers
from base.models.seller_application import SellerApplication


class SellerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerApplication
        fields = [
            "id", "user",
            "business_name", "tax_id", "phone_number", "description",
            "website", "country", "bank_account_number", "bank_name",
            "bank_swift_code", "national_id",
            "status", "submitted_at", "reviewed_at", "reviewer",
        ]
        read_only_fields = [
            "id", "user", "status", "submitted_at", "reviewed_at", "reviewer",
        ]
