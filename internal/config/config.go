package config

import (
	"os"

	"github.com/joho/godotenv"
)

var ServerSettings *ServerConfig

func LoadEnvironmentConfiguration() {
	godotenv.Load()
	ServerSettings = newConfig()
}

type ServerConfig struct {
	Port          string
	Authorization string
	DB            *DatabaseConfig
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

func newConfig() *ServerConfig {
	port := os.Getenv("PORT")
	authorization := os.Getenv("AUTHORIZATION")

	config := &ServerConfig{
		Port:          port,
		Authorization: authorization,
		DB:            newDatabaseConfig(),
	}

	return config
}

func newDatabaseConfig() *DatabaseConfig {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")

	dbConfig := &DatabaseConfig{
		Host:     dbHost,
		Port:     dbPort,
		User:     dbUser,
		Password: dbPass,
		DBName:   dbName,
	}

	return dbConfig
}
