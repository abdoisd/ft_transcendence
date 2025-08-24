.
├── Makefile
├── Dockerfile // backend
└── app/
    ├── node_modules // node project
    ├── package.json // node file
    ├── package-lock.json // node file
    └── server.ts // my code

Then

.
├── Makefile
├── Dockerfile // backend
├── app/
│   ├── frontend/
│   │   ├── public/ static files
│   │   │   ├── index.html
│   │   │   ├── input.css
│   │   │   └── favicon.ico
│   │   └── frontend.ts // ts files
│   └── backend/
│       └── server.ts
└── package.json // config for node and npm for this project

to build and start backend `npm run build && npm start`
