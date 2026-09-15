from django.urls import path

from .views import ExportCSVView, ExportExcelView, ExportPDFView

app_name = 'exports'

urlpatterns = [
    path('csv/', ExportCSVView.as_view(), name='export-csv'),
    path('excel/', ExportExcelView.as_view(), name='export-excel'),
    path('pdf/', ExportPDFView.as_view(), name='export-pdf'),
]
