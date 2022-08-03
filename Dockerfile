FROM node:16.9.0-alpine
RUN apk add --no-cache bash
USER node
WORKDIR /usr/src/app