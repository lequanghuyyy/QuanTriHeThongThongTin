#!/usr/bin/env bash
# Render build script for Spring Boot

set -e

echo "Installing Java 21..."
# Download and install Java to a persistent location
JAVA_HOME="/opt/render/project/.jdk"
mkdir -p $JAVA_HOME

if [ ! -d "$JAVA_HOME/bin" ]; then
  echo "Downloading Java 21..."
  curl -L "https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz" -o /tmp/jdk.tar.gz
  tar -xzf /tmp/jdk.tar.gz -C $JAVA_HOME --strip-components=1
  rm /tmp/jdk.tar.gz
fi

export PATH="$JAVA_HOME/bin:$PATH"

echo "Java version:"
java -version

echo "Building application..."
cd backend
chmod +x mvnw
./mvnw clean package -DskipTests

echo "Build completed successfully!"
