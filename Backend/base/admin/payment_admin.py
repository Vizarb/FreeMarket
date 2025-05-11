from django.contrib import admin
from base.models.payment import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('order', 'formatted_amount', 'payment_method', 'transaction_id', 'created_at')
    search_fields = ('order__id', 'transaction_id')
    ordering = ('-created_at',)

    def formatted_amount(self, obj):
        return f"${obj.amount_cents / 100:.2f}"
    formatted_amount.short_description = 'Amount'
