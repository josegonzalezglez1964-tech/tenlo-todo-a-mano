from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Document
from .serializers import DocumentSerializer

class DocumentViewSet(ModelViewSet):
    queryset = Document.objects.all().order_by('-created_at')
    serializer_class = DocumentSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]
