import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0002_document_attachment"),
    ]

    operations = [
        migrations.AddField(
            model_name="document",
            name="upload_key",
            field=models.UUIDField(
                default=uuid.uuid4,
                editable=False,
                null=True,
            ),
        ),
    ]
