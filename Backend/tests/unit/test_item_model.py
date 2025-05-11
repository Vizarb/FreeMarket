# tests/unit/test_item_model.py
import pytest
from base.models.item import Product, Service
from django.core.exceptions import ValidationError

pytestmark = [pytest.mark.unit, pytest.mark.django_db]

def test_product_quantity_constraint():
    p = Product(name="X", price_cents=100, currency="USD", seller_id=1)
    p.quantity = -1
    with pytest.raises(ValidationError):
        p.full_clean()

def test_service_str():
    s = Service(name="Cleaning", price_cents=5000, currency="USD", seller_id=1,
                service_duration=2, service_type="Home")
    assert str(s) == "Cleaning (Service)"
