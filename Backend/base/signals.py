from django.db.models.signals import post_migrate
from django.contrib.auth.models import Group, Permission
from django.dispatch import receiver

@receiver(post_migrate)
def assign_all_permissions_to_admin(sender, **kwargs):
    admin, _ = Group.objects.get_or_create(name='Admin')
    perms = Permission.objects.all()
    admin.permissions.set(perms)