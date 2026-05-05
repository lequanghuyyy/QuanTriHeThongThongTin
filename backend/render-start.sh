#!/usr/bin/env bash
# Render start script for Spring Boot

set -e

# Set Java path
export JAVA_HOME="/opt/render/project/.jdk"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Starting application with Java:"
java -version

# Start the application
cd backend
java -jar target/*.jar
