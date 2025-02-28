# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose a port (optional, for monitoring if needed)
EXPOSE 3000

# Start the bot
CMD ["node", "bot.js"]
