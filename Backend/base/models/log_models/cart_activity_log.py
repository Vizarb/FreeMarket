from django.db import models
from base.models.user import CustomUser

class CartActivityLog(models.Model):
    ACTION_CHOICES = [
        ('ADD', 'Add'),
        ('REMOVE', 'Remove'),
        ('UPDATE', 'Update'),
        ('CLEAR', 'Clear'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    cart = models.ForeignKey('Cart', on_delete=models.CASCADE)
    item = models.ForeignKey('Item', on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.user} {self.action} {self.item} x{self.quantity} at {self.timestamp}"
