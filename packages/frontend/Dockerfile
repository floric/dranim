FROM library/nginx:alpine

RUN mkdir -p /var/www/html
WORKDIR /var/www/html
ADD ./build .
COPY scripts/serve.sh /serve.sh

EXPOSE 80

CMD /serve.sh