import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Generates a Markdown documentation file listing all SQL functions in the database.'

    def handle(self, *args, **kwargs):
        output_path = os.path.join('docs', 'functions.md')

        if not os.path.exists('docs'):
            os.makedirs('docs')

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    proname,
                    pg_get_function_arguments(p.oid) AS arguments,
                    pg_get_function_result(p.oid) AS return_type,
                    pg_get_functiondef(p.oid) AS definition
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public'
                ORDER BY proname;
            """)
            functions = cursor.fetchall()

        with open(output_path, 'w') as f:
            f.write("# FreeMarket SQL Functions\n\n")
            for name, args, return_type, definition in functions:
                f.write(f"## `{name}`\n")
                f.write(f"**Arguments:** {args}\n\n")
                f.write(f"**Returns:** {return_type}\n\n")
                f.write("```sql\n")
                f.write(definition.strip())
                f.write("\n```\n\n")

        self.stdout.write(self.style.SUCCESS(f"Function documentation generated at {output_path}"))
