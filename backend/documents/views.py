from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from django_filters.rest_framework import DjangoFilterBackend

from .filters import DocumentFilter
from .models import Document
from .serializers import DocumentSerializer


class DocumentViewSet(ModelViewSet):
    serializer_class = DocumentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ["title", "merchant_name", "category"]
    ordering_fields = ["date", "total", "created_at"]
    filterset_class = DocumentFilter
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"])
    def categories(self, request):
        names = (
            self.get_queryset()
            .exclude(category="")
            .order_by("category")
            .values_list("category", flat=True)
            .distinct()
        )
        return Response(list(names))

    @action(detail=False, methods=["post"])
    def rename_category(self, request):
        old = (request.data.get("old") or "").strip()
        new = (request.data.get("new") or "").strip()
        if not old or not new:
            return Response(
                {"detail": "Hacen falta 'old' y 'new'."}, status=400
            )
        updated = self.get_queryset().filter(category__iexact=old).update(category=new)
        return Response({"updated": updated})
