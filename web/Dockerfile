FROM node:22-alpine

WORKDIR /opt/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . /opt/app

ENV NODE_ENV production

RUN yarn build

CMD [ "yarn", "start" ]
