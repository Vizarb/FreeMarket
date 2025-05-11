from django.contrib import admin
from base.models.address import Address

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'address_line_1', 'city', 'state_province', 'postal_code', 'country')
    list_filter = ('country', 'city')
    search_fields = ('user__username', 'address_line_1', 'city', 'postal_code')
