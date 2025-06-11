from django.db import models
from base.enums import ActionStatus, UserAction
from base.models.user import CustomUser

class UserActivityLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    action = models.CharField(max_length=50, choices=UserAction.choices)
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=ActionStatus.choices, default=ActionStatus.SUCCESS)

    class Meta:
        indexes = [
            models.Index(fields=['user'], name='idx_log_user'),
            models.Index(fields=['action'], name='idx_log_action'),
            models.Index(fields=['created_at'], name='idx_log_timestamp'),
        ]


    def __str__(self):
        return f'{self.user.username if self.user else "Anonymous"} - {self.action} - {self.status}'
