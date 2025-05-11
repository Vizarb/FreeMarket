import logging
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from base.permissions import HasRole
from base.utils.metadata import generate_product_metadata, generate_order_metadata, generate_service_metadata
from base.utils.decorators import log_user_activity

logger = logging.getLogger('freemarketbackend')

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class BaseViewSet(ModelViewSet):
    """
    ViewSet automatically provides:
    - list()         → GET 
    - retrieve()     → GET 
    - create()       → POST 
    - update()       → PUT 
    - partial_update() → PATCH 
    - destroy()      → DELETE 
    """
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_queryset(self):
        """Ensure only non-deleted records are retrieved by default."""
        return super().get_queryset().filter(deleted_at__isnull=True)

    def list(self, request, *args, **kwargs):
        logger.info(f"Listing {self.queryset.model.__name__}s requested by {request.user}")
        return super().list(request, *args, **kwargs)

    @log_user_activity(
        actions_metadata={
            'create_service': generate_service_metadata,
            'create_product': generate_product_metadata,
            'create_order': generate_order_metadata
        },
        status='success'
    )
    def create(self, request, *args, **kwargs):
        logger.info(f"Creating a new {self.queryset.model.__name__} requested by {request.user}")
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"{self.queryset.model.__name__} created successfully.")
            return response
        except Exception as e:
            logger.error(f"Failed to create {self.queryset.model.__name__}: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @log_user_activity(
        actions_metadata={
            'update_service': generate_service_metadata,
            'update_product': generate_product_metadata,
            'update_order': generate_order_metadata
        },
        status='success'
    )
    def update(self, request, *args, **kwargs):
        logger.info(f"Updating {self.queryset.model.__name__} with ID {kwargs.get('pk')} requested by {request.user}")
        try:
            response = super().update(request, *args, **kwargs)
            logger.info(f"{self.queryset.model.__name__} with ID {kwargs.get('pk')} updated successfully.")
            return response
        except Exception as e:
            logger.error(f"Failed to update {self.queryset.model.__name__}: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @log_user_activity(
        actions_metadata={
            'delete_service': generate_service_metadata,
            'delete_product': generate_product_metadata,
            'delete_order': generate_order_metadata
        },
        status='success'
    )    
    def destroy(self, request, *args, **kwargs):
        logger.info(f"Deleting {self.queryset.model.__name__} with ID {kwargs.get('pk')} requested by {request.user}")
        try:
            response = super().destroy(request, *args, **kwargs)
            logger.info(f"{self.queryset.model.__name__} with ID {kwargs.get('pk')} deleted successfully.")
            return response
        except Exception as e:
            logger.error(f"Failed to delete {self.queryset.model.__name__}: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['POST'])
    @log_user_activity(
        actions_metadata={'soft_delete': generate_product_metadata},
        status='success'
    )
    def soft_delete(self, request, pk=None):
        """Soft delete an object by setting deleted_at instead of hard deleting."""
        obj = get_object_or_404(self.queryset.model.objects.all_with_deleted(), pk=pk)
        obj.soft_delete()
        logger.info(f"Soft deleted {self.queryset.model.__name__} with ID {pk}")
        return Response({'status': 'soft deleted'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    @log_user_activity(
        actions_metadata={'restore': generate_product_metadata},
        status='success'
    )
    def restore(self, request, pk=None):
        """Restore a previously soft-deleted object."""
        obj = get_object_or_404(self.queryset.model.objects.deleted(), pk=pk)
        obj.restore()
        logger.info(f"Restored {self.queryset.model.__name__} with ID {pk}")
        return Response({'status': 'restored'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def deleted(self, request):
        """Retrieve a list of soft-deleted objects."""
        deleted_records = self.queryset.model.objects.deleted()
        serializer = self.get_serializer(deleted_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BaseReadOnlyViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend, OrderingFilter] 
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Buyer','Seller','Admin']

    search_field = "search_vector"  # Used in get_queryset()

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get("search")

        if search_term:
            search_vector = getattr(self, "search_field", "search_vector")
            query = SearchQuery(search_term, search_type="plain")

            # ✅ Correct FTS query
            queryset = queryset.annotate(rank=SearchRank(F(search_vector), query))
            fts = queryset.filter(**{search_vector: query}).order_by("-rank")

            if fts.exists():
                return fts

            # ✅ Fallback to ILIKE for non-indexed fallback
            return queryset.filter(
                Q(name__icontains=search_term) |
                Q(description__icontains=search_term)
            )

        return queryset
