import logging
from functools import wraps
from django.utils.timezone import now
from django.db import transaction

from base.models.log_models.user_activity_logs import UserActivityLog

logger = logging.getLogger('freemarketbackend')

def log_user_activity(action: str, status='success', metadata_func=None):
    """
    Logs a single action per view method, optionally generating metadata.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):
            response = func(self, request, *args, **kwargs)

            # Only log if successful
            if response.status_code < 400:
                metadata = metadata_func(request, *args, **kwargs) if metadata_func else {}

                UserActivityLog.objects.create(
                    user=request.user if request.user.is_authenticated else None,
                    action=action,
                    status=status,
                    description=f"User {request.user} performed {action}",
                    metadata=metadata,
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    created_at=now()
                )
            return response
        return wrapper
    return decorator

def log_cart_action(action: str):
    def decorator(method):
        @wraps(method)
        def wrapper(self, *args, **kwargs):
            from django.apps import apps
            CartActivityLog = apps.get_model('base', 'CartActivityLog')
            item = kwargs.get('item') or (args[0] if args else None)

            with transaction.atomic():
                result = method(self, *args, **kwargs)

                if item:  # Only log if item exists
                    CartActivityLog.objects.create(
                        user=self.user,
                        cart=self,
                        item=item,
                        action=action,
                        quantity=kwargs.get('quantity') or getattr(item, 'quantity', None),
                        metadata={'source': 'decorator'}
                    )
                return result
        return wrapper
    return decorator




def ensure_list(func):
    """Decorator to ensure that functions always return a list instead of None."""
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result if result is not None else []
    return wrapper
