FROM node:22-alpine

WORKDIR /frontend

# COPY ./app/frontend /frontend # copy source code

COPY package.json .

RUN npm install

CMD ["npm","run","dev"]

# CMD ["tail","-f","/dev/null"]
