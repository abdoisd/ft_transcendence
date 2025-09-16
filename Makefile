all:
	mkdir -p ~/data/elasticsearch
	docker compose -f srcs/docker-compose.yml up

fclean:
	docker compose -f srcs/docker-compose.yml down --volumes --rmi all



build:
	docker compose -f srcs/docker-compose.yml build



down:
	docker compose -f srcs/docker-compose.yml down