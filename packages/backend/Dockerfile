FROM node:slim

WORKDIR /
COPY dist .
COPY config config
ENV NODE_ENV="production"
ENV BACKEND_URL="http://time-eben-115349qwvbsc8.vnga76de7c.eu-west-1.elasticbeanstalk.com"
ENV FRONTEND_URL="http://d1crh3qg4ttypn.cloudfront.net/"
EXPOSE 80
RUN npm install pm2 -g

CMD ["pm2-runtime", "config/pm2.prod.yml"]
