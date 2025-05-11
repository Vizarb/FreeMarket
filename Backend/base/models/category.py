from django.db import models
from .base_modle import BaseModel

# Category Model Refactor
class Category(BaseModel):
    """
    Model representing product categories, with support for nested categories.
    """
    name = models.CharField(max_length=100)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name="subcategories"
    )

    def __str__(self):
        return self.name
