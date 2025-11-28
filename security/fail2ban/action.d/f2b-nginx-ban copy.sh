#!/bin/bash
# f2b-nginx-ban.sh
# Uso: f2b-nginx-ban.sh add <ip>  | f2b-nginx-ban.sh del <ip>
# Mantiene /etc/nginx/custom/denied-ips.data

DENY_FILE="/etc/nginx/custom/denied-ips.data"
IP="$2"

if [ "$1" = "add" ]; then
    grep -qx "$IP" "$DENY_FILE" || echo "$IP" >> "$DENY_FILE"
elif [ "$1" = "del" ]; then
    if [ -f "$DENY_FILE" ]; then
        grep -vx "$IP" "$DENY_FILE" > "$DENY_FILE.tmp" && mv "$DENY_FILE.tmp" "$DENY_FILE"
    fi
fi

# ModSecurity NO necesita reload