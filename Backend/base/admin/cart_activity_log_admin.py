from django.contrib import admin
from base.models.log_models.cart_activity_log import CartActivityLog

@admin.register(CartActivityLog)
class CartLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'item', 'quantity', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('user__username', 'item__name', 'metadata')
    readonly_fields = ('user', 'cart', 'item', 'action', 'quantity', 'timestamp', 'metadata')

    def has_add_permission(self, request):
        return False  # Logs should not be manually added

    def has_change_permission(self, request, obj=None):
        return False  # Logs should not be edited