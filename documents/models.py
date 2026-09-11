from django.db import models

def document_upload_path(instance, filename):
    return f"documents/{instance.id or 'new'}/{filename}"

class Document(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('favorite', 'Favorite'),
    ]

    doc_type = models.CharField(max_length=50, default='receipt')
    title = models.CharField(max_length=255, blank=True)
    merchant_name = models.CharField(max_length=255, blank=True)
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    taxes = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True)
    payment_method = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    ticket_number = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    attachment = models.FileField(upload_to=document_upload_path, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title or self.merchant_name or f"Document {self.id}"
