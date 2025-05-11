from rest_framework import serializers
from base.models.seller_application import SellerApplication

class SellerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerApplication
        fields = [
            "id", "user", "data",
            "status", "submitted_at",
            "reviewed_at", "reviewer",
        ]
        read_only_fields = [
            "id", "user", "status",
            "submitted_at", "reviewed_at",
            "reviewer",
        ]
