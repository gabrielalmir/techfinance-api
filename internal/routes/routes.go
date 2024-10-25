package routes

import (
	"strings"
	"techfinance/internal/config"
	"techfinance/internal/controllers"

	"github.com/goccy/go-json"
	"github.com/gofiber/fiber/v2"
)

func InitializeRoutes() error {
	config.LoadEnvironmentConfiguration()
	router := fiber.New(fiber.Config{
		JSONEncoder: json.Marshal,
		JSONDecoder: json.Unmarshal,
	})

	router.Use(func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		token := strings.Split(auth, " ")
		if len(token) != 2 || token[0] != "Bearer" {
			return c.SendStatus(fiber.StatusUnauthorized)
		}
		return c.Next()
	})

	router.Get("/produtos", controllers.GetProducts)
	router.Get("/clientes", controllers.GetCustomers)

	return router.Listen(":" + config.ServerSettings.Port)
}
