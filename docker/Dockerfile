######### BUILD #########
FROM node:lts AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

######### RUN #########
FROM node:lts-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./

RUN npm ci --only=production

COPY --from=build /app/dist ./

EXPOSE 1883

CMD [ "node", "index.js" ]
