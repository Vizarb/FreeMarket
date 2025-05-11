# src/utils/metadata.py

from django.apps import apps

def generate_metadata(request, model_class, object_id_key, fields_builder, instance=None):
    """
    Generate metadata from instance if provided, else fetch from database using ID.
    """
    if instance is None:
        object_id = (
            request.GET.get(object_id_key)
            or request.POST.get(object_id_key)
            or request.data.get(object_id_key)
            or request.query_params.get(object_id_key)
            or request.parser_context.get('kwargs', {}).get(object_id_key)
        )
        if not object_id:
            return {'error': f"{object_id_key} not provided."}

        try:
            instance = model_class.objects.get(id=object_id)
        except model_class.DoesNotExist:
            return {'error': f"{model_class.__name__} with ID {object_id} does not exist."}

    return fields_builder(instance)

def generate_order_metadata(request, *args, **kwargs):
    Order = apps.get_model('base', 'Order')
    return generate_metadata(
        request,
        model_class=Order,
        object_id_key='order_id',
        fields_builder=lambda order: {
            'order_id': order.id,
            'status': order.status,
            'total_price_cents': order.total_price_cents,
            'order_items': [
                {
                    'item_id': item.item.id,
                    'item_name': item.item.name,
                    'quantity': item.quantity,
                    'price_cents': item.price_cents
                }
                for item in order.order_items.all()
            ]
        },
        instance=kwargs.get('instance')
    )

def generate_item_metadata(request, *args, **kwargs):
    Item = apps.get_model('base', 'Item')
    return generate_metadata(
        request,
        model_class=Item,
        object_id_key='item_id',
        fields_builder=lambda item: {
            'item_id': item.id,
            'item_name': item.name,
            'price_cents': item.price_cents,
            'currency': item.currency,
            'seller': item.seller.username,
            'categories': [cat.name for cat in item.categories.all()] if hasattr(item, 'categories') else []
        },
        instance=kwargs.get('instance')
    )

def generate_service_metadata(request, *args, **kwargs):
    Service = apps.get_model('base', 'Service')
    return generate_metadata(
        request,
        model_class=Service,
        object_id_key='service_id',
        fields_builder=lambda service: {
            'service_id': service.id,
            'service_name': service.name,
            'price_cents': service.price_cents,
            'currency': service.currency,
            'service_duration': service.service_duration,
            'service_type': service.service_type,
            'seller': service.seller.username,
            'categories': [cat.name for cat in service.categories.all()] if hasattr(service, 'categories') else []
        },
        instance=kwargs.get('instance')
    )

def generate_product_metadata(request, *args, **kwargs):
    Product = apps.get_model('base', 'Product')
    return generate_metadata(
        request,
        model_class=Product,
        object_id_key='product_id',
        fields_builder=lambda product: {
            'product_id': product.id,
            'product_name': product.name,
            'quantity': product.quantity,
            'price_cents': product.price_cents,
            'currency': product.currency,
            'seller': product.seller.username,
            'categories': [cat.name for cat in product.categories.all()] if hasattr(product, 'categories') else []
        },
        instance=kwargs.get('instance')
    )
