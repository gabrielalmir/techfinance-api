package db

import (
	"database/sql"
	"fmt"
	"techfinance/internal/config"

	_ "github.com/lib/pq"
)

func GetDBConnection(c *config.DatabaseConfig) (*sql.DB, error) {
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", c.Host, c.Port, c.User, c.Password, c.DBName)
	conn, err := sql.Open("postgres", connStr)

	if err != nil {
		return nil, err
	}

	return conn, nil
}
