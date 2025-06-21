# FreeMarket Database Views

This file documents all PostgreSQL views in the `public` schema.

## `cart_overview`

```sql
SELECT ci.id AS cart_item_id,
    ci.cart_id,
    c.user_id,
    u.username AS owner,
    ci.item_id,
    i.name AS item_name,
    ci.quantity AS total_quantity,
    ci.price_snapshot_cents AS latest_price,
        CASE
            WHEN (p.item_ptr_id IS NOT NULL) THEN 'product'::text
            WHEN (s.item_ptr_id IS NOT NULL) THEN 'service'::text
            ELSE 'unknown'::text
        END AS item_type
   FROM (((((base_cartitem ci
     JOIN base_cart c ON ((ci.cart_id = c.id)))
     JOIN base_customuser u ON ((c.user_id = u.id)))
     JOIN base_item i ON ((ci.item_id = i.id)))
     LEFT JOIN base_product p ON ((p.item_ptr_id = i.id)))
     LEFT JOIN base_service s ON ((s.item_ptr_id = i.id)))
  WHERE ((ci.quantity > 0) AND ((ci.is_deleted IS FALSE) OR (ci.is_deleted IS NULL)) AND ((i.is_deleted IS FALSE) OR (i.is_deleted IS NULL)));
```

## `item_details`

```sql
SELECT i.id AS item_id,
    i.slug,
    i.name,
    i.description,
    i.price_cents,
    i.currency,
    u.username AS seller,
    COALESCE(string_agg(DISTINCT (c.name)::text, ', '::text ORDER BY (c.name)::text), 'Uncategorized'::text) AS categories,
    COALESCE(array_agg(DISTINCT c.id ORDER BY c.id), ARRAY[]::integer[]) AS category_ids,
    i.search_vector
   FROM (((base_item i
     JOIN base_customuser u ON ((i.seller_id = u.id)))
     LEFT JOIN base_itemcategory ic ON ((i.id = ic.item_id)))
     LEFT JOIN base_category c ON ((ic.category_id = c.id)))
  WHERE ((NOT i.is_deleted) AND (NOT u.is_deleted))
  GROUP BY i.id, i.slug, i.name, i.description, i.price_cents, i.currency, u.username, i.search_vector;
```

## `item_search_view`

```sql
SELECT product_details.item_id,
    product_details.slug,
    product_details.name,
    product_details.description,
    product_details.price_cents,
    product_details.currency,
    product_details.seller,
    'product'::text AS item_type,
    product_details.categories,
    product_details.category_ids,
    product_details.quantity,
    NULL::integer AS service_duration,
    NULL::character varying AS service_type,
    product_details.search_vector
   FROM product_details
UNION ALL
 SELECT service_details.item_id,
    service_details.slug,
    service_details.name,
    service_details.description,
    service_details.price_cents,
    service_details.currency,
    service_details.seller,
    'service'::text AS item_type,
    service_details.categories,
    service_details.category_ids,
    NULL::integer AS quantity,
    service_details.service_duration,
    service_details.service_type,
    service_details.search_vector
   FROM service_details;
```

## `most_active_users`

```sql
SELECT o.user_id,
    u.username,
    count(o.id) AS total_orders,
    sum(o.total_price_cents) AS total_spent
   FROM (base_order o
     JOIN base_customuser u ON ((o.user_id = u.id)))
  GROUP BY o.user_id, u.username
  ORDER BY (sum(o.total_price_cents)) DESC;
```

## `order_details`

```sql
SELECT o.id AS order_id,
    o.user_id,
    u.username AS customer,
    o.status,
    o.total_price_cents,
    o.created_at,
    o.updated_at
   FROM (base_order o
     JOIN base_customuser u ON ((o.user_id = u.id)));
```

## `order_item_details`

```sql
SELECT oi.id AS order_item_id,
    oi.order_id,
    oi.item_id,
    i.name AS item_name,
    i.seller_id,
    oi.quantity,
    oi.price_cents
   FROM (base_orderitem oi
     JOIN base_item i ON ((oi.item_id = i.id)));
```

## `product_details`

```sql
SELECT p.item_ptr_id AS item_id,
    i.slug,
    i.name,
    i.description,
    i.price_cents,
    i.currency,
    i.seller,
    i.categories,
    i.category_ids,
    p.quantity,
    i.search_vector
   FROM (base_product p
     JOIN item_details i ON ((p.item_ptr_id = i.item_id)));
```

## `service_details`

```sql
SELECT s.item_ptr_id AS item_id,
    i.slug,
    i.name,
    i.description,
    i.price_cents,
    i.currency,
    i.seller,
    i.categories,
    i.category_ids,
    s.service_duration,
    s.service_type,
    i.search_vector
   FROM (base_service s
     JOIN item_details i ON ((s.item_ptr_id = i.item_id)));
```

## `top_selling_items`

```sql
SELECT oi.item_id,
    i.name AS product_name,
    sum(oi.quantity) AS total_sold,
    sum((oi.quantity * oi.price_cents)) AS total_revenue
   FROM (((base_orderitem oi
     JOIN base_item i ON ((oi.item_id = i.id)))
     LEFT JOIN base_product p ON ((p.item_ptr_id = i.id)))
     LEFT JOIN base_service s ON ((s.item_ptr_id = i.id)))
  GROUP BY oi.item_id, i.name
  ORDER BY (sum(oi.quantity)) DESC;
```

## `user_order_history`

```sql
SELECT o.id AS order_id,
    o.user_id,
    u.username AS customer,
    o.status,
    o.total_price_cents,
    o.created_at,
    sum(oi.quantity) AS total_items
   FROM (((base_order o
     JOIN base_customuser u ON ((o.user_id = u.id)))
     JOIN base_orderitem oi ON ((o.id = oi.order_id)))
     JOIN item_details id ON ((oi.item_id = id.item_id)))
  GROUP BY o.id, u.username, o.status, o.total_price_cents, o.created_at;
```

