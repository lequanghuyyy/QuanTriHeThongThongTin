#!/usr/bin/env bash
# Render start script for Spring Boot

set -e

# Load SDKMAN
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk use java 21.0.1-tem

echo "Starting application with Java:"
java -version

# Start the application
java -jar target/*.jar
