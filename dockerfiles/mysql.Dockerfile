FROM mysql:8.0.30

WORKDIR /usr/app
COPY ./database /docker-entrypoint-initdb.d/

