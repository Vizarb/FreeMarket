import random
import uuid
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import Group, Permission
from base.utils.seed_helpers import with_timestamps
from base.utils.decorators import ensure_list
from django.utils.timezone import now
from base.models import (
    CustomUser,
    Address,
    Category,
    Item,
    ItemCategory,
    Product,
    Service,
    Payment,
    Order,
    OrderItem,
    Cart,
    CartItem,
)
from django.contrib.auth.management import create_permissions
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Group, Permission
from django.apps import apps

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
CURRENCIES = ["USD", "EUR", "GBP"]
SERVICE_TYPES = ["Consulting", "Maintenance", "Other"]
ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]
PAYMENT_METHODS = ["Credit Card", "PayPal", "Bank Transfer"]


class Command(BaseCommand):
    help = "Setup initial data: Groups, Permissions, Users, and Sample Data"

    def handle(self, *args, **kwargs):
        """ Main entry point for the command. Wraps all database setup in a single transaction. """
        try:
            logger.info("Starting database setup...")
            with transaction.atomic():
                self.seed_database()
            logger.info("Database setup successfully completed!")
            self.stdout.write(self.style.SUCCESS("Database setup successfully completed!"))
        except Exception as e:
            logger.error(f"Error during setup: {e}")
            self.stdout.write(self.style.ERROR(f"Error during setup: {e}"))

    def seed_database(self):
        """ Runs all database seeding tasks in order. """
        self.create_groups()  # Step 1: Create Groups & Permissions
        
        users = self.seed_users()  # Step 2: Create Users
        if not users:
            logger.error("Seeding failed: No users were created.")
            return
        
        categories = self.seed_categories()  # Step 3: Create Categories
        if not categories:
            logger.error("Seeding failed: No categories were created.")
            return
        
        items = self.seed_items(users, categories)  # Step 4: Create Items
        if not items:
            logger.error("Seeding failed: No items were created.")
            return
        
        self.seed_products_services(items)  # Step 5: Create Products/Services
        orders = self.seed_orders(users, items)  # Step 6: Create Orders
        self.seed_payments(orders)  # Step 7: Create Payments
        self.seed_carts(users, items)  # Step 8: Create Carts
        self.create_superuser()  # Step 9: Create Superuser

