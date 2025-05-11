from django.contrib import admin
from base.models.order import Order, OrderItem

class OrderItemInline(admin.TabularInline):  
    model = OrderItem
    extra = 1
    readonly_fields = ('price_cents',)
    fields = ('item', 'quantity', 'price_cents')
    can_delete = False  # Prevent deletion from inline

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'formatted_total_price', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'order_items__item__name')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
    readonly_fields = ('total_price_cents',)

    def formatted_total_price(self, obj):
        return f"${obj.total_price_cents / 100:.2f}"
    formatted_total_price.short_description = 'Total Price'
