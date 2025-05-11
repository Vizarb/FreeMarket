from rest_framework.permissions import BasePermission, SAFE_METHODS

class HasRole(BasePermission):
    """
    View-level RBAC: allows any SAFE_METHODS unless 
    you explicitly set `required_roles` on the view.
    """
    def has_permission(self, request, view):
        # 1) If it’s a read-only request, let it through
        if request.method in SAFE_METHODS:
            return True

        # 2) Grab roles required by the view (or None)
        required = getattr(view, 'required_roles', None)
        if not required:
            return True

        # 3) Must be authenticated
        user = request.user
        if not (user and user.is_authenticated):
            return False

        # 4) Superusers & staff always allowed
        if user.is_staff or user.is_superuser:
            return True

        # 5) Finally, check group membership
        return user.groups.filter(name__in=required).exists()


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level: allows owners (seller/user) or staff/admin.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        # staff/superuser bypass
        if user.is_staff or user.is_superuser:
            return True
        # owner can be on `seller` or `user` attribute
        return getattr(obj, "seller", None) == user \
            or getattr(obj, "user", None) == user


class ReadOnlyOrOwner(BasePermission):
    """
    SAFE_METHODS always OK; otherwise only owner or staff.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_staff or user.is_superuser:
            return True
        return getattr(obj, "seller", None) == user \
            or getattr(obj, "user", None) == user
