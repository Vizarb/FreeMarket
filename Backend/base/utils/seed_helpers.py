from django.utils.timezone import now

def with_timestamps(instances):
    """
    Adds `created_at` and `updated_at` timestamps to a list of model instances.
    Use this before `bulk_create()` for models inheriting from BaseModel.
    """
    now_ = now()
    for instance in instances:
        if hasattr(instance, "created_at") and not instance.created_at:
            instance.created_at = now_
        if hasattr(instance, "updated_at") and not instance.updated_at:
            instance.updated_at = now_
            
    return instances
