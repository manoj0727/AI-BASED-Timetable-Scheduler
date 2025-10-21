package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	// Application
	AppEnv  string
	AppPort string
	AppName string

	// JWT
	JWTSecret string

	// Database
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	DatabaseURL string

	// CORS
	CORSOrigins string

	// Optimization
	OptimizationTimeout   int
	OptimizationWorkers   int
	OptimizationAlgorithm string

	// Storage
	StoragePath   string
	StorageBucket string
	MaxFileSizeMB int

	// Email
	EmailProvider string
	EmailHost     string
	EmailPort     int
	EmailUsername string
	EmailPassword string
	EmailFrom     string

	// Logging
	LogLevel string

	// Rate Limiting
	RateLimitRequests int
	RateLimitDuration int
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	// Load .env file if exists (for local development)
	_ = godotenv.Load()

	cfg := &Config{
		// Application
		AppEnv:  getEnv("APP_ENV", "development"),
		AppPort: getEnv("APP_PORT", "8000"),
		AppName: getEnv("APP_NAME", "AI Timetable Scheduler"),

		// JWT
		JWTSecret: getEnv("JWT_SECRET", ""),

		// Database
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "postgres"),
		DBName:      getEnv("DB_NAME", "timetable_db"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),
		DatabaseURL: getEnv("DATABASE_URL", ""),

		// CORS
		CORSOrigins: getEnv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173"),

		// Optimization
		OptimizationTimeout:   getEnvAsInt("OPTIMIZATION_TIMEOUT", 300),
		OptimizationWorkers:   getEnvAsInt("OPTIMIZATION_WORKERS", 8),
		OptimizationAlgorithm: getEnv("OPTIMIZATION_ALGORITHM", "hybrid"),

		// Storage
		StoragePath:   getEnv("STORAGE_PATH", "./storage/uploads"),
		StorageBucket: getEnv("STORAGE_BUCKET", "timetable-files"),
		MaxFileSizeMB: getEnvAsInt("MAX_FILE_SIZE_MB", 10),

		// Email
		EmailProvider: getEnv("EMAIL_PROVIDER", "smtp"),
		EmailHost:     getEnv("EMAIL_HOST", "smtp.gmail.com"),
		EmailPort:     getEnvAsInt("EMAIL_PORT", 587),
		EmailUsername: getEnv("EMAIL_USERNAME", ""),
		EmailPassword: getEnv("EMAIL_PASSWORD", ""),
		EmailFrom:     getEnv("EMAIL_FROM", "noreply@timetable-scheduler.com"),

		// Logging
		LogLevel: getEnv("LOG_LEVEL", "info"),

		// Rate Limiting
		RateLimitRequests: getEnvAsInt("RATE_LIMIT_REQUESTS", 100),
		RateLimitDuration: getEnvAsInt("RATE_LIMIT_DURATION", 60),
	}

	// Build DATABASE_URL if not provided
	if cfg.DatabaseURL == "" {
		cfg.DatabaseURL = fmt.Sprintf(
			"postgresql://%s:%s@%s:%s/%s?sslmode=%s",
			cfg.DBUser,
			cfg.DBPassword,
			cfg.DBHost,
			cfg.DBPort,
			cfg.DBName,
			cfg.DBSSLMode,
		)
	}

	// Validate required fields
	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// Validate checks if all required configuration is present
func (c *Config) Validate() error {
	if c.JWTSecret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}

	if c.DatabaseURL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}

	return nil
}

// IsDevelopment returns true if running in development mode
func (c *Config) IsDevelopment() bool {
	return c.AppEnv == "development"
}

// IsProduction returns true if running in production mode
func (c *Config) IsProduction() bool {
	return c.AppEnv == "production"
}

// Helper functions

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}
