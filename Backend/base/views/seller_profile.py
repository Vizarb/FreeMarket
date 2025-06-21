from rest_framework.permissions import IsAuthenticatedOrReadOnly
from base.permissions import HasRole
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from base.models.seller_profile import SellerProfile
from base.serializers.seller_profile import SellerProfileSerializer

class SellerProfileViewSet(viewsets.ModelViewSet):
    queryset = SellerProfile.objects.select_related("user").all()
    serializer_class = SellerProfileSerializer
    lookup_field = "slug"  # for /seller-profiles/:slug/
    
    # Default: allow read-only to public, write only to seller/admin
    permission_classes = [IsAuthenticatedOrReadOnly, HasRole]
    required_roles = ["Seller", "Admin"]

    @action(detail=False, methods=["get"], url_path="me", permission_classes=[HasRole])
    def me(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Not authenticated"}, status=401)

        try:
            profile = SellerProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except SellerProfile.DoesNotExist:
            return Response({"error": "Seller profile not found."}, status=404)
