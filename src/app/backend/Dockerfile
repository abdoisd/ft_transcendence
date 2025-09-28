FROM node:latest

WORKDIR /usr/src/app

COPY ./src .

RUN npm install

COPY ./config/backend-init.sh /

CMD [ "sh", "/backend-init.sh" ]
