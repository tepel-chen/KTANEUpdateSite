FROM node:16.16.0

WORKDIR /usr/app
COPY ./lib ./lib
COPY ./pages ./pages
COPY ./public ./public
COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY ./*.config.js ./
RUN npm i
RUN npm run build

CMD [ "sh", "-c", "npm start"]