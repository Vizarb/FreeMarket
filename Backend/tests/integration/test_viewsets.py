import pytest
from rest_framework.test import APIClient
from django.urls import reverse

from base.models.user import CustomUser
from base.models.category import Category
from base.models.item import Product, Service
from base.models.cart import Cart

# apply to all tests in this module
pytestmark = [pytest.mark.integration, pytest.mark.django_db]


class TestItemSearchViewSet:
    def setup_method(self):
        self.user = CustomUser.objects.create_user(username='tester', password='pass123')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

        self.category = Category.objects.create(name='Electronics')

        self.product = Product.objects.create(
            name='Laptop',
            description='High-end laptop',
            price_cents=150000,
            currency='USD',
            seller=self.user,
            quantity=5
        )
        self.product.categories.add(self.category)

        self.service = Service.objects.create(
            name='Cleaning',
            description='Home cleaning service',
            price_cents=5000,
            currency='USD',
            seller=self.user,
            service_duration=2,
            service_type='Standard'
        )
        self.service.categories.add(self.category)

    def test_autocomplete_with_query(self):
        url = reverse('item-search-autocomplete')
        resp = self.client.get(f"{url}?q=Lap")
        assert resp.status_code == 200
        assert 'Laptop' in resp.data

    def test_autocomplete_no_query(self):
        url = reverse('item-search-autocomplete')
        resp = self.client.get(url)
        assert resp.status_code == 200
        assert resp.data == []

    def test_search_fallback_to_ilike(self):
        url = reverse('item-search-list')
        resp = self.client.get(f"{url}?search=Clean")
        assert resp.status_code == 200
        names = [it['name'] for it in resp.data['results']]
        assert 'Cleaning' in names
        assert 'Laptop' not in names

    def test_category_filtering(self):
        url = reverse('item-search-list')
        resp = self.client.get(f"{url}?category_id={self.category.id}")
        assert resp.status_code == 200
        names = {it['name'] for it in resp.data['results']}
        assert names == {'Laptop', 'Cleaning'}


class TestCartOverviewViewSet:
    def setup_method(self):
        self.u1 = CustomUser.objects.create_user(username='u1', password='pwd1')
        self.u2 = CustomUser.objects.create_user(username='u2', password='pwd2')

        self.product = Product.objects.create(
            name='Laptop',
            description='Gaming laptop',
            price_cents=120000,
            currency='USD',
            seller=self.u1,
            quantity=3
        )

        self.cart1 = Cart.objects.create(user=self.u1)
        self.cart1.add_item(self.product, quantity=2)
        self.cart1.save()

        self.cart2 = Cart.objects.create(user=self.u2)
        self.cart2.add_item(self.product, quantity=1)
        self.cart2.save()

        self.client = APIClient()

    def test_unauthenticated_forbidden(self):
        url = reverse('cart-overview-list')
        resp = self.client.get(url)
        assert resp.status_code == 401

    def test_user_sees_only_their_cart(self):
        self.client.force_authenticate(self.u1)
        url = reverse('cart-overview-list')
        resp = self.client.get(url)
        assert resp.status_code == 200
        results = resp.data['results']
        assert len(results) == 1
        assert results[0]['user_id'] == self.u1.id
        assert results[0]['total_quantity'] == 2

    def test_ordering_by_cart_id(self):
        self.cart1.add_item(self.product, quantity=1)
        self.cart1.save()

        self.client.force_authenticate(self.u1)
        url = reverse('cart-overview-list')
        resp = self.client.get(url)
        ids = [r['cart_id'] for r in resp.data['results']]
        assert ids == sorted(ids)
