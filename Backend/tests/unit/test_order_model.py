# tests/unit/test_order_model.py

import pytest
from django.core.exceptions import ValidationError
from base.models.order import Order, OrderItem, OrderStatus
from base.models.cart import Cart

pytestmark = [pytest.mark.unit, pytest.mark.django_db]

class TestOrderModel:
    """
    Unit tests for Order and OrderItem to ensure full coverage of order functionality, including products and services.
    """

    def test_str_representation(self, user):
        order = Order.objects.create(user=user)
        expected = f"Order #{order.id} - {user.username} - {OrderStatus.PENDING}"
        assert str(order) == expected

    def test_calculate_total_no_items(self, user, product_factory):
        order = Order.objects.create(user=user)
        order.calculate_total()
        order.refresh_from_db()
        assert order.total_price_cents == 0

    def test_calculate_total_with_products_and_services(self, user, product_factory, service_factory):
        order = Order.objects.create(user=user)
        # Create a product and a service with different prices
        prod = product_factory(price_cents=100)
        svc = service_factory(price_cents=150)
        # Manually create order items
        OrderItem.objects.create(order=order, item=prod, quantity=1, price_cents=prod.price_cents)
        OrderItem.objects.create(order=order, item=svc, quantity=2, price_cents=svc.price_cents)
        # Calculate total and verify
        order.calculate_total()
        order.refresh_from_db()
        expected = 1 * 100 + 2 * 150
        assert order.total_price_cents == expected

    def test_convert_cart_to_order_empty(self, user, product_factory):
        order = Order.objects.create(user=user)
        cart = Cart.objects.create(user=user)
        order.convert_cart_to_order(cart)
        # no order items created and cart cleared
        assert OrderItem.objects.filter(order=order).count() == 0
        assert cart.cart_items.count() == 0
        order.refresh_from_db()
        assert order.total_price_cents == 0

    def test_convert_cart_to_order_with_products_and_services(self, user, product_factory, service_factory):
        order = Order.objects.create(user=user)
        cart = Cart.objects.create(user=user)
        # add a product and a service to cart
        prod = product_factory(price_cents=50)
        svc = service_factory(price_cents=75)
        cart.add_item(prod, quantity=2)
        cart.add_item(svc, quantity=3)
        # convert cart to order
        order.convert_cart_to_order(cart)
        order.refresh_from_db()
        # cart should be cleared
        assert cart.cart_items.count() == 0
        # order items created
        items = list(OrderItem.objects.filter(order=order).order_by('item_id'))
        assert len(items) == 2
        # verify quantities and total
        expected_total = 2 * 50 + 3 * 75
        assert order.total_price_cents == expected_total
        # verify each item
        assert items[0].quantity in (2, 3)
        assert items[1].quantity in (2, 3)

    def test_orderitem_str_and_constraint(self, user, product_factory, service_factory):
        order = Order.objects.create(user=user)
        # test product OrderItem
        prod = product_factory(price_cents=123)
        oi_prod = OrderItem.objects.create(order=order, item=prod, quantity=3, price_cents=prod.price_cents)
        expected_str_prod = f"3 of {prod.name} in Order #{order.id}"
        assert str(oi_prod) == expected_str_prod
        # test service OrderItem
        svc = service_factory(price_cents=200)
        oi_svc = OrderItem.objects.create(order=order, item=svc, quantity=2, price_cents=svc.price_cents)
        expected_str_svc = f"2 of {svc.name} in Order #{order.id}"
        assert str(oi_svc) == expected_str_svc
        # quantity constraint: zero should raise for both
        bad_prod = OrderItem(order=order, item=prod, quantity=0, price_cents=prod.price_cents)
        with pytest.raises(ValidationError):
            bad_prod.full_clean()
        bad_svc = OrderItem(order=order, item=svc, quantity=0, price_cents=svc.price_cents)
        with pytest.raises(ValidationError):
            bad_svc.full_clean()
