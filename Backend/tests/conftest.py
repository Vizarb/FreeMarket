# tests/conftest.py
import pytest
from rest_framework.test import APIClient

from tests.factories import (
    UserFactory,
    ProductFactory,
    ServiceFactory,
    CartActivityLogFactory,
)

@pytest.fixture
def api_client() -> APIClient:
    """Unauthenticated DRF client."""
    return APIClient()

@pytest.fixture
def authed_client(api_client, user) -> APIClient:
    """DRF client already logged in as the `user` fixture."""
    api_client.force_authenticate(user)
    return api_client

@pytest.fixture
def user(db):
    """A created CustomUser via Factory-Boy."""
    return UserFactory()

@pytest.fixture
def product_factory(db):
    """The ProductFactory class—you can call ProductFactory(...) in tests."""
    return ProductFactory

@pytest.fixture
def service_factory(db):
    """The ServiceFactory class—you can call ServiceFactory(...) in tests."""
    return ServiceFactory

@pytest.fixture
def cart_activity_log_factory(db):
    """The CartActivityLogFactory class."""
    return CartActivityLogFactory
