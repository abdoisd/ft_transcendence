FROM node:latest

WORKDIR /usr/src/app

COPY ./src/package.json /

RUN npm install && npm install -g nodemon

COPY ./backend-init.sh /usr/local/bin/backend-init.sh
RUN chmod +x /usr/local/bin/backend-init.sh && apt update && apt install -y tini
CMD ["tini", "--", "/bin/bash", "/usr/local/bin/backend-init.sh"]
