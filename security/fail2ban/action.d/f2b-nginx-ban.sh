#!/bin/bash
# f2b-nginx-ban.sh
# Uso: f2b-nginx-ban.sh add <ip>  | f2b-nginx-ban.sh del <ip>
# Mantiene /etc/nginx/denied-ips.conf y recarga nginx

DENY_FILE="/etc/nginx/custom/denied-ips.conf"
IP="$2"

if [ "$1" = "add" ]; then
    grep -q "^$IP " "$DENY_FILE" || echo "$IP 1;" >> "$DENY_FILE"
#    nginx -s reload
elif [ "$1" = "del" ]; then
    if [ -f "$DENY_FILE" ]; then
        grep -v "^$IP " "$DENY_FILE" > "$DENY_FILE.tmp" && mv "$DENY_FILE.tmp" "$DENY_FILE"
        #nginx -s reload
    fi
fi
