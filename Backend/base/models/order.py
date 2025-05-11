from django.conf import settings
from django.db import models
from django.db.models import CheckConstraint, Q, Sum, F
from django.contrib.postgres.indexes import GinIndex
from .base_modle import BaseModel
from .item import Item
from .cart import Cart, CartItem

class OrderStatus(models.TextChoices):
    PENDING   = "PENDING", "Pending"
    PAID      = "PAID",    "Paid"
    SHIPPED   = "SHIPPED", "Shipped"
    DELIVERED = "DELIVERED","Delivered"
    CANCELLED = "CANCELLED","Cancelled"

class Order(BaseModel):
    user = models.ForeignKey(
            settings.AUTH_USER_MODEL,
            on_delete=models.CASCADE,
            related_name="orders"
            )
    status = models.CharField(
            max_length=20,
            choices=OrderStatus.choices,
            default=OrderStatus.PENDING
            )
    total_price_cents  = models.BigIntegerField(default=0)
    metadata           = models.JSONField(null=True, blank=True)

    def calculate_total(self):
        total = self.order_items.aggregate(
            total=Sum(F('quantity') * F('price_cents'))
        )['total'] or 0
        self.total_price_cents = total
        self.save(update_fields=['total_price_cents'])

    def convert_cart_to_order(self, cart: Cart):
        items = cart.cart_items.all()
        order_items = [
            OrderItem(
                order=self,
                item=ci.item,
                quantity=ci.quantity,
                price_cents=ci.price_snapshot_cents
            )
            for ci in items
        ]
        OrderItem.objects.bulk_create(order_items)
        cart.cart_items.delete()
        self.calculate_total()

    def __str__(self):
        return f"Order #{self.id} – {self.user.username} – {self.status}"

    class Meta:
        indexes = [
            # only extra index; the FK on `user` is auto-indexed
            GinIndex(fields=['metadata'], name='gin_order_metadata'),
        ]


class OrderItem(BaseModel):
    order       = models.ForeignKey(
                      Order,
                      on_delete=models.CASCADE,
                      related_name="order_items"
                  )
    item        = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity    = models.PositiveIntegerField()
    price_cents = models.BigIntegerField()

    class Meta:
        constraints = [
            CheckConstraint(
                check=Q(quantity__gt=0),
                name="quantity_positive"
            ),
        ]

    def __str__(self):
        return f"{self.quantity}×{self.item.name} in Order #{self.order.id}"
