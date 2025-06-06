# tests/integration/test_models_additional.py

import pytest
from django.urls import reverse
from rest_framework import status

from tests.factories import UserFactory
from base.models.user import CustomUser
from base.models.category import Category
from base.models.address import Address
from base.models.cart import Cart
from base.models.order import Order

pytestmark = [pytest.mark.integration, pytest.mark.django_db]


def _extract_items(resp):
    data = resp.data
    if isinstance(data, dict) and 'results' in data:
        return data['results']
    return data


# ─── ProductViewSet error & custom actions ────────────────────────────────────────

def test_create_product_missing_fields(authed_client):
    url = reverse('product-list')
    resp = authed_client.post(url, {}, format='json')
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in resp.data


def test_update_product_invalid(authed_client, product_factory, user):
    prod = product_factory(seller=user)
    url = reverse('product-detail', args=[prod.id])
    resp = authed_client.patch(url, {'price_cents': 'NaN'}, format='json')
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in resp.data


def test_destroy_product_and_absence_in_list(authed_client, product_factory, user):
    prod = product_factory(seller=user)
    delete_url = reverse('product-detail', args=[prod.id])
    resp = authed_client.delete(delete_url)
    assert resp.status_code == status.HTTP_204_NO_CONTENT

    # confirm it no longer appears
    list_resp = authed_client.get(reverse('product-list'))
    items = _extract_items(list_resp)
    assert all(item['id'] != prod.id for item in items)


def test_soft_delete_not_found(authed_client):
    url = reverse('product-soft-delete', args=[9999])
    resp = authed_client.post(url)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_restore_not_found(authed_client):
    url = reverse('product-restore', args=[9999])
    resp = authed_client.post(url)
    assert resp.status_code == status.HTTP_404_NOT_FOUND


def test_deleted_endpoint_empty(authed_client):
    url = reverse('product-deleted')
    resp = authed_client.get(url)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.data == []


# ─── CategoryViewSet full_path logic ─────────────────────────────────────────────

def test_category_full_path(authed_client):
    c1 = Category.objects.create(name="A")
    c2 = Category.objects.create(name="B", parent=c1)
    c3 = Category.objects.create(name="C", parent=c2)

    resp = authed_client.get(reverse('category-list'))
    assert resp.status_code == status.HTTP_200_OK

    items = _extract_items(resp)
    node = next(item for item in items if item['id'] == c3.id)
    assert node['full_path'] == "A > B > C"


# ─── AddressViewSet CRUD ────────────────────────────────────────────────────────

def test_address_list_retrieve_update_delete(authed_client, user):
    addr = Address.objects.create(
        user=user,
        address_line_1="123 St",
        city="OldCity",
        state_province="SP",
        country="CT",
        postal_code="000"
    )

    # list
    list_r = authed_client.get(reverse('address-list'))
    items = _extract_items(list_r)
    assert any(a['id'] == addr.id for a in items)

    # retrieve
    detail_url = reverse('address-detail', args=[addr.id])
    ret_r = authed_client.get(detail_url)
    assert ret_r.data['city'] == "OldCity"

    # update
    upd_r = authed_client.patch(detail_url, {'city': "NewCity"}, format='json')
    assert upd_r.data['city'] == "NewCity"

    # delete
    del_r = authed_client.delete(detail_url)
    assert del_r.status_code == status.HTTP_204_NO_CONTENT

    post_list = _extract_items(authed_client.get(reverse('address-list')))
    assert all(a['id'] != addr.id for a in post_list)


# ─── CartViewSet scope ───────────────────────────────────────────────────────────

def test_cart_list_only_shows_own(authed_client, user):
    # user fixture is one user; create a second via the factory
    user1 = user
    user2 = UserFactory()
    # give each a cart
    Cart.objects.create(user=user1)
    Cart.objects.create(user=user2)

    # authenticate as user1
    authed_client.force_authenticate(user=user1)
    resp = authed_client.get(reverse('cart-list'))
    assert resp.status_code == status.HTTP_200_OK

    # paginated payload
    carts = resp.data['results']
    # every returned cart must belong to user1
    assert all(cart['user']['id'] == user1.id for cart in carts)


# ─── OrderViewSet create & cancel/update logic ─────────────────────────────────

def test_create_order_no_cart_and_empty_cart(authed_client, user):
    # no cart: should 400
    resp = authed_client.post(reverse('order-list'), {}, format='json')
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert resp.data['error'] == "No cart found for the user."

    # create empty cart
    Cart.objects.create(user=user)
    resp2 = authed_client.post(reverse('order-list'), {}, format='json')
    assert resp2.status_code == status.HTTP_400_BAD_REQUEST
    assert "Cart is empty" in resp2.data['error']


def test_cancel_and_update_unprocessed_order(authed_client, user):
    # create a pending order
    order = Order.objects.create(user=user, status='PENDING')

    authed_client.force_authenticate(user=user)
    # Cancel (DELETE) → status goes to CANCELLED
    cancel_r = authed_client.delete(reverse('order-detail', args=[order.id]))
    assert cancel_r.status_code == status.HTTP_200_OK
    assert cancel_r.data['status'] == "Order cancelled."

    # Attempt to PATCH → should 400 with an "error" key
    upd_r = authed_client.patch(
        reverse('order-detail', args=[order.id]),
        {'status': 'SHIPPED'},
        format='json'
    )
    assert upd_r.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in upd_r.data
    assert upd_r.data['error'] == "Cannot update an order that is already processed."
