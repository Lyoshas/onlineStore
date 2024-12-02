FROM node:20.17-alpine
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]