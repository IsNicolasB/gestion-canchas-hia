# Restaura los volúmenes Docker y la carpeta local data/postgres_data2

docker volume create nextcloud_data
docker volume create postgres_data

docker run --rm -v nextcloud_data:/data -v ${PWD}:/backup alpine tar xzf /backup/nextcloud_data.tar.gz -C /data
docker run --rm -v postgres_data:/data -v ${PWD}:/backup alpine tar xzf /backup/db_data.tar.gz -C /data


# Crear el directorio ./data si no existe
if (!(Test-Path -Path './data')) {
	New-Item -ItemType Directory -Path './data' | Out-Null
}

# Restaura la carpeta local data/postgres_data2
tar xzf postgres_data2.tar.gz -C ./data

Write-Host "Restauración completada: nextcloud_data, postgres_data y data/postgres_data2"