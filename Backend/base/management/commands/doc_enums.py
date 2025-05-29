import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Generates a Markdown documentation file listing all PostgreSQL ENUM types.'

    def handle(self, *args, **kwargs):
        output_path = os.path.join('docs', 'enums.md')

        if not os.path.exists('docs'):
            os.makedirs('docs')

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT t.typname AS enum_type, e.enumlabel AS label
                FROM pg_type t
                JOIN pg_enum e ON t.oid = e.enumtypid
                JOIN pg_namespace n ON n.oid = t.typnamespace
                WHERE n.nspname = 'public'
                ORDER BY enum_type, e.enumsortorder;
            """)
            enums = cursor.fetchall()

        with open(output_path, 'w') as f:
            f.write("# FreeMarket PostgreSQL ENUM Types\n\n")
            current_enum = None
            for enum_type, label in enums:
                if enum_type != current_enum:
                    if current_enum is not None:
                        f.write("\n")
                    f.write(f"## `{enum_type}`\n")
                    current_enum = enum_type
                f.write(f"- {label}\n")

        self.stdout.write(self.style.SUCCESS(f"Enum documentation generated at {output_path}"))
