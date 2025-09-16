FROM node:22-alpine

WORKDIR /backend

# COPY . . # copy source code

COPY package.json .

RUN npm install \
	&& apk add sqlite tini bash && npm install -g nodemon

# ENTRYPOINT ["tini", "--"]
CMD ["npm","run","dev"]
# CMD ["tini","--","tail","-f","/dev/null"]

# tini runs as PID 1 and forwards signals to other processes
