#!/bin/sh

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
    client_body_timeout 200s;
    client_max_body_size 500M;
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
        return 301 https://$host$request_uri;
    }
    server {
        listen 443 http2;
        server_name localhost;
        ssl_certificate /etc/nginx/server.crt;
        ssl_certificate_key /etc/nginx/server.key;
        ssl on;
        ssl_session_cache  builtin:1000  shared:SSL:10m;
        ssl_protocols  TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers HIGH:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!MD5:!PSK:!RC4;
        ssl_prefer_server_ciphers on;
        root /var/www/html;
        location / {
            try_files $uri /index.html;
        }
        location /api {
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_max_temp_file_size 0;
            proxy_pass http://backend:3000;
            proxy_redirect off;
            proxy_read_timeout 5m;
        }
    }
}
EOF

exec nginx -g "daemon off;"
