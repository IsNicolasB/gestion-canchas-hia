# Comprime los volúmenes Docker y la carpeta local data/postgres_data2

docker run --rm -v nextcloud_data:/data -v ${PWD}:/backup alpine tar czf /backup/nextcloud_data.tar.gz -C /data .
docker run --rm -v postgres_data:/data -v ${PWD}:/backup alpine tar czf /backup/db_data.tar.gz -C /data .
tar czf postgres_data2.tar.gz -C ./data postgres_data2

Write-Host "Backups generados: nextcloud_data.tar.gz, db_data.tar.gz y postgres_data2.tar.gz"