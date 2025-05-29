import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Generates a Markdown documentation file listing all database triggers.'

    def handle(self, *args, **kwargs):
        output_path = os.path.join('docs', 'triggers.md')

        if not os.path.exists('docs'):
            os.makedirs('docs')

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    tg.tgname AS trigger_name,
                    tbl.relname AS table_name,
                    p.proname AS function_name,
                    tg.tgenabled,
                    tg.tgtype::integer,
                    CASE
                        WHEN (tg.tgtype & 1) = 1 THEN 'ROW'
                        ELSE 'STATEMENT'
                    END AS level,
                    CASE
                        WHEN (tg.tgtype & 2) = 2 THEN 'BEFORE'
                        WHEN (tg.tgtype & 64) = 64 THEN 'INSTEAD OF'
                        ELSE 'AFTER'
                    END AS timing,
                    ARRAY_TO_STRING(ARRAY[
                        CASE WHEN (tg.tgtype & 4) = 4 THEN 'INSERT' END,
                        CASE WHEN (tg.tgtype & 8) = 8 THEN 'DELETE' END,
                        CASE WHEN (tg.tgtype & 16) = 16 THEN 'UPDATE' END,
                        CASE WHEN (tg.tgtype & 32) = 32 THEN 'TRUNCATE' END
                    ], ', ') AS events
                FROM pg_trigger tg
                JOIN pg_class tbl ON tg.tgrelid = tbl.oid
                JOIN pg_proc p ON tg.tgfoid = p.oid
                WHERE NOT tg.tgisinternal
                ORDER BY tbl.relname, tg.tgname;
            """)
            rows = cursor.fetchall()

        with open(output_path, 'w') as f:
            f.write("# FreeMarket Database Triggers\n\n")
            f.write("| Table | Trigger Name | Function | Timing | Level | Events | Enabled |\n")
            f.write("|:------|:--------------|:----------|:--------|:--------|:--------|:--------|\n")
            for row in rows:
                table, trigger, function, enabled, _, level, timing, events = row
                f.write(f"| {table} | {trigger} | {function} | {timing} | {level} | {events} | {enabled} |\n")

        self.stdout.write(self.style.SUCCESS(f"Trigger documentation generated at {output_path}"))
