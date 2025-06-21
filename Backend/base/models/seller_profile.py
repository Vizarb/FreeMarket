# base/models/seller_profile.py
from django.db import models
from django.utils.text import slugify
from base.enums import ThemePreset
from base.models.user import CustomUser

class SellerProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="seller_profile",
        unique=True
    )
    shop_name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    theme_id = models.CharField(max_length=20, choices=ThemePreset.choices, default=ThemePreset.CLASSIC)
    banner_image = models.ImageField(upload_to="shop_banners/", blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.shop_name)
            slug = base_slug
            count = 1
            while SellerProfile.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.shop_name or f"Seller {self.user.username}"
