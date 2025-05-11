from django.contrib import admin
from base.models.cart import Cart, CartItem

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1
    fields = ('item', 'quantity')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__username',)
    inlines = [CartItemInline]
