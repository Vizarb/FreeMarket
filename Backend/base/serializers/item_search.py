from rest_framework import serializers
from base.models.seller_profile import SellerProfile
from base.models.views import ItemSearchView

class ItemSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemSearchView
        fields = [
            "item_id",
            "slug",
            "name",
            "description",
            "price_cents",
            "currency",
            "seller",
            "seller_shop_name",
            "seller_slug",
            "item_type",
            "categories",
            "category_ids",
            "search_vector",
        ]
        read_only_fields = ["search_vector"]

