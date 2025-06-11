from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('base', '0003_create_db_views'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Step 1: Create trigger function
            CREATE OR REPLACE FUNCTION update_item_search_vector() RETURNS trigger AS $$
            BEGIN
              NEW.search_vector :=
                to_tsvector('english', coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''));
              RETURN NEW;
            END
            $$ LANGUAGE plpgsql;

            -- Step 2: Create trigger on insert and update
            CREATE TRIGGER trg_update_item_search_vector
            BEFORE INSERT OR UPDATE ON base_item
            FOR EACH ROW
            EXECUTE FUNCTION update_item_search_vector();
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS trg_update_item_search_vector ON base_item;
            DROP FUNCTION IF EXISTS update_item_search_vector();
            """
        ),
    ]
