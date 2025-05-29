# base/admin/user_activity_log_admin.py
from django.contrib import admin
from base.models.logs.user_activity_logs import UserActivityLog

@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = (
        "user", "action", "status", "created_at", "ip_address"
    )
    list_filter = (
        "action", "status", "created_at"
    )
    search_fields = (
        "user__username", "description", "metadata"
    )
    readonly_fields = (
        "user", "action", "status", "created_at", "ip_address", "description", "metadata"
    )
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False  # prevent manual creation

    def has_change_permission(self, request, obj=None):
        return False  # prevent editing log entries
