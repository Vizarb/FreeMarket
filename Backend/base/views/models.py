# views/models.py

from django.forms import ValidationError
from django.http import JsonResponse

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from base.permissions import HasRole, IsOwnerOrAdmin, ReadOnlyOrOwner
from base.views.baseviews import BaseReadOnlyViewSet, BaseViewSet
from base.models.item import Product, Service, Item
from base.models.user import CustomUser
from base.models.address import Address
from base.models.cart import Cart, CartItem
from base.models.order import Order, OrderItem
from base.models.payment import Payment
from base.models.category import Category
from base.serializers.models import (
    CartItemSerializer,
    CategorySerializer,
    OrderItemSerializer,
    ProductSerializer,
    ServiceSerializer,
    UserSerializer,
    AddressSerializer,
    CartSerializer,
    ItemSerializer,
    OrderSerializer,
    PaymentSerializer,
)
import logging
from django.db import transaction

logger = logging.getLogger('freemarketbackend')


class ItemViewSet(BaseViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated, HasRole, ReadOnlyOrOwner]
    required_roles    = ['Seller']
    filterset_fields  = ['name', 'price_cents', 'currency', 'seller']
    search_fields     = ['name', 'description']
    ordering_fields   = ['created_at', 'updated_at', 'name']


class ProductViewSet(BaseViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, HasRole, ReadOnlyOrOwner]
    required_roles    = ['Seller']
    filterset_fields  = ['name', 'quantity']
    search_fields     = ['name', 'description']
    ordering_fields   = ['created_at', 'updated_at', 'quantity']


class ServiceViewSet(BaseViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, HasRole, ReadOnlyOrOwner]
    required_roles    = ['Seller']
    filterset_fields  = ['name', 'service_duration']
    search_fields     = ['name', 'description']
    ordering_fields   = ['created_at', 'updated_at', 'service_duration']


class UserViewSet(BaseViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Admin']
    filterset_fields  = ['username', 'email']
    search_fields     = ['username', 'email']
    ordering_fields   = ['date_joined']

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AddressViewSet(BaseViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated, HasRole, IsOwnerOrAdmin]
    required_roles    = ['Buyer', 'Seller']
    filterset_fields  = ['user__username', 'city', 'country']
    search_fields     = ['address_line_1', 'city', 'state_province']
    ordering_fields   = ['created_at', 'updated_at']

    def get_queryset(self):
        # Start from BaseViewSet’s soft-deleted‐filtered queryset
        qs = super().get_queryset()
        user = self.request.user
        # Admin/staff see all
        if user.is_staff or user.groups.filter(name='Admin').exists():
            return qs
        # Others only their own
        return qs.filter(user=user)


class CategoryViewSet(BaseViewSet):
    queryset = Category.objects.select_related('parent').all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Buyer', 'Seller', 'Manager', 'Admin']
    filterset_fields  = ['name']
    search_fields     = ['name']
    ordering_fields   = ['name']

    def get_queryset(self):
        # Base soft-delete filtering
        qs = super().get_queryset().select_related('parent')
        def build_full_path(cat):
            return f"{build_full_path(cat.parent)} > {cat.name}" if cat.parent else cat.name
        for cat in qs:
            cat.full_path = build_full_path(cat)
        return qs


class CartViewSet(BaseReadOnlyViewSet):
    """
    GET /api/cart/ → returns the current user's cart
    """
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, HasRole]
    required_roles = ['Buyer']

    def get_queryset(self):
        # Apply BaseReadOnlyViewSet’s soft-delete filter then user filter
        return super().get_queryset().filter(user=self.request.user)


