from django.utils.timezone import now
from django.utils.text import slugify
from collections import defaultdict
import csv


def with_timestamps(instances):
    now_ = now()
    for instance in instances:
        if hasattr(instance, "created_at") and not instance.created_at:
            instance.created_at = now_
        if hasattr(instance, "updated_at") and not instance.updated_at:
            instance.updated_at = now_
    return instances


def load_seed_items_from_csv(csv_path):
    items = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["name"].strip()
            description = row["description"].strip()
            item_type = row["type"].strip().lower()
            if item_type in {"product", "service"}:
                items.append({
                    "name": name,
                    "description": description,
                    "type": item_type
                })
    return items


def load_item_category_map(csv_path):
    category_map = defaultdict(list)
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            item_slug = slugify(row['item_name'].strip())
            raw_paths = row['categories'].split(';')
            for path in raw_paths:
                parts = [p.strip() for p in path.split('>')]
                if len(parts) == 2:
                    category_map[item_slug].append((parts[0], parts[1]))
    return category_map
