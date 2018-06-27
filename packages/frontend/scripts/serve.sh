#!/bin/sh

cat <<'EOF' > /etc/nginx/nginx.conf
user nginx;
worker_processes  1;
error_log /dev/stderr warn;
pid /var/run/nginx.pid;
events {
    worker_connections 1024;
}
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    log_format main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /dev/stdout main;
    client_header_timeout 10s;
    client_body_timeout 200s;
    client_max_body_size 512m;
    gzip on;
    gzip_proxied no-cache no-store private expired auth;
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
    upstream backend {
        server backend:3000;
        keepalive 8;
    }
    server {
        listen 80;
        server_name localhost;
        return 301 https://$host$request_uri;
    }
    server {
        listen 443 ssl http2;
        server_name localhost;
        ssl_certificate /etc/nginx/server.crt;
        ssl_certificate_key /etc/nginx/server.key;
        ssl_session_cache builtin:1000 shared:SSL:10m;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;
        ssl_prefer_server_ciphers on;
        root /var/www/html;
        location / {
            try_files $uri /index.html;
        }
        location /api {
            proxy_cache off;
            proxy_redirect off;
            proxy_pass http://backend;
            proxy_pass_request_body on;
            proxy_pass_request_headers on;
            proxy_read_timeout 240s;
            proxy_send_timeout 240s;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_request_buffering on;
            proxy_max_temp_file_size 1024m;
        }
    }
}
EOF

echo 'Serving Nginx'

exec nginx -g "daemon off;"
