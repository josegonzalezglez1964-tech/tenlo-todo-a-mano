import csv

from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from documents.models import Document

EXPORT_COLUMNS = [
    ("date", "Fecha"),
    ("merchant_name", "Comercio"),
    ("category", "Categoría"),
    ("total", "Total"),
    ("taxes", "Impuestos"),
    ("currency", "Moneda"),
    ("payment_method", "Método de pago"),
    ("status", "Estado"),
]


def _get_user_documents(user):
    return Document.objects.filter(owner=user).order_by('-date', '-created_at')


class ExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="facturas.csv"'

        writer = csv.writer(response)
        writer.writerow([label for _, label in EXPORT_COLUMNS])

        for doc in _get_user_documents(request.user):
            writer.writerow([getattr(doc, field) or '' for field, _ in EXPORT_COLUMNS])

        return response


class ExportExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "Facturas"

        sheet.append([label for _, label in EXPORT_COLUMNS])

        for doc in _get_user_documents(request.user):
            sheet.append([str(getattr(doc, field) or '') for field, _ in EXPORT_COLUMNS])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="facturas.xlsx"'
        workbook.save(response)
        return response


class ExportPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="facturas.pdf"'

        doc = SimpleDocTemplate(response, pagesize=A4)
        data = [[label for _, label in EXPORT_COLUMNS]]

        for document in _get_user_documents(request.user):
            data.append([str(getattr(document, field) or '') for field, _ in EXPORT_COLUMNS])

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2c3e50")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f2f2")]),
        ]))

        doc.build([table])
        return response
