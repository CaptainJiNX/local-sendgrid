FROM node:8.7.0-alpine
EXPOSE 80
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY server.js ./

ENTRYPOINT [ "node", "." ]
