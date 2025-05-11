from django.contrib import admin
from base.models.item import Service

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'service_type', 'service_duration', 'price_cents', 'seller')
    list_filter = ('service_type',)
    search_fields = ('name', 'seller__username')

    def item_name(self, obj):
        return obj.name

    def price_cents(self, obj):
        return obj.price_cents

    def seller(self, obj):
        return obj.seller.username
