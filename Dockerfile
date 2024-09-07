FROM node:18 AS node_base
WORKDIR /app

COPY package*.json ./
RUN npm instal
COPY . .

FROM mysql:8.0 AS mysql_base
ENV MYSQL_ROOT_PASSWORD=
ENV MYSQL_DATABASE=simple_task

COPY init.sql /docker-entrypoint-initdb.d/

FROM node:18

COPY --from=node_base /app /app
WORKDIR /app

COPY --from=mysql_base /docker-entrypoint-initdb.d /docker-entrypoint-initdb.d

EXPOSE 3000 3306

CMD ["bash", "-c", "service mysql start && node index.js"]