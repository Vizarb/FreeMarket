# tests/factories.py

import factory
from base.models.user import CustomUser
from base.models.item import Product, Service
from base.models.cart import Cart
from base.models.log_models.cart_activity_log import CartActivityLog

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomUser
        skip_postgeneration_save = True

    username = factory.Faker('user_name')

    @factory.post_generation
    def set_password(self, create, extracted, **kwargs):
        raw = extracted or 'defaultpass'
        self.set_password(raw)
        if create:
            self.save()

    @factory.post_generation
    def roles(self, create, extracted, **kwargs):
        """Assign user to one or more role groups (e.g., 'Seller', 'Buyer')"""
        if not create or not extracted:
            return
        from django.contrib.auth.models import Group
        for role in extracted:
            group, _ = Group.objects.get_or_create(name=role)
            self.groups.add(group)


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    name = factory.Faker('word')
    price_cents = 1000
    currency = 'USD'
    seller = factory.SubFactory(UserFactory, roles=["Seller"])  # ✅ explicitly a Seller
    quantity = 10

class ServiceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Service

    name = factory.Faker('word')
    price_cents = 2000
    currency = 'USD'
    seller = factory.SubFactory(UserFactory, roles=["Seller"])  # ✅ explicitly a Seller
    service_duration = 5
    service_type = 'Cleaning'


class CartActivityLogFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CartActivityLog

    user = factory.SubFactory(UserFactory)
    cart = factory.LazyAttribute(lambda o: Cart.objects.get_or_create(user=o.user)[0])
    item = factory.SubFactory(ProductFactory)
    action = "ADD"
    quantity = 1
    metadata = {"source": "factory"}