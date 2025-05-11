from rest_framework import serializers
from ..models.views import (CartOverview, ItemDetails, MostActiveUsers, OrderDetails, OrderItemDetails, TopSellingProducts, UserOrderHistory)

class BaseSearchSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data.pop('search_vector', None)  # 🧼 Remove internal full-text search field
        return data


class ItemDetailsSerializer(BaseSearchSerializer):
    type = serializers.SerializerMethodField()
    class Meta:
        model = ItemDetails
        fields = '__all__'

    def get_type(self, obj):
        """Efficiently determine the subclass type using ContentType"""
        return obj.__class__.__name__.lower() 

class UserOrderHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserOrderHistory
        fields = '__all__'


class CartOverviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartOverview
        fields = '__all__'
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        print("Serialized Cart Overview Data:", data)  # Debugging line
        return data


class TopSellingProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopSellingProducts
        fields = '__all__'


class MostActiveUsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = MostActiveUsers
        fields = '__all__'

class OrderItemDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItemDetails
        fields = '__all__'

class OrderDetailsSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    id = serializers.IntegerField()  # ✅ Explicitly include it

    class Meta:
        model = OrderDetails
        fields = ['id', 'user_id', 'customer', 'status', 'total_price_cents', 'created_at', 'updated_at', 'order_items']

    def get_order_items(self, obj):
        order_items = OrderItemDetails.objects.filter(order_id=obj.id)
        return OrderItemDetailsSerializer(order_items, many=True).data
