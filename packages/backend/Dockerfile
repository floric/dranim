FROM node:slim

WORKDIR /
COPY dist .
COPY config config
ENV NODE_ENV="production"
ENV PM2_PUBLIC_KEY mah2br7ohm7nevm
ENV PM2_SECRET_KEY t5o7avdd8s47435
EXPOSE 8000
RUN npm install pm2 -g

CMD ["pm2-runtime", "config/pm2.prod.yml"]
