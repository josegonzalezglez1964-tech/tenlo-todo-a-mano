#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/tenlo-todo-a-mano/backend
DEST=~/storage/downloads/TenloBackups
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p "$DEST"
python - << PY
import sqlite3
src = sqlite3.connect("db.sqlite3")
dst = sqlite3.connect("$DEST/db_$STAMP.sqlite3")
src.backup(dst)
dst.close()
src.close()
PY
tar -czf "$DEST/media_$STAMP.tar.gz" media
ls -1t "$DEST"/db_*.sqlite3 | tail -n +11 | xargs -r rm --
ls -1t "$DEST"/media_*.tar.gz | tail -n +11 | xargs -r rm --
echo "Copia lista en $DEST ($STAMP)"
