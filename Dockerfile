FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV MODEL_URL=https://storage.googleapis.com/c241pr574model/model.json


CMD ["npm", "run", "start"]
