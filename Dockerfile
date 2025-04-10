FROM node:18-alpine

WORKDIR /app

# Enable Corepack and set up Yarn
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

# Copy package files
COPY package.json ./
COPY .yarnrc.yml ./
COPY .yarn ./.yarn

# Initialize yarn and install dependencies
RUN yarn set version 4.5.1
RUN yarn install

# Copy source files
COPY . .

# Build the application
RUN yarn build

EXPOSE 5000

CMD ["yarn", "start"]