FROM node:slim
WORKDIR /build
ADD . .
RUN yarn
RUN yarn build

WORKDIR /
RUN cp -r ./build/dist ./
RUN cp -r ./build/node_modules ./dist/
ENV NODE_ENV="production"
ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "dist/main.js"]
