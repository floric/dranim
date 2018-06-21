FROM library/nginx:alpine
RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY dist .
COPY test-certs/server.crt /etc/nginx/server.crt
COPY test-certs/server.key /etc/nginx/server.key
COPY scripts/serve.sh /serve.sh

EXPOSE 80 443

CMD /serve.sh