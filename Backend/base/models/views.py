from django.db import models

class ItemDetails(models.Model):
    item_id = models.IntegerField(primary_key=True)  # Views do not auto-generate primary keys
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    price_cents = models.BigIntegerField()
    currency = models.CharField(max_length=10)
    seller = models.CharField(max_length=255)
    categories = models.TextField()
    search_vector = models.TextField()

    class Meta:
        managed = False  # Django won't manage this table (it's a DB view)
        db_table = "item_details"

class UserOrderHistory(models.Model):
    order_id = models.IntegerField(primary_key=True)
    user_id = models.IntegerField()
    customer = models.CharField(max_length=255)
    status = models.CharField(max_length=50)
    total_price_cents = models.BigIntegerField()
    created_at = models.DateTimeField()
    total_items = models.IntegerField()

    class Meta:
        managed = False
        db_table = "user_order_history"


class CartOverview(models.Model):
    cart_item_id  = models.IntegerField()
    cart_id = models.IntegerField(primary_key=True)
    user_id = models.IntegerField()
    owner = models.CharField(max_length=255)
    item_id = models.IntegerField()
    item_name = models.CharField(max_length=255)
    total_quantity = models.PositiveIntegerField()
    latest_price  = models.BigIntegerField()
    item_type = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = "cart_overview"



class TopSellingProducts(models.Model):
    item_id = models.IntegerField(primary_key=True)
    product_name = models.CharField(max_length=255)
    total_sold = models.IntegerField()
    total_revenue = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = "top_selling_products"


class MostActiveUsers(models.Model):
    user_id = models.IntegerField(primary_key=True)
    username = models.CharField(max_length=255)
    total_orders = models.IntegerField()
    total_spent = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = "most_active_users"

class OrderDetails(models.Model):
    id = models.IntegerField(primary_key=True)
    user_id = models.IntegerField()
    customer = models.CharField(max_length=255)
    status = models.CharField(max_length=20)
    total_price_cents = models.BigIntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False 
        db_table = "order_details"

    def __str__(self):
        return f"Order #{self.id} - {self.customer} - {self.status}"

class OrderItemDetails(models.Model):
    id = models.IntegerField(primary_key=True)
    order_id = models.IntegerField()
    item_id = models.IntegerField()
    item_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    price_cents = models.BigIntegerField()

    class Meta:
        managed = False
        db_table = "order_item_details"

    def __str__(self):
        return f"{self.quantity} of {self.item_name} in Order #{self.order_id}"

