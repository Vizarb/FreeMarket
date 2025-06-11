from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('base', '0002_create_rbac_groups'),
    ]

    operations = [
    # 1. item_details
    migrations.RunSQL(
        sql="""
            CREATE OR REPLACE VIEW item_details AS
            SELECT
                i.id AS item_id,
                i.slug,
                i.name,
                i.description,
                i.price_cents,
                i.currency,
                u.username AS seller,
                COALESCE(
                    string_agg(DISTINCT c.name::text, ', ' ORDER BY c.name::text),
                    'Uncategorized'
                ) AS categories,
                COALESCE(
                    array_agg(DISTINCT c.id ORDER BY c.id),
                    ARRAY[]::integer[]
                ) AS category_ids,
                i.search_vector
            FROM base_item i
            JOIN base_customuser u ON i.seller_id = u.id
            LEFT JOIN base_itemcategory ic ON i.id = ic.item_id
            LEFT JOIN base_category c ON ic.category_id = c.id
            WHERE NOT i.is_deleted AND NOT u.is_deleted
            GROUP BY
                i.id, i.slug, i.name, i.description,
                i.price_cents, i.currency, u.username, i.search_vector;
        """,
        reverse_sql="DROP VIEW IF EXISTS item_details;"
    ),

    # 2. product_details
    migrations.RunSQL(
        sql="""
            CREATE OR REPLACE VIEW product_details AS
            SELECT
              p.item_ptr_id   AS item_id,
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
            FROM base_product p
            JOIN item_details i ON p.item_ptr_id = i.item_id;
        """,
        reverse_sql="DROP VIEW IF EXISTS product_details;"
    ),

    # 3. service_details
    migrations.RunSQL(
        sql="""
            CREATE OR REPLACE VIEW service_details AS
            SELECT
              s.item_ptr_id     AS item_id,
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
            FROM base_service s
            JOIN item_details i ON s.item_ptr_id = i.item_id;
        """,
        reverse_sql="DROP VIEW IF EXISTS service_details;"
    ),

    # 4. item_search_view
    migrations.RunSQL(
        sql="""
            CREATE OR REPLACE VIEW item_search_view AS
            SELECT
              item_id,
              slug,
              name,
              description,
              price_cents,
              currency,
              seller,
              'product' AS item_type,
              categories,
              category_ids,
              quantity,
              NULL::INTEGER AS service_duration,
              NULL::VARCHAR AS service_type,
              search_vector
            FROM product_details

            UNION ALL

            SELECT
              item_id,
              slug,
              name,
              description,
              price_cents,
              currency,
              seller,
              'service' AS item_type,
              categories,
              category_ids,
              NULL::INTEGER AS quantity,
              service_duration,
              service_type,
              search_vector
            FROM service_details;
        """,
        reverse_sql="DROP VIEW IF EXISTS item_search_view;"
    ),

        # 5. cart_overview
        migrations.RunSQL(
            sql="""
                CREATE OR REPLACE VIEW cart_overview AS
                  SELECT 
                    ci.id                   AS cart_item_id,
                    ci.cart_id,
                    c.user_id,
                    u.username              AS owner,
                    ci.item_id,
                    i.name                  AS item_name,
                    ci.quantity            AS total_quantity,
                    ci.price_snapshot_cents AS latest_price,
                    CASE
                      WHEN p.item_ptr_id IS NOT NULL THEN 'product'
                      WHEN s.item_ptr_id IS NOT NULL THEN 'service'
                      ELSE 'unknown'
                    END AS item_type
                  FROM base_cartitem ci
                  JOIN base_cart c       ON ci.cart_id = c.id
                  JOIN base_customuser u ON c.user_id = u.id
                  JOIN base_item i       ON ci.item_id = i.id
                  LEFT JOIN base_product p ON p.item_ptr_id = i.id
                  LEFT JOIN base_service s ON s.item_ptr_id = i.id
                  WHERE ci.quantity > 0
                    AND (ci.is_deleted IS FALSE OR ci.is_deleted IS NULL)
                    AND (i.is_deleted IS FALSE OR i.is_deleted IS NULL);
            """,
            reverse_sql="DROP VIEW IF EXISTS cart_overview;"
        ),

        # 6. most_active_users
        migrations.RunSQL(
            sql="""
                CREATE OR REPLACE VIEW most_active_users AS
                SELECT
                  o.user_id,
                  u.username,
                  COUNT(o.id)            AS total_orders,
                  SUM(o.total_price_cents) AS total_spent
                FROM base_order o
                JOIN base_customuser u ON o.user_id = u.id
                GROUP BY o.user_id, u.username
                ORDER BY SUM(o.total_price_cents) DESC;
            """,
            reverse_sql="DROP VIEW IF EXISTS most_active_users;"
        ),

        # 7. top_selling_items
        migrations.RunSQL(
            sql="""
                CREATE OR REPLACE VIEW top_selling_items AS
                SELECT
                  oi.item_id,
                  i.name               AS product_name,
                  SUM(oi.quantity)     AS total_sold,
                  SUM(oi.quantity * oi.price_cents) AS total_revenue
                FROM base_orderitem oi
                JOIN base_item i       ON oi.item_id = i.id
                LEFT JOIN base_product p ON p.item_ptr_id = i.id
                LEFT JOIN base_service s ON s.item_ptr_id = i.id
                GROUP BY oi.item_id, i.name
                ORDER BY SUM(oi.quantity) DESC;
            """,
            reverse_sql="DROP VIEW IF EXISTS top_selling_items;"
        ),

        # 8. user_order_history
        migrations.RunSQL(
            sql="""
                CREATE OR REPLACE VIEW user_order_history AS
                SELECT
                  o.id                   AS order_id,
                  o.user_id,
                  u.username             AS customer,
                  o.status,
                  o.total_price_cents,
                  o.created_at,
                  SUM(oi.quantity)       AS total_items
                FROM base_order o
                JOIN base_customuser u ON o.user_id = u.id
                JOIN base_orderitem oi ON o.id = oi.order_id
                JOIN item_details id   ON oi.item_id = id.item_id
                GROUP BY o.id, u.username, o.status, o.total_price_cents, o.created_at;
            """,
            reverse_sql="DROP VIEW IF EXISTS user_order_history;"
        ),

        # 9. order_details
        migrations.RunSQL(
            sql="""
                CREATE OR REPLACE VIEW order_details AS
                SELECT
                  o.id                   AS order_id,
                  o.user_id,
                  u.username             AS customer,
                  o.status,
                  o.total_price_cents,
                  o.created_at,
                  o.updated_at
                FROM base_order o
                JOIN base_customuser u ON o.user_id = u.id;
            """,
            reverse_sql="DROP VIEW IF EXISTS order_details;"
        ),

        # 10. order_item_details
        migrations.RunSQL(
            sql="""
                CREATE OR REPLACE VIEW order_item_details AS
                SELECT
                  oi.id                  AS order_item_id,
                  oi.order_id,
                  oi.item_id,
                  i.name                 AS item_name,
                  i.seller_id,
                  oi.quantity,
                  oi.price_cents
                FROM base_orderitem oi
                JOIN base_item i       ON oi.item_id = i.id;
            """,
            reverse_sql="DROP VIEW IF EXISTS order_item_details;"
        ),
    ]
