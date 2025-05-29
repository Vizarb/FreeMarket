import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Generates a Markdown documentation file listing all database constraints.'

    def handle(self, *args, **kwargs):
        output_path = os.path.join('docs', 'constraints.md')

        if not os.path.exists('docs'):
            os.makedirs('docs')

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    con.conname AS constraint_name,
                    cl.relname AS table_name,
                    CASE con.contype
                        WHEN 'p' THEN 'PRIMARY KEY'
                        WHEN 'u' THEN 'UNIQUE'
                        WHEN 'f' THEN 'FOREIGN KEY'
                        WHEN 'c' THEN 'CHECK'
                        WHEN 'x' THEN 'EXCLUSION'
                        ELSE con.contype
                    END AS constraint_type
                FROM pg_constraint con
                JOIN pg_class cl ON con.conrelid = cl.oid
                WHERE con.connamespace = 'public'::regnamespace
                ORDER BY cl.relname, con.conname;
            """)
            constraints = cursor.fetchall()

        with open(output_path, 'w') as f:
            f.write("# FreeMarket Database Constraints\n\n")
            f.write("| Table | Constraint Name | Type |\n")
            f.write("|:------|:----------------|:------|\n")
            for table, name, con_type in constraints:
                f.write(f"| {table} | {name} | {con_type} |\n")

        self.stdout.write(self.style.SUCCESS(f"Constraint documentation generated at {output_path}"))
