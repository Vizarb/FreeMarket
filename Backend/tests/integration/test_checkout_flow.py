# tests/integration/test_checkout_flow.py

import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
@pytest.mark.integration
def test_full_checkout_flow(api_client, user, product_factory):
    # 1. Authenticate
    api_client.force_authenticate(user=user)

    # 2. Create a product
    product = product_factory(seller=user, price_cents=100, currency="USD")

    # 3. Add to cart
    resp_add = api_client.post(
        reverse('cart-item-list'),
        {"item_id": product.id, "quantity": 2},
        format="json"
    )
    assert resp_add.status_code == status.HTTP_201_CREATED

    # 4. Checkout (POST to order-list)
    resp_checkout = api_client.post(reverse('order-list'), {}, format="json")
    assert resp_checkout.status_code == status.HTTP_201_CREATED

    # 5. Verify cart is empty
    resp_list = api_client.get(reverse('cart-item-list'), format="json")
    assert resp_list.status_code == status.HTTP_200_OK
    assert resp_list.data == []
