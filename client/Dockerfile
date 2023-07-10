FROM node:18.16.0-alpine

WORKDIR /client
ENV PATH = "./node_modules/.bin:$PATH"

copy . .

RUN npm install
COPY . ./
RUN npm run build
CMD ["npm", "start"]