FROM node:22-alpine

WORKDIR /backend

# COPY . . # copy source code

COPY package.json .

# tmp
RUN npm install \
	&& apk add sqlite tini bash
# tmp
RUN npm install -g nodemon wscat

# ENTRYPOINT ["tini", "--"]
# CMD ["npm","run","dev"]
CMD ["tini","--","tail","-f","/dev/null"]

# tini runs as PID 1 and forwards signals to other processes
