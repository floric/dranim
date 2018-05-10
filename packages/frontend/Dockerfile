FROM library/nginx:alpine

RUN mkdir -p /var/www/html
WORKDIR /var/www/html
ADD ./dist ./dist
ADD ./dist/index.html .
COPY scripts/serve.sh /serve.sh

EXPOSE 80

CMD /serve.sh