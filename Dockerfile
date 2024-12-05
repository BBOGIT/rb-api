FROM node:14-alpine as build
ARG GITHUB_TOKEN
WORKDIR /application
COPY . .
COPY example.npmrc .npmrc
RUN set -ex \
    && npm install --unsafe-perm \
    && rm -rf .npmrc \
    && npm run build \
    && rm -rf node_modules src
    
FROM node:14-alpine
ARG GITHUB_TOKEN
WORKDIR /application
RUN chown node:node /application
USER node
ENV NODE_ENV=production \
    APPLICATION_NAME=default-nestjs-app
COPY --from=build --chown=node:node /application /application
COPY example.npmrc .npmrc
RUN npm install --unsafe-perm && rm -rf .npmrc
ARG PORT=3030
ENV PORT=${PORT}
EXPOSE ${PORT}/tcp
CMD [ "node", "./dist/main.js" ]  