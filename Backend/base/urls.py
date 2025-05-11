from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from base.views.seller_application import SellerApplicationViewSet
from .views.models import (
    CartItemViewSet, OrderItemViewSet, ProductViewSet, UserViewSet, AddressViewSet, CartViewSet, OrderViewSet, PaymentViewSet, CategoryViewSet, ItemViewSet, ServiceViewSet,
    index, test, myproducts
)
from .views.views import (CartOverviewViewSet, ItemDetailsViewSet, ItemSearchViewSet, MostActiveUsersViewSet, OrderDetailsViewSet, OrderItemDetailsViewSet, TopSellingProductsViewSet, UserOrderHistoryViewSet, )
from .views.health import HealthCheckView

# Initialize router
router = DefaultRouter()
router.register('items', ItemViewSet, basename='item')
router.register('services', ServiceViewSet, basename='service')
router.register('products', ProductViewSet, basename='product')
router.register('users', UserViewSet, basename='user')
router.register('category', CategoryViewSet, basename='category')
router.register('addresses', AddressViewSet, basename='address')
router.register('cart', CartViewSet, basename='cart')
router.register('cart-items', CartItemViewSet, basename='cart-item')
router.register('orders', OrderViewSet, basename='order')
router.register('order-items', OrderItemViewSet, basename='order-item')
router.register('payments', PaymentViewSet, basename='payment')
router.register('seller-applications',SellerApplicationViewSet,basename="seller-application")

# Views paths
router.register('item-search', ItemSearchViewSet, basename='item-search')
router.register('item-details', ItemDetailsViewSet, basename='item-details')
router.register('user-order-history', UserOrderHistoryViewSet, basename='user-order-history')
router.register('cart-overview', CartOverviewViewSet, basename='cart-overview')
router.register('top-selling-products', TopSellingProductsViewSet, basename='top-selling-products')
router.register('most-active-users', MostActiveUsersViewSet, basename='most-active-users')
router.register('order-details', OrderDetailsViewSet, basename='order-details')
router.register('order-item-details', OrderItemDetailsViewSet, basename='order-item-details')

# Manual paths
custom_urlpatterns = [
    path('', index, name='index'),  # Home page
    path('test', test, name='test'),
    path('myproducts', myproducts, name='myproducts'),
]

# Authentication paths
auth_urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Combine all routes
urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # All router-generated paths
    path('', include(custom_urlpatterns)),  # Custom views
    path('', include(auth_urlpatterns)),  # Authentication routes
    path('api/auth/me/', UserViewSet.as_view({'get': 'me'}), name='auth_me'),
    path('api/health/', HealthCheckView.as_view(), name='health_check'),

]
