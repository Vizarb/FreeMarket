import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Generates a Markdown documentation file listing all database indexes.'

    def handle(self, *args, **kwargs):
        output_path = os.path.join('docs', 'indexes.md')

        if not os.path.exists('docs'):
            os.makedirs('docs')

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    tablename, 
                    indexname, 
                    indexdef
                FROM 
                    pg_indexes
                WHERE 
                    schemaname = 'public'
                ORDER BY 
                    tablename, indexname;
            """)
            rows = cursor.fetchall()

        with open(output_path, 'w') as f:
            f.write("# FreeMarket Indexes\n\n")
            f.write("| Table | Index Name | Fields | Index Type |\n")
            f.write("|:------|:-----------|:-------|:-----------|\n")
            for table, index_name, indexdef in rows:
                if ' USING ' in indexdef:
                    idx_type = indexdef.split(' USING ')[1].split(' ')[0]
                else:
                    idx_type = 'Unknown'

                # Try to extract indexed fields
                try:
                    fields = indexdef.split('(')[1].split(')')[0]
                except IndexError:
                    fields = "?"

                f.write(f"| {table} | {index_name} | {fields} | {idx_type.upper()} |\n")

        self.stdout.write(self.style.SUCCESS(f"Index documentation generated at {output_path}"))
