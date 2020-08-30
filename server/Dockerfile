FROM node:14

# app directory
WORKDIR /usr/src/app

# copy dependency definitions
COPY package*.json ./

# install dependencies
RUN npm install

# bundle app source
COPY . .

# copy environment variables
COPY .env.production .env

# compile typescript code
RUN npm run build

ENV NODE_ENV production

EXPOSE 8080
CMD ["node", "dist/index.js"]

USER node