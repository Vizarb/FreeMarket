import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Generates a Markdown documentation file listing all database views.'

    def handle(self, *args, **kwargs):
        output_path = os.path.join('docs', 'views.md')

        if not os.path.exists('docs'):
            os.makedirs('docs')

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    viewname, 
                    definition 
                FROM 
                    pg_views 
                WHERE 
                    schemaname = 'public'
                ORDER BY viewname;
            """)
            views = cursor.fetchall()

        with open(output_path, 'w') as f:
            f.write("# FreeMarket Database Views\n\n")
            f.write("This file documents all PostgreSQL views in the `public` schema.\n\n")
            for viewname, definition in views:
                f.write(f"## `{viewname}`\n\n")
                f.write("```sql\n")
                f.write(f"{definition.strip()}\n")
                f.write("```\n\n")

        self.stdout.write(self.style.SUCCESS(f"View documentation generated at {output_path}"))
