
a: addresses
	mkdir -p ~/goinfre/prometheus
	docker compose up -d
	# ./services/elasticsearch/elasticsearch-init.sh

b:
	docker compose build

d:
	docker compose down

e:
	docker exec -it app-backend sh
n:
	docker exec -it nginx-modsecurity sh

r:
	docker compose restart

addresses:
	@echo web-app: http://localhost:3000
	@echo prometheus: http://localhost:9090
	@echo grafana: http://localhost:3000
