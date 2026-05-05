#!/usr/bin/env bash
# Render build script for Spring Boot

set -e

echo "Installing Java 21..."
# Install Java using SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install java 21.0.1-tem || true
sdk use java 21.0.1-tem

echo "Java version:"
java -version

echo "Building application..."
cd backend
chmod +x mvnw
./mvnw clean package -DskipTests

echo "Build completed successfully!"
