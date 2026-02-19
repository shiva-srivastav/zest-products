#!/bin/bash
# Usage: ./push-to-dockerhub.sh YOUR_DOCKERHUB_USERNAME

set -e

USERNAME=${1:?"Usage: $0 <dockerhub-username>"}
IMAGE_NAME="zest-products-backend"
TAG="latest"

echo "Building Spring Boot backend Docker image..."
cd backend
docker build -t "$USERNAME/$IMAGE_NAME:$TAG" .

echo "Logging in to Docker Hub..."
docker login

echo "Pushing $USERNAME/$IMAGE_NAME:$TAG ..."
docker push "$USERNAME/$IMAGE_NAME:$TAG"

echo "Done! Image available at: https://hub.docker.com/r/$USERNAME/$IMAGE_NAME"

cd ..

echo ""
echo "To use this image, update docker-compose.yml:"
echo "  backend:"
echo "    image: $USERNAME/$IMAGE_NAME:$TAG"
echo "  (remove the build: section)"
