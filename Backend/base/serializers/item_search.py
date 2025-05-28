from rest_framework import serializers
from base.models.views import ItemSearchView

class ItemSearchSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ItemSearchView
        fields = '__all__'
        read_only_fields = ['search_vector']

