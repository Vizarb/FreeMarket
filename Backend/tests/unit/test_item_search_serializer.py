# tests/unit/test_item_search_serializer.py

from django.db import IntegrityError
from django.core.exceptions import ValidationError
import pytest
from base.models import Item
from base.serializers.item_search import ItemSearchSerializer

pytestmark = [pytest.mark.unit, pytest.mark.django_db]

class TestItemSearchSerializer:
    """
    Tests for ItemSearchSerializer get_* methods using ProductFactory and ServiceFactory.
    """

    def test_product_serialization(self, product_factory):
        product = product_factory(name='Prod1', price_cents=1500, quantity=5)
        serializer = ItemSearchSerializer(product)
        data = serializer.data
        assert data['item_type'] == 'product'
        assert data['quantity'] == 5
        assert data['service_duration'] is None
        assert data['service_type'] is None

    def test_service_serialization(self, service_factory):
        service = service_factory(name='Svc1', price_cents=2000, service_duration=10, service_type='Cleaning')
        serializer = ItemSearchSerializer(service)
        data = serializer.data
        assert data['item_type'] == 'service'
        assert data['quantity'] is None
        assert data['service_duration'] == 10
        assert data['service_type'] == 'Cleaning'

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
