######### BUILD #########
FROM node:lts AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

######### RUN #########
FROM node:lts-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./

RUN npm ci --only=production

COPY --from=build /usr/src/app/dist ./

EXPOSE 1883

CMD [ "node", "index.js" ]
