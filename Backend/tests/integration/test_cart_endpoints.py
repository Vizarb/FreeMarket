import pytest
from django.urls import reverse
from rest_framework import status
from tests.factories import UserFactory

@pytest.mark.django_db
@pytest.mark.integration
def test_add_and_list_cart(api_client, user, product_factory):
    # Authenticate buyer
    api_client.force_authenticate(user=user)

    # Create product from a Seller
    seller = UserFactory(roles=["Seller"])
    product = product_factory(seller=seller)

    # 1. Add to cart
    resp = api_client.post(
        reverse('cart-item-list'),
        {"item_id": product.id, "quantity": 3},
        format="json"
    )
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.data["item_id"] == product.id
    assert resp.data["quantity"] == 3

    # 2. List cart items
    list_resp = api_client.get(reverse('cart-item-list'), format="json")
    assert list_resp.status_code == status.HTTP_200_OK
    items = list_resp.data
    assert isinstance(items, list) and len(items) == 1
    first = items[0]
    assert first["item_id"] == product.id
    assert first["quantity"] == 3


@pytest.mark.django_db
@pytest.mark.integration
@pytest.mark.parametrize("factory_name", ["product_factory", "service_factory"])
def test_add_and_list_cart_multiple_types(api_client, user, request, factory_name):
    # Authenticate buyer
    api_client.force_authenticate(user=user)

    # Get correct factory
    item_factory = request.getfixturevalue(factory_name)

    # Create item from Seller
    seller = UserFactory(roles=["Seller"])
    item = item_factory(seller=seller)

    # 1. Add to cart
    resp = api_client.post(
        reverse('cart-item-list'),
        {"item_id": item.id, "quantity": 3},
        format="json"
    )
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.data["item_id"] == item.id
    assert resp.data["total_quantity"] == 3


    # 2. List cart items
    list_resp = api_client.get(reverse('cart-item-list'), format="json")
    assert list_resp.status_code == status.HTTP_200_OK
    items = list_resp.data
    assert isinstance(items, list) and len(items) == 1
    first = items[0]
    assert first["item_id"] == item.id
    assert first["total_quantity"] == 3
