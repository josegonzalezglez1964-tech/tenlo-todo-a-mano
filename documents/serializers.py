from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'doc_type', 'title', 'merchant_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
