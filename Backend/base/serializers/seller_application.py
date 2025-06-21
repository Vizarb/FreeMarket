# base/serializers/seller_application.py

from rest_framework import serializers
from base.models.user import CustomUser
from base.models.seller_application import SellerApplication

class SimpleUserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "username", "roles"]

    def get_roles(self, obj):
        return obj.get_roles()


class SellerApplicationSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    reviewer = SimpleUserSerializer(read_only=True)

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
