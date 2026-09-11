from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='documents')

urlpatterns = router.urls
from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
]
