# Backend Dockerfile

# Use the official Node.js image as the base image
FROM node:20

# Create and set the working directory
WORKDIR /app

COPY . .

# Install dependencies
RUN npm install


# Expose the port that the app runs on
EXPOSE 6500

# Command to run the app
CMD ["npm", "start"]
