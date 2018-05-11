FROM node:slim
WORKDIR /build
COPY src ./src
COPY public ./public
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY .babelrc ./.babelrc
RUN yarn
RUN yarn build

FROM library/nginx:alpine
RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY --from=0 ./build/dist .
COPY test-certs/server.crt /etc/nginx/server.crt
COPY test-certs/server.key /etc/nginx/server.key
COPY scripts/serve.sh /serve.sh

EXPOSE 80 443

CMD /serve.sh