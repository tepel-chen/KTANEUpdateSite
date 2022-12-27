FROM node:16.16.0

WORKDIR /usr/app
COPY ./package*.json ./
RUN npm i
COPY ./tsconfig.json ./
COPY ./*.config.js ./
COPY ./public ./public
COPY ./lib ./lib
COPY ./pages ./pages
RUN npm run build

CMD [ "sh", "-c", "npm start"]