# FIXME THE GRUOPS ARE CREATED WITH THE WRONG PREMISSIONS 
    ### ✅ Step 1: Create Groups and Assign Permissions
    def create_groups(self):
        """Ensures permissions exist before creating groups and assigning permissions."""
        
        # ✅ Step 1.1: Ensure content types exist
        for model in apps.get_models():
            ContentType.objects.get_or_create(app_label=model._meta.app_label, model=model._meta.model_name)

        for app_config in apps.get_app_configs():
            create_permissions(app_config, verbosity=0)  # Ensures permissions are created

        # Ensure permissions exist before proceeding
        Permission.objects.all()  # Force permissions to load into memory


        # ✅ Step 1.3: Define groups and their associated permissions
        groups = {
            "User": ["view_customuser", "view_item", "view_order", "add_cart", "change_cart", "delete_cart", "view_cart"],
            "Seller": ["view_customuser", "view_item", "add_item", "change_item", "delete_item", "view_order", "add_cart", "change_cart", "delete_cart", "view_cart"],
            "Admin": [
                "add_customuser", "change_customuser", "delete_customuser", "view_customuser",
                "add_order", "change_order", "delete_order", "view_order",
                "add_item", "change_item", "delete_item", "view_item",
                "add_cart", "change_cart", "delete_cart", "view_cart",
            ]
        }

        # ✅ Step 1.4: Create groups and assign permissions
        for group_name, permission_codenames in groups.items():
            group, created = Group.objects.get_or_create(name=group_name)

            if created:
                logger.info(f"Created group: {group_name}")
            else:
                logger.warning(f"Group '{group_name}' already exists.")

            for codename in permission_codenames:
                try:
                    permission = Permission.objects.get(codename=codename)
                    group.permissions.add(permission)
                except Permission.DoesNotExist:
                    logger.error(f"Permission '{codename}' not found. Ensure migrations are applied first.")

            logger.info(f"Assigned permissions to {group_name}")


    ### ✅ Step 2: Create Users and Assign to Groups
    def seed_users(self):
        """ Creates users and assigns them to the correct groups. """
        if CustomUser.objects.exists():
            logger.info("Users already exist, skipping seeding users.")
            return list(CustomUser.objects.all())

        users = [
            CustomUser(
                username=f"user{i}",
                phone_number=f"12345678{i}",
                gender=random.choice(["Male", "Female", "Other"]),
                date_of_birth=datetime.now() - timedelta(days=random.randint(7000, 15000))
            )
            for i in range(10)
        ]
        CustomUser.objects.bulk_create(with_timestamps(users))

        # Assign users to default "User" group
        user_group = Group.objects.get(name="User")
        for user in CustomUser.objects.all():
            user.groups.add(user_group)

        logger.info(f"Created {len(users)} users and assigned them to 'User' group.")
        return CustomUser.objects.all()

    ### ✅ Step 3: Seed Other Data
    def seed_addresses(self, users):
        if Address.objects.exists():
            return
        addresses = [
            Address(
                user=random.choice(users),
                address_line_1=f"Address {i}",
                city=f"City {i}",
                country=f"Country {i}"
            ) for i in range(10)
        ]
        Address.objects.bulk_create(with_timestamps(addresses))
        logger.info(f"Created {len(addresses)} addresses.")

    @ensure_list
    def seed_categories(self):
        if Category.objects.exists():
            logger.info("Categories already exist, skipping seeding.")
            return list(Category.objects.all())

        # Create categories with parent-child relationships
        parent_categories = [Category(name=f"Category{i}") for i in range(3)]  # Create top-level categories
        Category.objects.bulk_create(with_timestamps(parent_categories))

        # Now create child categories for each parent category
        child_categories = [
            Category(name=f"Subcategory{i}-{j}", parent=parent)
            for i, parent in enumerate(parent_categories)
            for j in range(2)  # 2 subcategories for each parent
        ]
        Category.objects.bulk_create(with_timestamps(child_categories))

        logger.info(f"Created {len(parent_categories)} parent categories and {len(child_categories)} child categories.")
        return list(Category.objects.all())


    @ensure_list
    def seed_items(self, users, categories):
        """Seeds items if they do not exist."""
        if Item.objects.exists():
            logger.info("Items already exist, skipping seeding.")
            return list(Item.objects.all())

        if not categories:
            logger.error("No categories found! Ensure seed_categories() runs successfully.")
            return []

        items = [
            Item(
                name=f"Item{i}",
                price_cents=random.randint(100, 10000),
                currency=random.choice(CURRENCIES),
                seller=random.choice(users),
            )
            for i in range(20)
        ]
        Item.objects.bulk_create(with_timestamps(items))

        # Link items to random categories (both parent and child)
        item_categories = [
            ItemCategory(item=item, category=random.choice(categories)) for item in Item.objects.all()
        ]
        ItemCategory.objects.bulk_create(with_timestamps(item_categories))

        logger.info(f"Created {len(items)} items and linked them to categories.")
        return list(Item.objects.all())
    

    def seed_products_services(self, items):
        if Product.objects.exists() or Service.objects.exists():
            logger.info("Products and Services already exist, skipping seeding.")
            return

        # Randomly split the list in two (50/50)
        random.shuffle(items)
        split_index = len(items) // 2
        product_items = items[:split_index]
        service_items = items[split_index:]

        for item in product_items:
            product = Product(
                id=item.id,  # ✅ Link to existing Item using the same ID
                name=item.name,
                description=item.description,
                price_cents=item.price_cents,
                currency=item.currency,
                seller=item.seller,
                quantity=random.randint(1, 100),
            )
            product.save()
            product.categories.set(item.categories.all())

        for item in service_items:
            service = Service(
                id=item.id,  # ✅ Link to existing Item using the same ID
                name=item.name,
                description=item.description,
                price_cents=item.price_cents,
                currency=item.currency,
                seller=item.seller,
                service_duration=random.randint(30, 300),
                service_type=random.choice(SERVICE_TYPES),
            )
            service.save()
            service.categories.set(item.categories.all())

        logger.info(f"Created {len(product_items)} products and {len(service_items)} services.")
    
        Item.objects.count()
        Product.objects.count()
        Service.objects.count()

        # Sanity check for orphan items
        orphan_count = Item.objects.exclude(id__in=Product.objects.values_list('id', flat=True))\
                                .exclude(id__in=Service.objects.values_list('id', flat=True)).count()
        if orphan_count > 0:
            logger.warning(f"⚠️ Found {orphan_count} orphan Items! Some items have no subtype.")
        else:
            logger.info("✅ All items properly linked to subtypes.")



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
                    price_cents=item.price_cents  # ✅ Fix: Assign a valid price
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
        admin_group, _ = Group.objects.get_or_create(name="Admin")

        if not CustomUser.objects.filter(username=superuser_username).exists():
            superuser = CustomUser.objects.create_superuser(
                username=superuser_username,
                email=superuser_email,
                password=superuser_password,
                phone_number="0000000000",
                gender="Male",
                date_of_birth=datetime(1990, 1, 1),
            )
            superuser.groups.add(admin_group)  # Now safe to assign the group
            logger.info(f"Superuser '{superuser_username}' created successfully.")
        else:
            logger.info(f"Superuser '{superuser_username}' already exists.")
