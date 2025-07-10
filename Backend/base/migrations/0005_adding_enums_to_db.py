from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('base', '0004_create_db_views'),
    ]

    operations = [
        # --- Gender ENUM ---
        migrations.RunSQL(
            """
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
                    CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
                END IF;
            END $$;
            """,
            reverse_sql="DROP TYPE IF EXISTS gender_enum;"
        ),
        migrations.RunSQL(
            """
            ALTER TABLE base_customuser
            ALTER COLUMN gender TYPE gender_enum USING gender::gender_enum;
            """,
            reverse_sql="""
            ALTER TABLE base_customuser
            ALTER COLUMN gender TYPE VARCHAR(20);
            """
        ),

        # --- User Action ENUM ---
        migrations.RunSQL(
            """
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_action') THEN
                    CREATE TYPE user_action AS ENUM (
                        'login',
                        'logout',
                        'failed_login',
                        'password_change',
                        'password_reset',
                        'account_update',
                        'account_deletion',
                        'purchase',
                        'refund',
                        'add_product',
                        'update_product',
                        'delete_product',
                        'cart_update',
                        'checkout',
                        'wishlist_update',
                        'review_submitted',
                        'admin_action',
                        'create_order',
                        'update_order',
                        'delete_order',
                        'create_service',
                        'update_service',
                        'delete_service',
                        'soft_delete',
                        'restore'
                    );
                END IF;
            END $$;
            """,
            reverse_sql="DROP TYPE IF EXISTS user_action;"
        ),

        # --- Action Status ENUM ---
        migrations.RunSQL(
            """
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'action_status') THEN
                    CREATE TYPE action_status AS ENUM ('success', 'failed', 'pending');
                END IF;
            END $$;
            """,
            reverse_sql="DROP TYPE IF EXISTS action_status;"
        ),

        # --- Update Columns to Use ENUMs ---
        migrations.RunSQL(
            """
            ALTER TABLE base_useractivitylog
            ALTER COLUMN action TYPE user_action USING action::user_action;
            """,
            reverse_sql="""
            ALTER TABLE base_useractivitylog
            ALTER COLUMN action TYPE VARCHAR(50);
            """
        ),
        migrations.RunSQL(
            """
            ALTER TABLE base_useractivitylog
            ALTER COLUMN status TYPE action_status USING status::action_status;
            """,
            reverse_sql="""
            ALTER TABLE base_useractivitylog
            ALTER COLUMN status TYPE VARCHAR(20);
            """
        ),
    ]
