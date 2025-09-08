
a: addresses
	mkdir -p ~/goinfre/prometheus
	mkdir -p ~/goinfre/snapshots
	mkdir -p ~/goinfre/vault
	docker compose up -d
	# ./services/elasticsearch/elasticsearch-init.sh
b:
	docker compose build
d:
	docker compose down
e:
	docker exec -it app-backend sh
v:
	docker exec -it vault-server bash
n:
	docker exec -it nginx-modsecurity sh
r:
	docker compose restart

addresses:
	@echo web-app: https://localhost
