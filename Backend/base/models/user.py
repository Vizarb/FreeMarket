# users/models.py  (or wherever your CustomUser lives)

from django.contrib.auth.models import AbstractUser
from django.db import models
from base.models.user_manager import CustomUserManager
from base.models.base_modle import BaseModel
from base.enums import Gender



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

