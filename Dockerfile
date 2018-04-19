FROM mhart/alpine-node:8 as builder

RUN mkdir /work
WORKDIR /work
ADD ./frontend ./
RUN yarn
RUN yarn run build

FROM library/nginx:1.13.0-alpine

RUN mkdir -p /var/www/html
WORKDIR /var/www/html
COPY --from=builder /work/build /var/www/html
COPY serve.sh /serve.sh
CMD /serve.sh