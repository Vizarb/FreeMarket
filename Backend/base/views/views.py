# views/item_views.py

from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models import Q, F

from base.views.baseviews import BaseReadOnlyViewSet
from base.permissions import HasRole
from base.models import Item, Category
from base.models.views import (
    ItemDetails, ItemSearchView, OrderDetails, OrderItemDetails, UserOrderHistory,
    CartOverview, TopSellingProducts, MostActiveUsers
)
from base.serializers.item_search import ItemSearchSerializer
from base.serializers.views import (
    ItemDetailsSerializer, OrderDetailsSerializer, OrderItemDetailsSerializer,
    UserOrderHistorySerializer, CartOverviewSerializer,
    TopSellingProductsSerializer, MostActiveUsersSerializer
)
from base.utils.category_utils import get_descendant_ids


class ItemSearchViewSet(BaseReadOnlyViewSet):
    """
    Full-text search over Items.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Buyer', 'Seller']
    queryset          = ItemSearchView.objects.all()
    serializer_class  = ItemSearchSerializer
    filterset_fields  = ['currency', 'seller', 'item_type']
    ordering_fields   = ['price_cents', 'name']
    ordering          = ['-price_cents']
    search_field      = 'search_vector'

    @action(detail=False, methods=['GET'])
    def autocomplete(self, request):
        query = request.GET.get("q", "").strip()
        if query:
            suggestions = (
                Item.objects
                    .filter(name__icontains=query)
                    .order_by("name")
                    .values("name", "slug")
                    .distinct()[:10]
            )
            return Response(suggestions)
        return Response([])

    def get_queryset(self):
        qs = super().get_queryset()

        search_term = self.request.query_params.get("search")
        if search_term:
            sq = SearchQuery(search_term, search_type="plain")
            qs = qs.annotate(rank=SearchRank(F(self.search_field), sq))
            return qs.filter(search_vector=sq).order_by("-rank")

        cat_id = self.request.query_params.get('category_id')
        if cat_id:
            try:
                cat = Category.objects.prefetch_related('subcategories').get(id=cat_id)
                ids = get_descendant_ids(cat)
                qs = qs.filter(categories__iregex=r'\m(' + '|'.join(map(str, ids)) + r')\M')
            except Category.DoesNotExist:
                pass

        return qs



class ItemDetailsViewSet(BaseReadOnlyViewSet):
    """
    DB view: detailed item info.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Buyer', 'Seller']
    queryset           = ItemDetails.objects.all()
    serializer_class   = ItemDetailsSerializer
    filterset_fields   = ['currency', 'seller', 'categories']
    lookup_field = 'slug'


class UserOrderHistoryViewSet(BaseReadOnlyViewSet):
    """
    DB view: each user’s order history.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Buyer']
    queryset           = UserOrderHistory.objects.all()
    serializer_class   = UserOrderHistorySerializer
    filterset_fields   = ['status', 'customer']
    ordering_fields    = ['created_at', 'total_price_cents']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return qs
        return qs.filter(customer=user)


class CartOverviewViewSet(BaseReadOnlyViewSet):
    """
    DB view: current user’s cart overview.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Buyer']
    serializer_class  = CartOverviewSerializer
    filterset_fields  = ['user_id']
    ordering_fields   = ['price_snapshot_cents']

    def get_queryset(self):
        # no soft-delete here—DB view only
        return CartOverview.objects.filter(user_id=self.request.user.id).order_by('cart_id')


class TopSellingProductsViewSet(BaseReadOnlyViewSet):
    """
    DB view: top-selling products analytics.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Admin']
    queryset           = TopSellingProducts.objects.all()
    serializer_class   = TopSellingProductsSerializer
    ordering_fields    = ['total_sold', 'total_revenue']


class MostActiveUsersViewSet(BaseReadOnlyViewSet):
    """
    DB view: most active users analytics.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Admin']
    queryset           = MostActiveUsers.objects.all()
    serializer_class   = MostActiveUsersSerializer
    ordering_fields    = ['total_spent', 'total_orders']


class OrderDetailsViewSet(BaseReadOnlyViewSet):
    """
    DB view: detailed order info.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Admin']
    queryset           = OrderDetails.objects.all()
    serializer_class   = OrderDetailsSerializer
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    ordering_fields    = ['created_at', 'total_price_cents']


class OrderItemDetailsViewSet(BaseReadOnlyViewSet):
    """
    DB view: detailed order‐item info.
    """
    permission_classes = [IsAuthenticated, HasRole]
    required_roles    = ['Admin']
    queryset           = OrderItemDetails.objects.all()
    serializer_class   = OrderItemDetailsSerializer
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    ordering_fields    = ['price_cents', 'quantity']
