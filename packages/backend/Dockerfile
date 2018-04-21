FROM node:slim

ADD ./build .

ENV NODE_ENV="development"
ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "main.js"]
