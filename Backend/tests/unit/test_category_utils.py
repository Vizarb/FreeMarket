# tests/unit/test_category_utils.py
import pytest
from base.utils.category_utils import get_descendant_ids
from base.models.category import Category

pytestmark = [pytest.mark.unit]

def test_get_descendants_flat_tree(db):
    root = Category.objects.create(name="A")
    c1 = Category.objects.create(name="B", parent=root)
    c2 = Category.objects.create(name="C", parent=c1)
    assert set(get_descendant_ids(root)) == {root.id, c1.id, c2.id}
