# FreeMarket SQL Functions

## `update_item_search_vector`
**Arguments:** 

**Returns:** trigger

```sql
CREATE OR REPLACE FUNCTION public.update_item_search_vector()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
            BEGIN
              NEW.search_vector :=
                to_tsvector('english', coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, ''));
              RETURN NEW;
            END
            $function$
```

