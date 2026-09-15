import re
from datetime import datetime

import pytesseract
from PIL import Image
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import Document

IMAGE_EXTENSIONS = ("jpg", "jpeg", "png", "webp")

TOTAL_PATTERN = re.compile(
    r"(?:total|importe)[^\d]{0,15}(\d{1,4}[.,]\d{2})",
    re.IGNORECASE,
)
DATE_PATTERNS = [
    re.compile(r"\b(\d{2})[/\-](\d{2})[/\-](\d{4})\b"),
    re.compile(r"\b(\d{4})[/\-](\d{2})[/\-](\d{2})\b"),
]


def _guess_total(text):
    match = TOTAL_PATTERN.search(text)
    if not match:
        return None
    return match.group(1).replace(",", ".")


def _guess_date(text):
    for pattern in DATE_PATTERNS:
        match = pattern.search(text)
        if not match:
            continue
        groups = match.groups()
        try:
            if len(groups[0]) == 4:
                year, month, day = groups
            else:
                day, month, year = groups
            return datetime(int(year), int(month), int(day)).date().isoformat()
        except ValueError:
            continue
    return None


class OCRScanDocumentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, document_id):
        try:
            document = Document.objects.get(id=document_id, owner=request.user)
        except Document.DoesNotExist:
            raise NotFound("Documento no encontrado.")

        if not document.file:
            raise ValidationError("Este documento no tiene ningún archivo adjunto.")

        extension = document.file.name.rsplit(".", 1)[-1].lower()
        if extension not in IMAGE_EXTENSIONS:
            raise ValidationError(
                "El OCR solo funciona con imágenes (jpg, jpeg, png, webp) por ahora, no con PDF."
            )

        image = Image.open(document.file)
        raw_text = pytesseract.image_to_string(image, lang="spa+eng")

        return Response({
            "document_id": document.id,
            "raw_text": raw_text.strip(),
            "suggestions": {
                "total": _guess_total(raw_text),
                "date": _guess_date(raw_text),
            },
        })
