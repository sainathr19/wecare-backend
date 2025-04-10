FROM node:18-alpine

WORKDIR /app

# Enable Corepack and set up Yarn
RUN corepack enable && corepack prepare yarn@4.5.1 --activate

COPY package*.json ./
COPY .yarn* ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source files
COPY . .

# Build the application
RUN yarn install && yarn build

EXPOSE 5000

CMD ["yarn", "start"]