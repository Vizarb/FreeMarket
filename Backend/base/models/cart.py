# src/models/cart.py

from django.db import models, transaction
from django.db.models import Sum, F
from django.conf import settings
from django.core.exceptions import ValidationError

from base.utils.decorators import log_cart_action
from .base_modle import BaseModel
from .item import Item


class Cart(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart"
    )
    total_price_cents = models.BigIntegerField(default=0)  # Store the total price

    def calculate_total(self):
        """
        Efficiently calculates the total price for all items in the cart.
        """
        total = self.cart_items.aggregate(
            total=Sum(F('quantity') * F('price_snapshot_cents'))
        )['total'] or 0
        Cart.objects.filter(id=self.id).update(total_price_cents=total)  # ✅ Avoids multiple `.save()`

    @log_cart_action('ADD')
    def add_item(self, item, quantity=1):
        with transaction.atomic():
            cart_item = CartItem.all_objects.filter(cart=self, item=item).first()

            if cart_item:
                if cart_item.is_deleted:
                    cart_item.restore()
                    cart_item.quantity = quantity
                    cart_item.price_snapshot_cents = item.price_cents
                else:
                    cart_item.quantity += quantity
                cart_item.save()
            else:
                CartItem.objects.create(
                    cart=self,
                    item=item,
                    quantity=quantity,
                    price_snapshot_cents=item.price_cents
                )

            self.calculate_total()

    @log_cart_action('REMOVE')
    def remove_item(self, item):
        with transaction.atomic():
            cart_item = CartItem.objects.filter(cart=self, item=item).first()
            if cart_item and not cart_item.is_deleted:
                cart_item.is_deleted = True
                cart_item.save()
                self.calculate_total()

    @log_cart_action('UPDATE')
    def update_quantity(self, item, quantity):
        if quantity < 1:
            self.remove_item(item)
        else:
            CartItem.objects.filter(cart=self, item=item).update(quantity=quantity)
        self.calculate_total()

    @log_cart_action('CLEAR')
    def clear_cart(self):
        """
        Clears all items from the cart.
        """
        self.cart_items.all().delete()
        # Recalculate total price
        self.calculate_total()

    def __str__(self):
        return f"Cart for {self.user.username} - Total: ${self.total_price_cents / 100:.2f}"
        

class CartItem(BaseModel):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="cart_items")
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_snapshot_cents = models.IntegerField(default=0)

    def clean(self):
        """
        Custom validation for CartItem
        """
        if self.quantity <= 0:
            raise ValidationError("Quantity must be greater than zero.")
        if self.price_snapshot_cents < 0:
            raise ValidationError("Price cannot be negative.")

    def __str__(self):
        return f"{self.quantity} of {self.item} in {self.cart}"

    def save(self, *args, **kwargs):
        # if no snapshot set, capture the current item price
        if not self.price_snapshot_cents:
            self.price_snapshot_cents = self.item.price_cents
        super().save(*args, **kwargs)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(quantity__gt=0), name="cart_item_quantity_positive"),
            models.UniqueConstraint(fields=['cart', 'item'], name="unique_cart_item")
        ]