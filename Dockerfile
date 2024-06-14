FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .env
ENV PORT=8080
ENV MODEL_URL=https://storage.googleapis.com/c241pr574model/model.json


COPY . .

CMD [ "npm", "run", "start"]