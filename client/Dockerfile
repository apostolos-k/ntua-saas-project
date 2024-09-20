# Use the official Node.js image as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Install the dependencies
RUN npm install

EXPOSE 3000
# Build the React application
CMD ["npm", "start"]

# # Use a lightweight web server to serve the static files
# FROM nginx:alpine
# COPY --from=0 /app/build /usr/share/nginx/html

# # Expose port 80 to the outside world
# EXPOSE 80

# # Start the Nginx server
# CMD ["nginx", "-g", "daemon off;"]
