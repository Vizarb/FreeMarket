from django.db import models

class Gender(models.TextChoices):
    MALE = "Male", "Male"
    FEMALE = "Female", "Female"
    OTHER = "Other", "Other"

class UserAction(models.TextChoices):
    LOGIN = 'login', 'Login'
    LOGOUT = 'logout', 'Logout'
    FAILED_LOGIN = 'failed_login', 'Failed Login Attempt'
    PASSWORD_CHANGE = 'password_change', 'Password Change'
    PASSWORD_RESET = 'password_reset', 'Password Reset'
    ACCOUNT_UPDATE = 'account_update', 'Account Update'
    ACCOUNT_DELETION = 'account_deletion', 'Account Deletion'
    PURCHASE = 'purchase', 'Purchase'
    REFUND = 'refund', 'Refund Issued'
    ADD_PRODUCT = 'add_product', 'Product Added'
    UPDATE_PRODUCT = 'update_product', 'Product Updated'
    DELETE_PRODUCT = 'delete_product', 'Product Deleted'
    CART_UPDATE = 'cart_update', 'Cart Updated'
    CHECKOUT = 'checkout', 'Checkout Initiated'
    WISHLIST_UPDATE = 'wishlist_update', 'Wishlist Updated'
    REVIEW_SUBMITTED = 'review_submitted', 'Review Submitted'
    ADMIN_ACTION = 'admin_action', 'Admin Action'
    CREATE_ORDER = 'create_order', 'Order Created'
    UPDATE_ORDER = 'update_order', 'Order Updated'
    DELETE_ORDER = 'delete_order', 'Order Deleted'
    CREATE_SERVICE = 'create_service', 'Service Created'
    UPDATE_SERVICE = 'update_service', 'Service Updated'
    DELETE_SERVICE = 'delete_service', 'Service Deleted'
    SOFT_DELETE = 'soft_delete', 'Soft Deleted'
    RESTORE = 'restore', 'Restored'

class ActionStatus(models.TextChoices):
    SUCCESS = 'success', 'Success'
    FAILED = 'failed', 'Failed'
    PENDING = 'pending', 'Pending'

class SellerApplicationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'