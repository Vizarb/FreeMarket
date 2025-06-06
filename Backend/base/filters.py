# backend/base/filters.py

from django_filters import rest_framework as filters
from .models.item import Item


class ItemFilter(filters.FilterSet):
    """
    FilterSet for Item. 
    - category_id → joins through the ManyToManyField (Item.categories).
    - You can add other filters (brand, rating, etc.) here later.
    """
    # Filter items by category.id (this automatically does the INNER JOIN through the M2M)
    category_id = filters.NumberFilter(field_name="categories__id", lookup_expr="exact")

    # Price range: allow filtering by min_price and max_price
    min_price = filters.NumberFilter(field_name="price_cents", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price_cents", lookup_expr="lte")

    # Example: If you add a “brand” field on Item in the future, you could do:
    # brand = filters.CharFilter(field_name="metadata__brand", lookup_expr="iexact")

    class Meta:
        model = Item
        # map any param → model field automatically. We explicitly list price_cents, currency, seller, name
        fields = {
            "name": ["icontains"],        # e.g. ?name__icontains=laptop
            "price_cents": ["exact", "gte", "lte"],
            "currency": ["exact"],
            "seller": ["exact"],
            # The custom filters above (category_id, min_price, max_price) are picked up automatically
        }