class CartItemViewSet(BaseViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated, HasRole]
    required_roles = ['Buyer']


    def get_queryset(self):
        # Apply BaseViewSet’s soft-delete filter then user filter
        return super().get_queryset().filter(cart__user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity', 1)
        if not item_id:
            return Response({"error": "Item ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            item = Item.objects.get(id=item_id)
            cart, _ = Cart.objects.get_or_create(user=user)
            cart.add_item(item, quantity)
            cart.save()
            cart_item = CartItem.objects.get(cart=cart, item=item)
            serializer = self.get_serializer(cart_item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Item.DoesNotExist:
            return Response({"error": "Item does not exist."}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        user = request.user
        try:
            cart_item = self.get_object()
            cart = Cart.objects.get(user=user)
            cart.update_quantity(cart_item.item, request.data.get('quantity', 1))
            cart.save()
            serializer = CartItemSerializer(cart_item)
            return Response(serializer.data)
        except Cart.DoesNotExist:
            return Response({"error": "Cart does not exist."}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        cart_item = self.get_object()
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderViewSet(BaseViewSet):
    queryset = Order.objects.all().select_related('user').prefetch_related('order_items', 'order_items__item')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, HasRole, IsOwnerOrAdmin]
    required_roles    = ['Buyer', 'Support']
    filterset_fields  = ['user__username', 'status']
    search_fields     = ['user__username', 'order_items__item__name']
    ordering_fields   = ['created_at', 'updated_at', 'total_price_cents']
    ordering          = ['-created_at']

    def get_queryset(self):
        # Ensure BaseViewSet’s soft-delete filter first
        return (
            super().get_queryset()
                .filter(user=self.request.user)
                .select_related('user')
                .prefetch_related('order_items', 'order_items__item')
                .distinct()
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            if not cart.cart_items.exists():
                raise ValidationError("Cart is empty. Cannot create an order.")
            order = Order.objects.create(user=user)
            order_items = [
                OrderItem(
                    order=order,
                    item=ci.item,
                    quantity=ci.quantity,
                    price_cents=ci.price_snapshot_cents
                )
                for ci in cart.cart_items.all()
            ]
            OrderItem.objects.bulk_create(order_items)
            order.calculate_total()
            order.status = 'PAID'
            order.save()
            cart.cart_items.all().delete()
            serializer = self.get_serializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Cart.DoesNotExist:
            return Response({"error": "No cart found for the user."}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status in ['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']:
            return Response({"error": "Cannot update an order that is already processed."}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status in ['PAID', 'SHIPPED', 'DELIVERED']:
            return Response({"error": "Cannot cancel an order that is already processed."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'CANCELLED'
        order.save()
        return Response({"status": "Order cancelled."}, status=status.HTTP_200_OK)


class OrderItemViewSet(BaseViewSet):
    queryset = OrderItem.objects.all().select_related('order', 'item')
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated, HasRole, IsOwnerOrAdmin]
    required_roles    = ['Buyer']
    filterset_fields  = ['order', 'item']
    search_fields     = ['item__name', 'price_cents']
    ordering_fields   = ['created_at', 'updated_at', 'price_cents', 'quantity']
    ordering          = ['-created_at']

    def get_queryset(self):
        # Preserve BaseViewSet’s filtering before narrowing
        return (
            super().get_queryset()
                 .filter(order__user=self.request.user)
                 .distinct()
        )

    def create(self, request, *args, **kwargs):
        return Response({"error": "OrderItems can only be created through the Order endpoint."}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        order_item = self.get_object()
        if order_item.order.status in ['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']:
            return Response({"error": "Cannot update an item in an already processed order."}, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        order_item = self.get_object()
        if order_item.order.status in ['PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']:
            return Response({"error": "Cannot delete an item from an already processed order."}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


class PaymentViewSet(BaseViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, HasRole, IsOwnerOrAdmin]
    required_roles    = ['Buyer']
    filterset_fields  = ['order__id', 'payment_method']
    search_fields     = ['transaction_id']
    ordering_fields   = ['created_at', 'updated_at', 'amount_cents']


def index(request):
    logger.info(f"Index page accessed by {request.user}")
    return JsonResponse('hello', safe=False)


def test(request):
    logger.info(f"Test page accessed by {request.user}")
    return JsonResponse('hello second', safe=False)


def myproducts(request):
    logger.info(f"Fetching all products for {request.user}")
    try:
        all_products = ProductSerializer(Product.objects.all(), many=True).data
        return JsonResponse(all_products, safe=False)
    except Exception as e:
        logger.error(f"Failed to retrieve products: {str(e)}", exc_info=True)
        return JsonResponse({'error': str(e)}, status=500)
