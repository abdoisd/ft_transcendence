FROM node:latest

WORKDIR /usr/src/app

COPY ./src/package.json /

RUN npm install && npm install -g nodemon

CMD [ "npm", "run", "dev" ]
