package com.example.server.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DotEnvConfig {

    @PostConstruct
    public void loadEnvVars() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();
            
            // Set system properties from .env file
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
            
            System.out.println("✅ Environment variables loaded from .env file");
            System.out.println("📧 EMAIL_USERNAME: " + dotenv.get("EMAIL_USERNAME"));
            
        } catch (DotenvException e) {
            System.out.println("⚠️  Warning: Could not load .env file - " + e.getMessage());
            System.out.println("Using default values from application.properties");
        }
    }
}
