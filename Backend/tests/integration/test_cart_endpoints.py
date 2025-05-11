# tests/integration/test_cart_endpoints.py
import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
@pytest.mark.integration
def test_add_and_list_cart(api_client, user, product_factory):
    # Authenticate
    api_client.force_authenticate(user=user)

    # Create an item
    prod = product_factory(seller=user)

    # 1. Add item to cart
    resp = api_client.post(
        reverse('cart-item-list'),
        {"item_id": prod.id, "quantity": 3},
        format="json"
    )
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.data["item_id"] == prod.id
    assert resp.data["quantity"] == 3

    # 2. List cart items
    list_resp = api_client.get(reverse('cart-item-list'), format="json")
    assert list_resp.status_code == status.HTTP_200_OK
    items = list_resp.data
    assert isinstance(items, list) and len(items) == 1
    first = items[0]
    assert first["item_id"] == prod.id
    assert first["quantity"] == 3

@pytest.mark.django_db
@pytest.mark.integration
@pytest.mark.parametrize("factory_name", ["product_factory", "service_factory"])
def test_add_and_list_cart(api_client, user, request, factory_name):
    # Authenticate
    api_client.force_authenticate(user=user)

    # Dynamically get the factory (product or service)
    item_factory = request.getfixturevalue(factory_name)

    # Create an item (product or service)
    prod = item_factory(seller=user)

    # 1. Add item to cart
    resp = api_client.post(
        reverse('cart-item-list'),
        {"item_id": prod.id, "quantity": 3},
        format="json"
    )
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.data["item_id"] == prod.id
    assert resp.data["quantity"] == 3

    # 2. List cart items
    list_resp = api_client.get(reverse('cart-item-list'), format="json")
    assert list_resp.status_code == status.HTTP_200_OK
    items = list_resp.data
    assert isinstance(items, list) and len(items) == 1
    first = items[0]
    assert first["item_id"] == prod.id
    assert first["quantity"] == 3