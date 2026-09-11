from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id', 'upload_key', 'doc_type', 'title', 'merchant_name',
            'date', 'time', 'total', 'taxes', 'currency', 'payment_method',
            'category', 'notes', 'ticket_number', 'status', 'attachment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'upload_key', 'created_at', 'updated_at']
