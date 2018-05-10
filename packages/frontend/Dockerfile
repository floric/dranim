FROM node:slim
WORKDIR /build
ADD . .
RUN yarn
RUN yarn build

FROM library/nginx:alpine
RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY --from=0 ./build/dist .
COPY scripts/serve.sh /serve.sh

EXPOSE 80

CMD /serve.sh