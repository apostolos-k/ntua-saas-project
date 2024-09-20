# Use the official Python image from the Docker Hub
FROM python:3

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
# (Here we assume no external packages are needed; if you have dependencies, create and use a requirements.txt file)
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 9500

# The main script to run
CMD ["python", "api.py"]
