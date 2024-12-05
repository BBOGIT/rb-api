FROM node:20-alpine as build
ARG GITHUB_TOKEN
WORKDIR /application
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
ARG GITHUB_TOKEN
WORKDIR /application
RUN chown node:node /application
USER node
ENV NODE_ENV=production \
    APPLICATION_NAME=default-nestjs-app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build --chown=node:node /application/dist ./dist
ARG PORT=3030
ENV PORT=${PORT}
EXPOSE ${PORT}/tcp
CMD [ "node", "./dist/main.js" ]