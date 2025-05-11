import pytest
from rest_framework.serializers import ValidationError as DRFValidationError
from base.serializers.models import (
    UserSerializer, UserSimpleSerializer, AddressSerializer,
    CategorySerializer, ItemSerializer, ProductSerializer, ServiceSerializer,
    ItemCategorySerializer, OrderItemSerializer, OrderSerializer,
    PaymentSerializer, CartItemSerializer, CartSerializer, CartLogSerializer
)
from base.models import (
    Address, Category, Item, ItemCategory,
    Order, OrderItem, Payment, Cart, CartItem
)
pytestmark = [pytest.mark.django_db]

class TestUserSerializers:
    def test_user_serializer_password_hashed(self):
        data = {
            'username': 'u',
            'password': 'rawpass',
            'phone_number': '1234567890',
            'gender': 'Other',
            'date_of_birth': '2000-01-01',
        }
        serializer = UserSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        user = serializer.save()
        assert user.check_password('rawpass')

    def test_user_serializer_updates_fields_and_password(self, user):
        payload = {
            "username": "new_username",
            "password": "new_password"
        }
        serializer = UserSerializer(instance=user, data=payload, partial=True)
        assert serializer.is_valid(), serializer.errors
        updated_user = serializer.save()
        assert updated_user.username == "new_username"
        assert updated_user.check_password("new_password")

    def test_user_simple_serializer(self, user):
        user.username = 'alice'
        user.save()
        data = UserSimpleSerializer(user).data
        assert data == {'id': user.id, 'username': 'alice'}

class TestAddressCategorySerializers:
    def test_address_serializer(self, user):
        addr = Address.objects.create(
            user=user, address_line_1='123', address_line_2='', city='City',
            state_province='ST', postal_code='12345', country='US'
        )
        data = AddressSerializer(addr).data
        assert data['user']['username'] == user.username
        assert data['city'] == 'City'

    def test_category_full_path(self):
        root = Category.objects.create(name='A')
        child = Category.objects.create(name='B', parent=root)
        data = CategorySerializer(child).data
        assert data['full_path'] == 'A > B'

class TestItemProductServiceSerializers:
    def test_item_serializer(self, user):
        item = Item.objects.create(name='X', price_cents=100, currency='USD', seller=user)
        data = ItemSerializer(item).data
        assert data['name'] == 'X'

    def test_product_validate_quantity(user):
        serializer = ProductSerializer(data={'quantity': -1, 'price_cents': 0, 'currency': 'USD'})
        with pytest.raises(DRFValidationError):
            serializer.is_valid(raise_exception=True)

    def test_product_valid_quantity_passes(self, user):
        serializer = ProductSerializer(data={
            "name": "Test Product",
            "quantity": 5,
            "price_cents": 1000,
            "currency": "USD",
            "seller": user.id
        })
        assert serializer.is_valid(), serializer.errors

    def test_service_valid_duration_passes(self, user):
        serializer = ServiceSerializer(data={
            "name": "Cleaning Service",
            "service_type": "Cleaning",
            "service_duration": 30,
            "price_cents": 2000,
            "currency": "USD",
            "seller": user.id
        })
        assert serializer.is_valid(), serializer.errors

class TestItemCategoryOrderSerializers:
    def test_item_category_serializer(self, user, product_factory):
        prod = product_factory(seller=user)
        cat = Category.objects.create(name='C')
        ic = ItemCategory.objects.create(item=prod, category=cat)
        data = ItemCategorySerializer(ic).data
        assert data['item']['id'] == prod.id
        assert data['category']['full_path'] == 'C'

    def test_order_item_serializer_total_price(self, user, product_factory):
        prod = product_factory(seller=user, price_cents=250)
        order = Order.objects.create(user=user)
        oi = OrderItem.objects.create(order=order, item=prod, quantity=4, price_cents=prod.price_cents)
        data = OrderItemSerializer(oi).data
        assert data['total_price'] == 4 * 250 / 100

    def test_order_serializer_nested_create(self, user, product_factory):
        prod = product_factory(seller=user, price_cents=100)
        payload = {
            'user': user.id,
            'order_items': [{'item': prod.id, 'quantity': 3, 'price_cents': 100}]
        }
        serializer = OrderSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        assert order.total_price_cents == 3 * 100

    def test_payment_serializer(self, user):
        order = Order.objects.create(user=user)
        payment = Payment.objects.create(order=order, amount_cents=500)
        data = PaymentSerializer(payment).data
        assert data['order']['id'] == order.id

    def test_cart_item_serializer(self, user, product_factory):
        cart = Cart.objects.create(user=user)
        prod = product_factory(seller=user)
        ci = CartItem.objects.create(cart=cart, item=prod, quantity=2, price_snapshot_cents=prod.price_cents)
        data = CartItemSerializer(ci).data
        assert data['quantity'] == 2

    def test_cart_serializer(self, user):
        cart = Cart.objects.create(user=user)
        data = CartSerializer(cart).data
        assert 'cart_items' in data
        assert data['total_price_cents'] == 0

    def test_order_serializer_calculates_total(self, user, product_factory):
        product = product_factory(price_cents=1_000, seller=user)
        payload = {
            "user": user.id,
            "order_items": [
                {"item": product.id, "quantity": 2, "price_cents": product.price_cents}
            ]
        }
        serializer = OrderSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        assert instance.total_price_cents == 2_000


def test_cart_log_serializer(cart_activity_log_factory):
    log = cart_activity_log_factory()
    data = CartLogSerializer(log).data
    assert data["user"] == str(log.user)
    assert data["item"] == str(log.item)
    assert data["action"] == "ADD"
