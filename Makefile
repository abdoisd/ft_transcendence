all:
	docker compose -f src/docker-compose.yml up


fclean:
	docker compose -f src/docker-compose.yml down --volumes --rmi all


build:
	docker compose -f src/docker-compose.yml build


down:
	docker compose -f src/docker-compose.yml down