#!/bin/sh

cat <<EOJS > /var/www/html/env.js
window.env = {
    "apiUrl": "${API_URL}"
};
EOJS

cat <<'EOF' > /etc/nginx/nginx.conf
user  nginx;
worker_processes  1;
error_log /dev/stderr warn;
pid        /var/run/nginx.pid;
events {
    worker_connections  1024;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /dev/stdout  main;
    tcp_nopush on;
    tcp_nodelay off;
    client_header_timeout 10s;
    client_body_timeout 10s;
    client_max_body_size 128k;
    reset_timedout_connection on;
    gzip on;
    gzip_types
        text/css
        text/javascript
        text/xml
        text/plain
        application/javascript
        application/x-javascript
        application/json
        application/xml
        application/rss+xml
        application/atom+xml
        font/truetype
        font/opentype
        image/svg+xml;
    server {
        listen 80;
        server_name localhost;
        root /var/www/html;
        location / {
            try_files $uri /index.html;
        }
        location /api {
            proxy_pass http://backend:3000;
            proxy_read_timeout 5m;
        }
    }
}
EOF

exec nginx -g "daemon off;"

# location @rewrites {
#            rewrite ^(.+)$ /index.html last;
#        }