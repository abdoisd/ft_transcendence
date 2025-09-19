FROM debian:trixie-backports

RUN apt update && apt install nginx libnginx-mod-http-modsecurity \
    apt-utils autoconf automake build-essential git \
	libcurl4-openssl-dev libgeoip-dev liblmdb-dev \
	libtool libxml2-dev libyajl-dev pkgconf wget \
	zlib1g-dev modsecurity-crs -y

WORKDIR /etc/nginx

RUN git clone https://github.com/coreruleset/coreruleset.git && \
	mv coreruleset/crs-setup.conf.example coreruleset/crs-setup.conf && \
	sed -i "s/setvar:'tx.allowed_methods=GET HEAD POST OPTIONS'/setvar:'tx.allowed_methods=GET HEAD POST OPTIONS PUT'/g" coreruleset/rules/REQUEST-901-INITIALIZATION.conf

RUN mkdir -p /etc/nginx/ssl && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt \
	-subj "/C=US/ST=State/L=City/O=Organization/OU=Unit/CN=localhost"

CMD ["nginx", "-g", "daemon off;"]
