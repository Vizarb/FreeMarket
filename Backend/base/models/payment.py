from django.db import models
from .base_modle import BaseModel
from .order import Order



class Payment(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    amount_cents = models.BigIntegerField()
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
