# tests/unit/test_item_search_serializer.py

from django.db import IntegrityError
from django.core.exceptions import ValidationError
import pytest
from types import SimpleNamespace
from base.models import Item
from base.serializers.item_search import ItemSearchSerializer

pytestmark = [pytest.mark.unit, pytest.mark.django_db]

class TestItemSearchSerializer:
    """
    Tests for ItemSearchSerializer get_* methods using ProductFactory and ServiceFactory.
    """

    def test_product_serialization(self):
        product_view = SimpleNamespace(
            item_id=1,
            slug="prod-1",
            name="Product A",
            description="A nice product",
            price_cents=1000,
            currency="USD",
            seller="seller_user",
            item_type="product",
            categories="Electronics",
            category_ids=[1],
            search_vector="'nice'",
        )
        serializer = ItemSearchSerializer(product_view)
        data = serializer.data
        assert data["item_type"] == "product"

    def test_service_serialization(self):
        service_view = SimpleNamespace(
            item_id=2,
            slug="svc-1",
            name="Service A",
            description="A helpful service",
            price_cents=1500,
            currency="USD",
            seller="seller_user",
            item_type="service",
            categories="Tutoring",
            category_ids=[2],
            search_vector="'helpful'",
        )
        serializer = ItemSearchSerializer(service_view)
        data = serializer.data
        assert data["item_type"] == "service"


    def test_cannot_create_bare_item(self):
        """
        Business rule: you may not create an Item without a seller and subtype.
        """
        with pytest.raises((IntegrityError, ValidationError)):
            Item.objects.create(
                name='Base',
                price_cents=100,
                currency='USD',
                seller=None
            )
