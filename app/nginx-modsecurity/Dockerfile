FROM debian:trixie-backports

RUN apt update && apt install nginx libnginx-mod-http-modsecurity \
    apt-utils autoconf automake build-essential git \
	libcurl4-openssl-dev libgeoip-dev liblmdb-dev \
	libtool libxml2-dev libyajl-dev pkgconf wget \
	zlib1g-dev modsecurity-crs -y

WORKDIR /etc/nginx

RUN git clone https://github.com/coreruleset/coreruleset.git && \
	mv coreruleset/crs-setup.conf.example coreruleset/crs-setup.conf

CMD ["nginx", "-g", "daemon off;"]
