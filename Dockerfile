FROM node:14.15.0-alpine
RUN apk add --no-cache bash
USER node
WORKDIR /usr/src/app