from rest_framework import serializers
from base.models.seller_profile import SellerProfile

class SellerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    user_id = serializers.CharField(source="user.id", read_only=True)

    class Meta:
        model = SellerProfile
        fields = [
            "user_id",
            "username",
            "shop_name",
            "slug",
            "theme_id",
            "banner_image",
            "bio",
            "website",
        ]
        read_only_fields = ["slug", "username"]
