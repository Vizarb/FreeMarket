import os
from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command


class Command(BaseCommand):
    help = "Generates all DB documentation (indexes, triggers, views, constraints, functions, stored procedures, enums)."

    def handle(self, *args, **options):
        tasks = [
            "doc_indexes",
            "doc_triggers",
            "doc_views",
            "doc_constraints",
            "doc_functions",
            "doc_enums",
        ]

        for task in tasks:
            self.stdout.write(self.style.NOTICE(f"Running: {task}"))
            try:
                call_command(task)
            except CommandError as e:
                self.stderr.write(self.style.ERROR(f"Failed: {task} → {e}"))
                continue

        self.stdout.write(self.style.SUCCESS("All documentation generated successfully."))
