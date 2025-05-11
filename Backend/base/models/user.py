# users/models.py  (or wherever your CustomUser lives)

from django.contrib.auth.models import AbstractUser, UserManager, Group
from django.db import models
from base.enums import Gender

class CustomUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        """Always create a Buyer by default."""
        user = super().create_user(username, email, password, **extra_fields)
        buyer_group, _ = Group.objects.get_or_create(name='Buyer')
        user.groups.add(buyer_group)
        return user

    def create_seller(self, username, email=None, password=None, **extra_fields):
        """New‐account flow: Buyer + Seller."""
        user = self.create_user(username, email, password, **extra_fields)
        seller_group, _ = Group.objects.get_or_create(name='Seller')
        user.groups.add(seller_group)
        return user

    def promote_to_seller(self, user):
        """In‐place upgrade: keep Buyer, add Seller."""
        seller_group, _ = Group.objects.get_or_create(name='Seller')
        user.groups.add(seller_group)
        return user

    def create_support(self, username, email=None, password=None, **extra_fields):
        """New‐account flow: Buyer + Support."""
        user = self.create_user(username, email, password, **extra_fields)
        support_group, _ = Group.objects.get_or_create(name='Support')
        user.groups.add(support_group)
        return user

    def promote_to_support(self, user):
        """In‐place upgrade: keep Buyer, add Support."""
        support_group, _ = Group.objects.get_or_create(name='Support')
        user.groups.add(support_group)
        return user

    def create_manager(self, username, email=None, password=None, **extra_fields):
        """New‐account flow: Buyer + Manager."""
        user = self.create_user(username, email, password, **extra_fields)
        manager_group, _ = Group.objects.get_or_create(name='Manager')
        user.groups.add(manager_group)
        return user

    def promote_to_manager(self, user):
        """In‐place upgrade: keep Buyer, add Manager."""
        manager_group, _ = Group.objects.get_or_create(name='Manager')
        user.groups.add(manager_group)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        """Superuser gets Buyer + Admin + staff/superuser flags."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        user = super().create_superuser(username, email, password, **extra_fields)
        # Ensure Buyer
        buyer_group, _ = Group.objects.get_or_create(name='Buyer')
        user.groups.add(buyer_group)
        # Ensure Admin
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        user.groups.add(admin_group)
        return user

class CustomUser(AbstractUser):
    phone_number  = models.CharField(max_length=20)
    gender        = models.CharField(max_length=20, choices=Gender.choices)
    date_of_birth = models.DateField(blank=True, null=True)

    objects = CustomUserManager()

    def __str__(self):
        return self.username

    def get_roles(self):
        return list(self.groups.values_list("name", flat=True))

    def has_group(self, group_name: str) -> bool:
        return self.groups.filter(name=group_name).exists()
    
    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"

