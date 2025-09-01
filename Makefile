
a: addresses
	# mkdir -p ~/goinfre/snapshots
	docker compose up -d
	# ./services/elasticsearch/elasticsearch-init.sh

# script for elasticsearch policies

b:
	docker compose build

d:
	docker compose down

e:
	docker exec -it app-backend sh

r:
	docker compose restart

addresses:
	@echo web-app: http://localhost:8080
	@echo prometheus: http://localhost:9090
	@echo grafana: http://localhost:3000
	@echo kibana: http://localhost:5601
