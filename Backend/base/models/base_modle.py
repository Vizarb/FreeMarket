from django.db import models
from django.utils.timezone import now

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def deleted(self):
        return super().get_queryset().filter(deleted_at__isnull=False)

    def all_with_deleted(self):
        return super().get_queryset()

class BaseModel(models.Model):
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(default=now)
    updated_at = models.DateTimeField(default=now)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    def save(self, *args, **kwargs):
        self.updated_at = now()
        super().save(*args, **kwargs)

    def soft_delete(self):
        self._toggle_deletion(True)

    def restore(self):
        self._toggle_deletion(False)

    def _toggle_deletion(self, delete: bool):
        self.deleted_at = now() if delete else None
        self.is_deleted = delete
        self.save()

    def delete(self, using=None, keep_parents=False):
        self.soft_delete()

    @classmethod
    def bulk_soft_delete(cls, queryset):
        cls._bulk_toggle_deletion(queryset, True)

    @classmethod
    def bulk_restore(cls, queryset):
        cls._bulk_toggle_deletion(queryset, False)

    @classmethod
    def _bulk_toggle_deletion(cls, queryset, delete: bool):
        queryset.update(
            deleted_at=now() if delete else None,
            is_deleted=delete
        )

    def save_metadata(self, request, metadata_function, id_field_name):
        """
        Utility to generate and save metadata snapshot for this instance.
        Automatically injects model _type into metadata.
        """
        metadata = metadata_function(request, instance=self, object_id_key=id_field_name)
        metadata['_type'] = self.__class__.__name__
        self.metadata = metadata
        self.save(update_fields=['metadata'])

    class Meta:
        abstract = True
