


from django.contrib.auth.models import BaseUserManager, Group
from base.models.base_modle import SoftDeleteManager
from base.enums import ThemePreset

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
        from base.models.seller_profile import SellerProfile

        seller_group, _ = Group.objects.get_or_create(name='Seller')
        user.groups.add(seller_group)

        #  Auto-create SellerProfile with defaults
        if not hasattr(user, 'seller_profile'):
            SellerProfile.objects.create(
                user=user,
                shop_name=f"Shop of {user.username}",
                slug=None,  # triggers auto-generation if your model uses `AutoSlugField`
                theme_id=ThemePreset.CLASSIC,
                bio="Welcome to my shop!"
            )

        user.save()
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
