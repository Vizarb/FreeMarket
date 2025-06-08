import logging
from rest_framework import status
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from django.contrib.postgres.search import SearchQuery, SearchRank

from base.permissions import HasRole
from base.utils.metadata import generate_product_metadata, generate_order_metadata, generate_service_metadata
from base.utils.decorators import log_user_activity
from base.enums import UserAction, ActionStatus

logger = logging.getLogger('freemarketbackend')

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class BaseViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

    def list(self, request, *args, **kwargs):
        logger.info(f"Listing {self.queryset.model.__name__}s requested by {request.user}")
        return super().list(request, *args, **kwargs)

    @log_user_activity(UserAction.CREATE_ORDER, status=ActionStatus.SUCCESS, metadata_func=generate_order_metadata)
    @log_user_activity(UserAction.ADD_PRODUCT, status=ActionStatus.SUCCESS, metadata_func=generate_product_metadata)
    @log_user_activity(UserAction.ADD_PRODUCT, status=ActionStatus.SUCCESS, metadata_func=generate_service_metadata)
    def create(self, request, *args, **kwargs):
        logger.info(f"Creating a new {self.queryset.model.__name__} requested by {request.user}")
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"{self.queryset.model.__name__} created successfully.")
            return response
        except Exception as e:
            logger.error(f"Failed to create {self.queryset.model.__name__}: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @log_user_activity(UserAction.UPDATE_PRODUCT, status=ActionStatus.SUCCESS, metadata_func=generate_product_metadata)
    @log_user_activity(UserAction.UPDATE_PRODUCT, status=ActionStatus.SUCCESS, metadata_func=generate_service_metadata)
    @log_user_activity(UserAction.UPDATE_ORDER, status=ActionStatus.SUCCESS, metadata_func=generate_order_metadata)
    def update(self, request, *args, **kwargs):
        logger.info(f"Updating {self.queryset.model.__name__} with ID {kwargs.get('pk')} requested by {request.user}")
        try:
            response = super().update(request, *args, **kwargs)
            logger.info(f"{self.queryset.model.__name__} with ID {kwargs.get('pk')} updated successfully.")
            return response
        except Exception as e:
            logger.error(f"Failed to update {self.queryset.model.__name__}: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @log_user_activity(UserAction.DELETE_PRODUCT, status=ActionStatus.SUCCESS, metadata_func=generate_product_metadata)
    @log_user_activity(UserAction.DELETE_PRODUCT, status=ActionStatus.SUCCESS, metadata_func=generate_service_metadata)
    @log_user_activity(UserAction.DELETE_ORDER, status=ActionStatus.SUCCESS, metadata_func=generate_order_metadata)
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
    @log_user_activity(UserAction.SOFT_DELETE, status=ActionStatus.SUCCESS, metadata_func=generate_product_metadata)
    def soft_delete(self, request, pk=None):
        obj = get_object_or_404(self.queryset.model.objects.all_with_deleted(), pk=pk)
        obj.soft_delete()
        logger.info(f"Soft deleted {self.queryset.model.__name__} with ID {pk}")
        return Response({'status': 'soft deleted'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    @log_user_activity(UserAction.RESTORE, status=ActionStatus.SUCCESS, metadata_func=generate_product_metadata)
    def restore(self, request, pk=None):
        obj = get_object_or_404(self.queryset.model.objects.deleted(), pk=pk)
        obj.restore()
        logger.info(f"Restored {self.queryset.model.__name__} with ID {pk}")
        return Response({'status': 'restored'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def deleted(self, request):
        deleted_records = self.queryset.model.objects.deleted()
        serializer = self.get_serializer(deleted_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class BaseReadOnlyViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend, OrderingFilter] 
    pagination_class = StandardResultsSetPagination
    permission_classes = [IsAuthenticated, HasRole]
    required_roles = ['Buyer', 'Seller', 'Admin']
    search_field = "search_vector"

    def get_queryset(self):
        queryset = super().get_queryset()
        search_term = self.request.query_params.get("q")

        if search_term:
            search_vector = getattr(self, "search_field", "search_vector")
            query = SearchQuery(search_term, search_type="plain")
            queryset = queryset.annotate(rank=SearchRank(F(search_vector), query))
            fts = queryset.filter(**{f"{search_vector}__search": search_term}).order_by("-rank")

            if fts.exists():
                return fts

            return queryset.filter(
                Q(name__icontains=search_term) |
                Q(description__icontains=search_term)
            )

        return queryset
