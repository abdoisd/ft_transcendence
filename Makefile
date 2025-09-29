all:
	docker compose up 

fclean:
	docker compose down --volumes --rmi all

build:
	docker compose build

down:
	docker compose down
