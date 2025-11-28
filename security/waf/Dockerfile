FROM owasp/modsecurity-crs:nginx-alpine
USER root
RUN apk add --no-cache inotify-tools
COPY default.conf.template /etc/nginx/templates/conf.d/default.conf.template
COPY custom-rules.conf /etc/nginx/custom/custom-rules.conf
COPY denied-ips.conf /etc/nginx/custom/denied-ips.conf
COPY certs /etc/nginx/certs
COPY auto-reload-nginx.sh /usr/local/bin/auto-reload-nginx.sh
RUN chmod +x /usr/local/bin/auto-reload-nginx.sh

USER nginx