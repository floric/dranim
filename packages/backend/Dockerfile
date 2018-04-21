FROM node:slim

ADD ./dist .

ENV NODE_ENV="production"
ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "main.js"]
