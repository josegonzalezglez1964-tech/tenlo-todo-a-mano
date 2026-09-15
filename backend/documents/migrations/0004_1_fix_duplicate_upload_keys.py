import uuid

from django.db import migrations


def fix_duplicate_upload_keys(apps, schema_editor):
    Document = apps.get_model("documents", "Document")
    for document in Document.objects.all():
        document.upload_key = uuid.uuid4()
        document.save(update_fields=["upload_key"])


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0004_populate_upload_keys"),
    ]

    operations = [
        migrations.RunPython(
            fix_duplicate_upload_keys,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
