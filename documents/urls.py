from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet

app_name = 'documents'

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='documents')

urlpatterns = [
    path('', include(router.urls)),
]
