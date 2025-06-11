# users/models.py  (or wherever your CustomUser lives)

from django.contrib.auth.models import AbstractUser, BaseUserManager, Group
from django.db import models
from base.models.base_modle import BaseModel, SoftDeleteManager
from base.enums import Gender

class CustomUserManager(SoftDeleteManager, BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("The username must be set")
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)

        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        # Add default group
        buyer_group, _ = Group.objects.get_or_create(name='Buyer')
        user.groups.add(buyer_group)

        return user
    
    def create_seller(self, username, email=None, password=None, **extra_fields):
        user = self.create_user(username, email, password, **extra_fields)
        seller_group, _ = Group.objects.get_or_create(name='Seller')
        user.groups.add(seller_group)
        return user

    def promote_to_seller(self, user):
        seller_group, _ = Group.objects.get_or_create(name='Seller')
        user.groups.add(seller_group)
        return user

    def create_support(self, username, email=None, password=None, **extra_fields):
        user = self.create_user(username, email, password, **extra_fields)
        support_group, _ = Group.objects.get_or_create(name='Support')
        user.groups.add(support_group)
        return user

    def promote_to_support(self, user):
        support_group, _ = Group.objects.get_or_create(name='Support')
        user.groups.add(support_group)
        return user

    def create_manager(self, username, email=None, password=None, **extra_fields):
        user = self.create_user(username, email, password, **extra_fields)
        manager_group, _ = Group.objects.get_or_create(name='Manager')
        user.groups.add(manager_group)
        return user

    def promote_to_manager(self, user):
        manager_group, _ = Group.objects.get_or_create(name='Manager')
        user.groups.add(manager_group)
        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        if not password:
            raise ValueError("Superusers must have a password.")

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        user = self.create_user(username, email, password, **extra_fields)

        buyer_group, _ = Group.objects.get_or_create(name='Buyer')
        admin_group, _ = Group.objects.get_or_create(name='Admin')
        user.groups.add(buyer_group, admin_group)

        return user


class CustomUser(AbstractUser, BaseModel):
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=20, choices=Gender.choices, blank=True, null=True)
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
        
        indexes = [
        models.Index(fields=['date_of_birth'], name='idx_user_dob'),
    ]

