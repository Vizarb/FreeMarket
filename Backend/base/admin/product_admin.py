from django.contrib import admin
from base.models.item import Product

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'quantity', 'price_cents', 'currency', 'seller')
    list_filter = ('currency', 'quantity')
    search_fields = ('name', 'seller__username')

    def item_name(self, obj):
        return obj.name

    def price_cents(self, obj):
        return obj.price_cents

    def currency(self, obj):
        return obj.currency

    def seller(self, obj):
        return obj.seller.username
