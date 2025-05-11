from django.contrib import admin
from base.models.logs.user_activity_logs import UserActivityLog

@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'status', 'created_at', 'ip_address')  # Display key log details
    list_filter = ('action', 'status', 'created_at')  # Sidebar filters for quick navigation
    search_fields = ('user__username', 'description', 'metadata')  # Enable searching by user or log details
    ordering = ('-created_at',)  # Show the most recent logs first
