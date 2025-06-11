# base/migrations/0002_create_roles.py
from django.db import migrations


def create_roles(apps, schema_editor):
    Group      = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')

    # 1) Create the five roles
    buyer, _   = Group.objects.get_or_create(name='Buyer')
    seller, _  = Group.objects.get_or_create(name='Seller')
    support, _ = Group.objects.get_or_create(name='Support')
    manager, _ = Group.objects.get_or_create(name='Manager')
    admin, _   = Group.objects.get_or_create(name='Admin')

    # 2) Buyer permissions (view, order, cart, address)
    buyer_perms = [
        'view_item', 'view_product', 'view_service',
        'add_order', 'view_order', 'view_orderitem',
        'add_cart', 'change_cart', 'delete_cart', 'view_cart',
        'add_address', 'change_address', 'delete_address', 'view_address',
        'view_userorderhistory',
    ]

    # 3) Seller permissions (Product & Service CRUD + basic order view)
    seller_perms = [
        'add_product', 'change_product', 'delete_product', 'view_product',
        'add_service', 'change_service', 'delete_service', 'view_service',
        'view_order', 'view_orderitem',
    ]

    # 4) Support permissions (customer-service & logs)
    support_perms = [
        'view_order', 'change_order',
        'view_user', 'view_payment',
        'view_cartoverview', 'view_userorderhistory',
        'view_cartactivitylog', 'view_useractivitylog',
    ]

    # 5) Manager permissions (operations & analytics)
    manager_perms = [
        'add_category', 'change_category', 'delete_category', 'view_category',
        'view_top_selling_products', 'view_most_active_users',
        'view_itemdetails', 'view_orderdetails', 'view_orderitemdetails',
    ]

    # Function to assign permissions
    def assign_perms(group, codenames):
        for codename in codenames:
            perm = Permission.objects.filter(codename=codename).first()
            if perm:
                group.permissions.add(perm)

    # Assign perms to each group
    assign_perms(buyer, buyer_perms)
    assign_perms(seller, seller_perms)
    assign_perms(support, support_perms)
    assign_perms(manager, manager_perms)

    # 6) Admin gets everything
    all_perms = Permission.objects.all()
    admin.permissions.set(all_perms)


def delete_roles(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    for name in ['Buyer', 'Seller', 'Support', 'Manager', 'Admin']:
        Group.objects.filter(name=name).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_roles, delete_roles),
    ]
