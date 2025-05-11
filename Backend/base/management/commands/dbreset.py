import logging
from django.db import transaction, connection
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from base.models import (
    CustomUser,
    Address,
    Category,
    ItemCategory,
    Item,
    Product,
    Service,
    Payment,
    Order,
    OrderItem,
    Cart,
    CartItem,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Reset the database"

    def handle(self, *args, **kwargs):
        """Main entry point for the reset command."""
        try:
            logger.info("Starting database reset...")
            with transaction.atomic():
                self.reset_database()
            logger.info("Database reset completed successfully.")
            self.stdout.write(self.style.SUCCESS("Database reset completed successfully."))
        except Exception as e:
            logger.error(f"Error resetting the database: {e}")
            self.stdout.write(self.style.ERROR(f"Error resetting the database: {e}"))

    def reset_database(self):
        """Runs all database reset steps in order."""
        self.delete_all_records()
        self.reset_sequences()

    def delete_all_records(self):
        """Deletes all records from the database, in the correct order."""
        models_to_clear = [
            OrderItem, Order, CartItem, Cart, Payment,  
            Product, Service,        # ✅ Delete child models first
            Item,                    # ✅ Then delete parent (Item)
            ItemCategory, Category, Address,
            CustomUser, Group, Permission,
        ]

        logger.info("Deleting records from all tables...")
        for model in models_to_clear:
            count = model.objects.count()
            model.objects.all().delete()
            logger.info(f"Deleted {count} records from {model.__name__}.")

    def reset_sequences(self):
        """Resets the auto-increment sequences for tables that need it."""
        with connection.cursor() as cursor:
            models = [
                CustomUser, Address, Category, ItemCategory,  
                Item,                     # ✅ Item owns the PK sequence
                Payment, Order, OrderItem, Cart, CartItem, 
                Group, Permission,
                # ❌ Do NOT include Product or Service (they use Item's ID)
            ]

            for model in models:
                table_name = model._meta.db_table  # Get the database table name
                try:
                    cursor.execute(f"SELECT setval(pg_get_serial_sequence('{table_name}', 'id'), 1, false);")
                    logger.info(f"Reset sequence for table {table_name}.")
                except Exception as e:
                    logger.warning(f"Could not reset sequence for {table_name}: {e}")

        logger.info("Auto-increment sequences reset for all applicable tables.")
