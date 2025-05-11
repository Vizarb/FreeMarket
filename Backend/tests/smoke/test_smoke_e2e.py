# tests/smoke/test_smoke_e2e.py

import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
@pytest.mark.smoke
def test_full_system_sanity(api_client, user, product_factory):
    # 1. Public endpoints
    assert api_client.get(reverse('index')).status_code == status.HTTP_200_OK
    assert api_client.get(reverse('health_check')).json() == {"status": "ok"}

    # 2. JWT obtain/refresh
    tok = api_client.post(
        reverse('token_obtain_pair'),
        {"username": user.username, "password": "defaultpass"},
        format="json"
    )
    assert tok.status_code == status.HTTP_200_OK
    access = tok.data["access"]
    refresh = tok.data["refresh"]

    new_access = api_client.post(
        reverse('token_refresh'),
        {"refresh": refresh},
        format="json"
    ).data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {new_access}")

    # 3. Cart‐overview endpoint access
    assert api_client.get(reverse('cart-overview-list')).status_code == status.HTTP_200_OK

    # 4. Create a product
    prod = product_factory(seller=user, price_cents=500)

    # 5. Add to cart
    resp_add = api_client.post(
        reverse('cart-item-list'),
        {"item_id": prod.id, "quantity": 2},
        format="json"
    )
    assert resp_add.status_code == status.HTTP_201_CREATED

    # 6. List cart items
    resp_list = api_client.get(reverse('cart-item-list'), format="json")
    assert resp_list.status_code == status.HTTP_200_OK
    items = resp_list.data
    assert len(items) == 1
    assert items[0]["item_id"] == prod.id
    assert items[0]["quantity"] == 2
