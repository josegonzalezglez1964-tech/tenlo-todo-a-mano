import django_filters

from .models import Document


class DocumentFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category", lookup_expr="iexact")
    merchant = django_filters.CharFilter(field_name="merchant_name", lookup_expr="icontains")
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")
    amount_min = django_filters.NumberFilter(field_name="total", lookup_expr="gte")
    amount_max = django_filters.NumberFilter(field_name="total", lookup_expr="lte")

    class Meta:
        model = Document
        fields = ["category", "status", "doc_type"]
