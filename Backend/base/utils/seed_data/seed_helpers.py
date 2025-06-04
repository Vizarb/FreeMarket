import logging
import random
import csv
from collections import defaultdict
from django.utils.timezone import now
from django.utils.text import slugify

from base.models.category import Category
from base.models.item import Item, ItemCategory, Product, Service
from base.utils.seed_data.Constants import CURRENCIES, SERVICE_TYPES

logger = logging.getLogger(__name__)


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
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get("name", "").strip()
            description = row.get("description", "").strip()
            item_type = row.get("type", "").strip().lower()

            price_cell = row.get("price_cents", "").strip()
            if not price_cell:
                logger.warning(f"Skipping row with blank price_cents: {row}")
                continue

            try:
                price_cents = int(price_cell)
            except ValueError:
                logger.warning(f"Skipping row with invalid price_cents: {row}")
                continue

            currency = row.get("currency", "").strip().upper()
            if currency not in CURRENCIES:
                logger.warning(f"Skipping row with invalid currency: {row}")
                continue

            if item_type in {"product", "service"}:
                items.append({
                    "name": name,
                    "description": description,
                    "type": item_type,
                    "price_cents": price_cents,
                    "currency": currency,
                })

    for i, item in enumerate(items):
        if not all(item.get(k) for k in ["name", "price_cents", "currency", "type"]):
            logger.warning(f"Invalid item at index {i}: {item}")
    return items


def load_item_category_map(csv_path):
    category_map = defaultdict(list)
    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            item_slug = slugify(row["item_name"].strip())
            raw_paths = row["categories"].split(";")
            for path in raw_paths:
                parts = [p.strip() for p in path.split(">")]
                if len(parts) == 2:
                    category_map[item_slug].append((parts[0], parts[1]))
    return category_map


def create_items_with_subtypes_from_csv(item_rows, category_map, users):
    items = []
    product_data = []  # (slug, quantity)
    service_data = []  # (slug, duration, service_type)

    existing_slugs = set(Item.all_objects.values_list("slug", flat=True))
    slug_set = set()

    def generate_unique_slug(name):
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        while slug in existing_slugs or slug in slug_set:
            counter += 1
            slug = f"{base_slug}-{counter}"
        slug_set.add(slug)
        return slug

    for row in item_rows:
        seller = random.choice(users)
        name = row["name"]
        description = row["description"]
        item_type = row["type"].strip().lower()
        price_cents = row["price_cents"]
        currency = row["currency"]
        slug = generate_unique_slug(name)

        item = Item(
            name=name,
            slug=slug,
            description=description,
            price_cents=price_cents,
            currency=currency,
            seller=seller,
        )
        items.append(item)

        if item_type == "product":
            product_data.append((slug, random.randint(1, 100)))
        elif item_type == "service":
            service_data.append((slug, random.randint(30, 300), random.choice(SERVICE_TYPES)))
        else:
            logger.warning(f"Unexpected item_type={item_type!r}: {row}")

    for idx, item in enumerate(items):
        if item.price_cents is None:
            logger.error(f"price_cents=None at index {idx}: name={item.name!r}, slug={item.slug!r}")

    Item.objects.bulk_create(items)

    saved_items = list(Item.objects.filter(slug__in=[i.slug for i in items]))
    item_map = {item.slug: item for item in saved_items}

    for slug, quantity in product_data:
        if slug not in item_map:
            logger.error(f"slug {slug!r} not found when creating Product")
            continue

        saved_item = item_map[slug]
        Product.objects.create(
            item_ptr_id=saved_item.id,
            name=saved_item.name,
            slug=saved_item.slug,
            description=saved_item.description,
            price_cents=saved_item.price_cents,
            currency=saved_item.currency,
            seller_id=saved_item.seller_id,
            quantity=quantity,
        )

    for slug, duration, service_type in service_data:
        if slug not in item_map:
            logger.error(f"slug {slug!r} not found when creating Service")
            continue

        saved_item = item_map[slug]
        Service.objects.create(
            item_ptr_id=saved_item.id,
            name=saved_item.name,
            slug=saved_item.slug,
            description=saved_item.description,
            price_cents=saved_item.price_cents,
            currency=saved_item.currency,
            seller_id=saved_item.seller_id,
            service_duration=duration,
            service_type=service_type,
        )

    for item in saved_items:
        paths = category_map.get(item.slug, [])
        for parent_name, child_name in paths:
            parent, _ = Category.objects.get_or_create(name=parent_name, parent=None)
            child, _ = Category.objects.get_or_create(name=child_name, parent=parent)
            ItemCategory.objects.get_or_create(item=item, category=child)

    return saved_items
