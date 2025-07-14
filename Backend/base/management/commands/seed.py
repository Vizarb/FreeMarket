import random
import uuid
import logging
from datetime import datetime, timedelta
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import Group, Permission
from django.utils.text import slugify
from django.contrib.auth.management import create_permissions
from django.contrib.contenttypes.models import ContentType
from django.apps import apps
from base.utils.seed_data.Constants import ORDER_STATUSES, ROLE_PERMISSIONS, PAYMENT_METHODS
from base.utils.seed_data.seed_helpers import create_items_with_subtypes_from_csv, with_timestamps, load_seed_items_from_csv, load_item_category_map
from base.models import (
    CustomUser, Address, Category, ItemCategory,
     Payment, Order, OrderItem, Cart, CartItem
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants

class Command(BaseCommand):
    help = "Setup initial data using CSV seed files."

    def handle(self, *args, **kwargs):
        try:
            logger.info("Starting database setup...")
            with transaction.atomic():
                self.seed_database()
            logger.info("Database seed setup successfully completed!")
            self.stdout.write(self.style.SUCCESS("Database seed setup successfully completed!"))
        except Exception as e:
            logger.error(f"Error during setup: {e}")
            self.stdout.write(self.style.ERROR(f"Error during setup: {e}"))

    def seed_database(self):
        self.create_groups()
        users = self.seed_users()
        categories = self.seed_categories()
        self.seed_addresses(users)
        items = self.seed_items_from_csv(users, categories)
        orders = self.seed_orders(users, items)
        self.seed_payments(orders)
        self.seed_carts(users, items)
        self.create_superuser()

    def create_groups(self):
        for model in apps.get_models():
            ContentType.objects.get_or_create(
                app_label=model._meta.app_label,
                model=model._meta.model_name,
            )

        for app_config in apps.get_app_configs():
            try:
                create_permissions(app_config, verbosity=0)
            except Exception as e:
                logger.warning(f"Skipping permissions for {app_config.name}: {e}")

        for group_name, permission_codenames in ROLE_PERMISSIONS.items():
            group, _ = Group.objects.get_or_create(name=group_name)
            for codename in permission_codenames:
                try:
                    permission = Permission.objects.get(codename=codename)
                    group.permissions.add(permission)
                except Permission.DoesNotExist:
                    logger.error(f"Permission '{codename}' not found.")

    def seed_users(self):
        if CustomUser.objects.exists():
            return list(CustomUser.objects.all())
        users = [CustomUser(username=f"user{i}", phone_number=f"12345678{i}", gender=random.choice(["Male", "Female", "Other"]), date_of_birth=datetime.now() - timedelta(days=random.randint(7000, 15000))) for i in range(10)]
        CustomUser.objects.bulk_create(with_timestamps(users))
        buyer_group = Group.objects.get(name="Buyer")
        for user in CustomUser.objects.all():
            user.groups.add(buyer_group)
        return CustomUser.objects.all()

    def seed_categories(self):
        if Category.objects.exists():
            return list(Category.objects.all())
        return []  # Categories will be created dynamically in item-category linking

    def seed_addresses(self, users):
        if Address.objects.exists():
            logger.info("Addresses already exist. Skipping.")
            return
    
        street_names = ["Maple St", "Oak Ave", "Main Rd", "Cedar Blvd", "Birch Ln"]
        cities = ["Tel Aviv", "Haifa", "Jerusalem", "Beer Sheva", "Netanya"]
        countries = ["Israel"]
    
        addresses = []
        for i in range(len(users)):
            addresses.append(Address(
                user=users[i],
                address_line_1=f"{random.randint(1, 100)} {random.choice(street_names)}",
                city=random.choice(cities),
                state_province="Central District",
                postal_code=str(60000 + i),
                country=random.choice(countries)
            ))
    
        Address.objects.bulk_create(with_timestamps(addresses))
        logger.info(f"Created {len(addresses)} realistic addresses.")
        return Address.objects.all()

    def seed_items_from_csv(self, users, _):
        item_path = Path("base/utils/seed_data/items.csv")
        cat_path = Path("base/utils/seed_data/categories.csv")
        item_rows = load_seed_items_from_csv(item_path)
        category_map = load_item_category_map(cat_path)

        items = create_items_with_subtypes_from_csv(item_rows, category_map, users)
        return items

    def link_item_categories(self, items, category_map):
        for item in items:
            slug = slugify(item.name)
            paths = category_map.get(slug, [])
            for parent_name, child_name in paths:
                parent, _ = Category.objects.get_or_create(name=parent_name, parent=None)
                child, _ = Category.objects.get_or_create(name=child_name, parent=parent)
                ItemCategory.objects.get_or_create(item=item, category=child)

    def seed_orders(self, users, items):
        if Order.objects.exists():
            logger.info("Orders already exist, skipping seeding orders.")
            return list(Order.objects.all())

        orders = [
            Order(
                user=random.choice(users),
                status=random.choice(ORDER_STATUSES),
                total_price_cents=0  # Will be calculated later
            )
            for _ in range(10)
        ]
        Order.objects.bulk_create(with_timestamps(orders))

        orders = list(Order.objects.all())  # Fetch the created orders
        
        order_items = []
        for _ in range(30):  # Create 30 random order items
            order = random.choice(orders)
            item = random.choice(items)

            # Ensure price_cents is set
            order_items.append(
                OrderItem(
                    order=order,
                    item=item,
                    quantity=random.randint(1, 5),
                    price_cents=item.price_cents  #  Fix: Assign a valid price
                )
            )

        OrderItem.objects.bulk_create(with_timestamps(order_items))

        # Update the total price of each order
        for order in orders:
            total_price = sum(
                oi.price_cents * oi.quantity for oi in order.order_items.all()
            )
            order.total_price_cents = total_price
            order.save()

        logger.info(f"Created {len(orders)} orders and {len(order_items)} order items.")
        return orders

    def seed_payments(self, orders):
        if Payment.objects.exists():
            return
        payments = [Payment(order=order, amount_cents=order.total_price_cents, payment_method=random.choice(PAYMENT_METHODS), transaction_id=f"Transaction-{uuid.uuid4()}") for order in orders]
        Payment.objects.bulk_create(with_timestamps(payments))
        logger.info(f"Created {len(payments)} payments.")

    def seed_carts(self, users, items):
        if Cart.objects.exists() and CartItem.objects.exists():
            return
        carts = [Cart(user=user) for user in users]
        Cart.objects.bulk_create(with_timestamps(carts))
        cart_items = set()
        while len(cart_items) < 30:
            cart = random.choice(carts)
            item = random.choice(items)
            if not CartItem.objects.filter(cart=cart, item=item).exists():  # Avoid duplicates
                cart_items.add((cart, item))

        CartItem.objects.bulk_create(with_timestamps([
            CartItem(
                cart=c,
                item=i,
                quantity=random.randint(1, 5),
                price_snapshot_cents=random.randint(100, 5000)
            )
            for c, i in cart_items
        ]))
        logger.info(f"Created {len(carts)} carts and {len(cart_items)} cart items.")

    def create_superuser(self):
        """Creates a default superuser after seeding groups."""
        superuser_username = "momo"
        superuser_email = "mo@mo.com"
        superuser_password = "Aa123456!"

        # Ensure the 'Admin' group exists before assigning it
        try:
            admin_group = Group.objects.get(name="Admin")
            buyer_group, _ = Group.objects.get_or_create(name="Buyer")
            seller_group, _ = Group.objects.get_or_create(name="Seller")
        except Group.DoesNotExist:
            logger.error("Admin group was not found — did group creation fail?")
            return

        if not CustomUser.objects.filter(username=superuser_username).exists():
            superuser = CustomUser.objects.create_superuser(
                username=superuser_username,
                email=superuser_email,
                password=superuser_password,
                phone_number="0000000000",
                gender="Male",
                date_of_birth=datetime(1990, 1, 1),
            )
            superuser.groups.add(admin_group, buyer_group, seller_group)  # Now safe to assign the group

            from base.models.seller_profile import SellerProfile
            from base.enums import ThemePreset
            SellerProfile.objects.create(
                user=superuser,
                shop_name=f"Shop of {superuser.username}",
                slug=None,  # let AutoSlugField handle this
                theme_id=ThemePreset.CLASSIC,
                bio="Welcome to my shop!",
            )

            logger.info(f"Superuser '{superuser_username}' created successfully.")
        else:
            logger.info(f"Superuser '{superuser_username}' already exists.")
