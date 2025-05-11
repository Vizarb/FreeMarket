import pytest
from base.models.item import Item  # Assuming Item inherits from BaseModel
pytestmark = [pytest.mark.unit]


pytestmark = [pytest.mark.django_db]

def test_soft_delete_sets_fields(product_factory):
    item = product_factory()
    assert not item.is_deleted
    assert item.deleted_at is None

    item.soft_delete()
    item.refresh_from_db()

    assert item.is_deleted is True
    assert item.deleted_at is not None


def test_restore_clears_soft_delete(product_factory):
    item = product_factory()
    item.soft_delete()
    item.restore()
    item.refresh_from_db()

    assert item.is_deleted is False
    assert item.deleted_at is None


def test_model_delete_calls_soft_delete(mocker, product_factory):
    item = product_factory()
    spy = mocker.spy(item, "soft_delete")
    item.delete()
    spy.assert_called_once()


def test_bulk_soft_delete(product_factory):
    products = [product_factory(), product_factory()]
    Item.bulk_soft_delete(Item.objects.all())

    for product in Item.all_objects.all():
        assert product.is_deleted is True
        assert product.deleted_at is not None


def test_bulk_restore(product_factory):
    products = [product_factory(), product_factory()]
    Item.bulk_soft_delete(Item.objects.all())
    Item.bulk_restore(Item.all_objects.all())

    for product in Item.objects.all():
        assert product.is_deleted is False
        assert product.deleted_at is None


def test_all_with_deleted_manager(product_factory):
    item = product_factory()
    item.soft_delete()

    # Default manager returns non-deleted
    assert type(item).objects.count() == 0  # Use Product.objects, not Item.objects

    # All manager returns both
    all_items = type(item).all_objects.all()
    assert item in all_items

    # SoftDeleteManager's .deleted() only returns deleted
    deleted_items = type(item).objects.deleted()
    assert item in deleted_items

    # SoftDeleteManager's .all_with_deleted() returns everything
    all_with_deleted = type(item).objects.all_with_deleted()
    assert item in all_with_deleted
