FROM node 

# Get the latest version of Playwright
FROM mcr.microsoft.com/playwright:v1.40.1-jammy


# Create app directory
WORKDIR /usr/src/app

ARG PORT=3001

# Install app dependencies
COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

EXPOSE ${PORT}
CMD [ "npm", "start" ]