# Use Node.js 22 on Alpine Linux
FROM node:22-alpine

# RUN npm install -g typescript

# Set working directory inside the container
WORKDIR /app

# # Copy everything from local app/ into container /app
# COPY app/ .

# Command to run the app
CMD ["tail","-f","/dev/null"]
