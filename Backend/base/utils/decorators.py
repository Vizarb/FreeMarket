import logging
from functools import wraps
from django.utils.timezone import now
from django.db import transaction

logger = logging.getLogger('freemarketbackend')

def log_user_activity(actions_metadata, status='success', log_to_db=True):
    """
    Decorator to log multiple user activities with different metadata functions.

    Parameters:
    - actions_metadata (dict): A dictionary where keys are action types (e.g., 'add_product') and values are corresponding metadata functions.
    - status (str): Status of the action ('success', 'failed', 'pending').
    - log_to_db (bool): Whether to log to the database.
    """

def log_user_activity(actions_metadata, status='success', log_to_db=True):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            from django.apps import apps
            UserActivityLog = apps.get_model('base', 'UserActivityLog')

            request = args[0].request if hasattr(args[0], 'request') else args[0]
            user = request.user if request.user.is_authenticated else None
            ip_address = request.META.get('REMOTE_ADDR', 'Unknown')
            timestamp = now()

            response = func(*args, **kwargs)

            for action, metadata_func in actions_metadata.items():
                metadata = metadata_func(request, *args, **kwargs) if metadata_func else {}
                description = f"Action '{action}' performed by {user.username if user else 'Anonymous'}"
                log_data = {
                    'user': user,
                    'action': action,
                    'description': description,
                    'metadata': metadata,
                    'status': status,
                    'ip_address': ip_address,
                    'created_at': timestamp
                }
                logger.info(description, extra=log_data)
                if log_to_db:
                    UserActivityLog.objects.create(**log_data)

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
