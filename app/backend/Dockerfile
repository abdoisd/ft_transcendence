FROM node:22-alpine

WORKDIR /backend

# COPY . . # copy source code

COPY package.json .

RUN npm install \
	&& apk add sqlite
	# tmp

# CMD ["npm","run","dev"]

CMD ["tail","-f","/dev/null"]
