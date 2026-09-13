from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "merchant_name", "date", "total", "status", "owner")
    list_filter = ("status", "doc_type", "category")
    search_fields = ("title", "merchant_name")
