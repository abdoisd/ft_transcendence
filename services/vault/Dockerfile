FROM debian:trixie-backports

RUN apt update && apt install -y \
    curl \
    wget \
    vim \
    git \
	unzip netcat-traditional gpg tini

RUN wget -O - https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg \
	&& echo "deb [arch=amd64 signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com trixie main" > /etc/apt/sources.list.d/hashicorp.list \
	&& apt update \
	&& apt install vault jq -y \
	&& vault -v

RUN openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \
	-nodes -keyout /tmp/vault-key.pem -out /tmp/vault-cert.pem \
	-subj "/CN=localhost" \
	-addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

WORKDIR /root

COPY vault-init.sh /usr/local/bin/vault-init.sh
COPY vault-init2.sh /usr/local/bin/vault-init2.sh
RUN chmod +x /usr/local/bin/vault-init.sh && chmod +x /usr/local/bin/vault-init2.sh

CMD ["tini", "--", "/bin/bash", "vault-init.sh"]
# ENTRYPOINT ["tini", "--"]
# CMD ["tail", "-f", "/dev/null"]
