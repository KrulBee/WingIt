# Backend Dockerfile for Render deployment
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make mvnw executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application with memory optimization for Render free tier
CMD ["java", "-Xmx400m", "-Xms200m", "-XX:+UseG1GC", "-XX:MaxGCPauseMillis=200", "-jar", "target/server-0.0.1-SNAPSHOT.jar"]
