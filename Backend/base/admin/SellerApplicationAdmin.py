# base/admin.py
from django.contrib import admin
from base.models.seller_application import SellerApplication

@admin.register(SellerApplication)
class SellerApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "submitted_at", "reviewed_at")
    list_filter = ("status",)
    search_fields = ("user__username",)
