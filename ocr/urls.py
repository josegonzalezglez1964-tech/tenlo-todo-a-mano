from django.urls import path

from .views import OCRScanDocumentView

app_name = 'ocr'

urlpatterns = [
    path('documents/<int:document_id>/scan/', OCRScanDocumentView.as_view(), name='ocr-scan'),
]
