
CURRENCIES = ["USD", "EUR", "GBP"]

SERVICE_TYPES = ["Consulting", "Maintenance", "Other"]

ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]

PAYMENT_METHODS = ["Credit Card", "PayPal", "Bank Transfer"]

ROLE_PERMISSIONS = {
    "Buyer": [
        "view_item", "view_product", "view_service",
        "view_order", "add_order",
        "view_cart", "add_cartitem", "change_cartitem", "delete_cartitem",
    ],
    "Seller": [
        "add_item", "change_item", "delete_item", "view_item",
        "add_product", "change_product", "delete_product", "view_product",
        "add_service", "change_service", "delete_service", "view_service",
        "view_order", "view_category", "view_itemcategory",
    ],
    "Support": [
        "view_customuser", "view_order", "view_payment", "view_cart",
    ],
    "Manager": [
        "view_item", "view_product", "view_service",
        "add_item", "change_item", "delete_item",
        "change_order", "view_order", "view_payment",
        "change_customuser", "view_customuser", "view_cartitem", "change_cartitem",
    ],
    "Admin": [
        "add_customuser", "change_customuser", "delete_customuser", "view_customuser",
        "add_group", "change_group", "delete_group", "view_group",
        "add_permission", "change_permission", "delete_permission", "view_permission",
    ],
}
