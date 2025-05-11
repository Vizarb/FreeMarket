from rest_framework import serializers
from ..models import (
    CustomUser, Address, Category, Item, Product, Service, ItemCategory,
    Order, OrderItem, Payment, Cart, CartItem
)
from base.models.logs.cart_activity_log import CartActivityLog
# User Serializer
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="name"  # ✅ Returns group names instead of IDs
    )
    user_permissions = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field="codename"  # ✅ Returns permission codenames instead of IDs
    )

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "password",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "gender",
            "date_of_birth",
            "is_superuser",
            "is_staff",
            "is_active",
            "date_joined",
            "last_login",
            "groups",
            "user_permissions",
        ]
        extra_kwargs = {
            'first_name':    {'required': False, 'allow_blank': True},
            'last_name':     {'required': False, 'allow_blank': True},
            'email':         {'required': False, 'allow_blank': True},
            'phone_number':  {'required': False, 'allow_blank': True},
            'gender':        {'required': False, 'allow_blank': True},
            'date_of_birth': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        raw = validated_data.pop('password')
        # create_user will call set_password() internally
        return CustomUser.objects.create_user(password=raw, **validated_data)

    def update(self, instance, validated_data):
        raw = validated_data.pop('password', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if raw:
            # fallback to set_password for updates
            instance.set_password(raw)
        instance.save()
        return instance


class UserSimpleSerializer(serializers.ModelSerializer):
    """
    Simplified User Serializer
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'username']  # Only return id and username

# Address Serializer
class AddressSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Address
        fields = ['id', 'user', 'address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code', 'country']

# Category Serializer
class CategorySerializer(serializers.ModelSerializer):
    full_path = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'full_path', 'created_at', 'updated_at']
        
    def get_full_path(self, obj):
        if obj.parent:
            return f"{self.get_full_path(obj.parent)} > {obj.name}"
        return obj.name

# Item Serializer
class ItemSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Item
        fields = '__all__'

# Product Serializer
class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = '__all__'

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive.")
        return value

# Service Serializer
class ServiceSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Service
        fields ='__all__'
    
    def validate_service_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be positive.")
        return value

# Item Category Serializer
class ItemCategorySerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = ItemCategory
        fields = ['id', 'item', 'category', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual items within an order.
    """
    item_name = serializers.CharField(source='item.name', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'item_name', 'quantity', 'price_cents', 'total_price']

    def get_total_price(self, obj):
        """
        Calculate the total price for the OrderItem
        """
        return (obj.quantity * obj.price_cents) / 100  # Convert cents to dollars


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for orders containing multiple order items.
    """
    user = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all(), required=False)
    order_items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'order_items', 'total_price_cents', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total_price_cents', 'created_at', 'updated_at']

    def create(self, validated_data):
        """
        Custom create method to handle nested OrderItems creation
        """
        order_items_data = validated_data.pop('order_items', [])
        order = Order.objects.create(**validated_data)

        # Creating order items in bulk for performance
        order_items = [
            OrderItem(
                order=order,
                item=item_data['item'],
                quantity=item_data['quantity'],
                price_cents=item_data['price_cents']
            ) for item_data in order_items_data
        ]
        OrderItem.objects.bulk_create(order_items)
        
        # Calculate total price
        order.calculate_total()
        
        return order


# Payment Serializer
class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

# Cart Item Serializer
class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for Cart Items
    """
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())  # Expect item as ID
    item_name = serializers.CharField(source='item.name', read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'item_id', 'item_name', 'quantity']

# Cart Serializer
class CartSerializer(serializers.ModelSerializer):
    """
    Serializer for Cart
    """
    user = UserSimpleSerializer(read_only=True)  # Use simplified user serializer
    cart_items = CartItemSerializer(many=True, read_only=True)
    total_price_cents = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'cart_items', 'total_price_cents', 'created_at', 'updated_at']

class CartLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    cart = serializers.StringRelatedField()
    item = serializers.StringRelatedField()

    class Meta:
        model = CartActivityLog
        fields = '__all__'

