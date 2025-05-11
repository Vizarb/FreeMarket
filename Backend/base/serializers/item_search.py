from rest_framework import serializers
from base.models import Item

class ItemSearchSerializer(serializers.ModelSerializer):
    item_type = serializers.SerializerMethodField()
    quantity = serializers.SerializerMethodField()
    service_duration = serializers.SerializerMethodField()
    service_type = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ['search_vector']

    def get_item_type(self, obj):
        if hasattr(obj, 'product'):
            return 'product'
        elif hasattr(obj, 'service'):
            return 'service'
        return 'unknown'

    def get_quantity(self, obj):
        if hasattr(obj, 'product'):
            return obj.product.quantity
        return None

    def get_service_duration(self, obj):
        if hasattr(obj, 'service'):
            return obj.service.service_duration
        return None

    def get_service_type(self, obj):
        if hasattr(obj, 'service'):
            return obj.service.service_type
        return None
