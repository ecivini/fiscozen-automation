FROM node 

# Get the latest version of Playwright
FROM mcr.microsoft.com/playwright:v1.34.0-jammy


# Create app directory
WORKDIR /usr/src/app

ARG PORT=3001

# Install app dependencies
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE ${PORT}
CMD [ "node", "dist/server.js" ]