from django.conf import settings
from django.db import models
from django.db.models import Q, CheckConstraint
from .base_modle import BaseModel
from .category import Category
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex, BTreeIndex
from django.utils.text import slugify

class Currency(models.TextChoices):
    USD = "USD", "US Dollar"
    EUR = "EUR", "Euro"
    GBP = "GBP", "British Pound"

    def __str__(self):
        return self.label

# Item Models Refactor
class Item(BaseModel):
    """
    Represents a general item that can be a product or service.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price_cents = models.BigIntegerField()
    currency = models.CharField(max_length=10, choices=Currency.choices)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="items")
    categories = models.ManyToManyField(Category, related_name="items", through="ItemCategory")
    search_vector = SearchVectorField(null=True, editable=False)
    metadata = models.JSONField(null=True, blank=True)
    image = models.ImageField(upload_to='items/', null=True, blank=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    class Meta:
        indexes = [
        # GIN indexes for full-text search and JSON filtering
        GinIndex(fields=['search_vector'], name='gin_item_search_vector'),
        GinIndex(fields=['metadata'], name='gin_item_metadata'),

        # BTree indexes for fast filtering and sorting
        BTreeIndex(fields=['name'], name='idx_item_name'),
        BTreeIndex(fields=['created_at'], name='idx_item_created_at'),
        BTreeIndex(fields=['price_cents'], name='idx_item_price'),
        models.Index(fields=["slug"], name="idx_item_slug", condition=Q(is_deleted=False)),
        BTreeIndex(fields=['seller'], name='idx_item_seller'),
        BTreeIndex(fields=['currency'], name='idx_item_currency'),
        BTreeIndex(fields=['is_deleted'], name='idx_item_is_deleted'),
    ]
    constraints = [
        models.CheckConstraint(check=models.Q(price_cents__gte=0), name='item_price_non_negative'),
        models.UniqueConstraint(
            fields=["slug"], name="unique_slug_active_items", condition=Q(is_deleted=False)
        )
    ]

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Item.all_objects.filter(slug=slug).exclude(id=self.id).exists():
                counter += 1
                slug = f"{base_slug}-{counter}"
            self.slug = slug
        super().save(*args, **kwargs)


class Product(Item):
    """
    Represents a physical product derived from an Item.
    """
    quantity = models.PositiveIntegerField(default=1)

    @classmethod
    def from_item(cls, item: Item, quantity: int):
        return cls(id=item.id, quantity=quantity)

    class Meta:
        constraints = [
            CheckConstraint(condition=Q(quantity__gte=0), name="quantity_non_negative"),
        ]

    def __str__(self):
        return f"{self.name} (Product)"

class Service(Item):
    """
    Represents a service derived from an Item.
    """
    service_duration = models.PositiveIntegerField(default=60)
    service_type = models.CharField(max_length=50, default="Other")

    @classmethod
    def from_item(cls, item: Item, service_duration: int, service_type: str):
        return cls(id=item.id, service_duration=service_duration, service_type=service_type)


    class Meta:
        constraints = [
            CheckConstraint(
                condition=Q(service_duration__gte=0) | Q(service_duration__isnull=True),
                name="service_duration_valid",
            ),
        ]

    def __str__(self):
        return f"{self.name} (Service)"
    

class ItemCategory(BaseModel):
    """
    Intermediate model for the many-to-many relationship between Items and Categories.
    """
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
            fields=["item", "category"], name="unique_item_category", condition=Q(is_deleted=False)
        )
        ]

    def __str__(self):
        return f"{self.item.name} in {self.category.name}"

