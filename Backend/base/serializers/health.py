from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Successful response',
            value={"status": "ok"},
            response_only=True
        )
    ]
)
class HealthCheckResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
