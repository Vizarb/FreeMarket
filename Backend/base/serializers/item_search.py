from rest_framework import serializers
from base.models.views import ItemSearchView

class ItemSearchSerializer(serializers.ModelSerializer):
    item_id = serializers.SerializerMethodField()  # ✅ flexible across view or real model

    def get_item_id(self, obj):
        return getattr(obj, "item_id", getattr(obj, "id", None))
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
            "item_type",
            "categories",
            "category_ids",
            "search_vector",
        ]
        read_only_fields = ["search_vector"]
