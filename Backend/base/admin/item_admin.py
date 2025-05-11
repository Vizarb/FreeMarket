from django.contrib import admin
from ..models.item import Item

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'formatted_price', 'currency', 'seller', 'display_categories', 'created_at')
    list_filter = ('currency', 'categories', 'created_at')
    search_fields = ('name', 'seller__username')
    ordering = ('-created_at',)

    def formatted_price(self, obj):
        return f"${obj.price_cents / 100:.2f}"
    formatted_price.short_description = 'Price'

    def display_categories(self, obj):
        return ", ".join([category.name for category in obj.categories.all()])
    display_categories.short_description = 'Categories'
