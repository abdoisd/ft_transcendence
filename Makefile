b:
	docker build -t project-i .

r:
	docker run -d --name project-c -p 8080:8080 -v /mnt/homes/aisdaoun/Desktop/learning\ 2/Project/app:/app --network backend-network project-i

e:
	docker exec -it project-c sh

c:
	docker rm -f project-c

s:
	npm run build && npm start
