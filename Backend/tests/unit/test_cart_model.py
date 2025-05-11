import pytest
from django.core.exceptions import ValidationError
from base.models.cart import Cart, CartItem

pytestmark = [pytest.mark.unit, pytest.mark.django_db]

class TestCartModel:
    def test_add_new_cart_item_creates_it(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        cart.add_item(item, quantity=2)
        assert CartItem.objects.filter(cart=cart, item=item, quantity=2).exists()

    def test_add_existing_cart_item_increments_quantity(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        CartItem.objects.create(cart=cart, item=item, quantity=1, price_snapshot_cents=1000)
        cart.add_item(item, quantity=2)
        cart_item = CartItem.objects.get(cart=cart, item=item)
        assert cart_item.quantity == 3

    def test_add_soft_deleted_item_restores_it(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        cart_item = CartItem.objects.create(
            cart=cart, item=item, quantity=1,
            price_snapshot_cents=1000, is_deleted=True
        )
        cart.add_item(item, quantity=2)
        cart_item.refresh_from_db()
        assert not cart_item.is_deleted
        assert cart_item.quantity == 2

    def test_remove_cart_item_soft_deletes(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        CartItem.objects.create(cart=cart, item=item, quantity=1, price_snapshot_cents=1000)
        cart.remove_item(item)
        cart_item = CartItem.all_objects.get(cart=cart, item=item)
        assert cart_item.is_deleted is True

    def test_update_quantity_to_zero_removes_item(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        CartItem.objects.create(cart=cart, item=item, quantity=3, price_snapshot_cents=1000)
        cart.update_quantity(item, 0)
        cart_item = CartItem.all_objects.get(cart=cart, item=item)
        assert cart_item.is_deleted is True

    def test_update_quantity_sets_new_quantity(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        CartItem.objects.create(cart=cart, item=item, quantity=1, price_snapshot_cents=1000)
        cart.update_quantity(item, 5)
        cart_item = CartItem.objects.get(cart=cart, item=item)
        assert cart_item.quantity == 5

    def test_clear_cart_deletes_all_items(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        CartItem.objects.create(cart=cart, item=item, quantity=1, price_snapshot_cents=1000)
        cart.clear_cart()
        assert cart.cart_items.count() == 0

    def test_price_snapshot_auto_sets_if_missing(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        cart_item = CartItem(cart=cart, item=item, quantity=1)
        cart_item.save()
        assert cart_item.price_snapshot_cents == item.price_cents

    def test_cart_item_invalid_quantity_raises_validation(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        cart_item = CartItem(cart=cart, item=item, quantity=0, price_snapshot_cents=1000)
        with pytest.raises(ValidationError):
            cart_item.full_clean()

    def test_cart_item_invalid_price_raises_validation(self, user, product_factory):
        item = product_factory(seller=user)
        cart = Cart.objects.create(user=user)
        cart_item = CartItem(cart=cart, item=item, quantity=1, price_snapshot_cents=-100)
        with pytest.raises(ValidationError):
            cart_item.full_clean()
