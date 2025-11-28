#!/bin/sh
while inotifywait -e close_write /etc/nginx/custom/denied-ips.conf; do
  nginx -s reload
done