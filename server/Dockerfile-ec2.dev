FROM node:14.18-alpine
WORKDIR /app
COPY ./package.json ./package.json
RUN npm install
COPY . .
CMD ["npm", "start"]