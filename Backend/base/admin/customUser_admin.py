from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from base.models.user import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username', 'email', 'phone_number', 'gender',
        'date_of_birth', 'display_groups', 'is_staff', 'is_active'
    )
    list_filter = ('gender', 'is_staff', 'is_active', 'date_of_birth', 'date_joined')
    search_fields = ('username', 'email', 'phone_number')
    ordering = ('username',)

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('phone_number', 'gender', 'date_of_birth')}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('phone_number', 'gender', 'date_of_birth')}),
    )

    def display_groups(self, obj):
        return ", ".join(group.name for group in obj.groups.all())
    display_groups.short_description = 'Groups'
