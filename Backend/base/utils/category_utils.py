# base/utils/category_utils.py
def get_descendant_ids(category):
    ids = [category.id]
    for child in category.subcategories.all():
        ids.extend(get_descendant_ids(child))
    return ids
