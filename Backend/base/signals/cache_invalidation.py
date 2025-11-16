
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from base.models.item import Item
from base.utils.cache_utils import delete_prefix
from base.models.category import Category  # adjust if your path differs

@receiver([post_save, post_delete], sender=Category)
def invalidate_category_list(sender, instance: Category, **kwargs):
    # This deletes keys like freemarket:category:list:v1:*
    delete_prefix(["category", "list"])

@receiver([post_save, post_delete], sender=Item)
def invalidate_item_detail(sender, instance: Item, **kwargs):
    # Clear seller-detail cache (if you add it)
    delete_prefix(["item", instance.pk, "detail"])
    # Clear buyer-facing slug cache
    if instance.slug:
        delete_prefix(["itemdetails", instance.slug, "detail"])