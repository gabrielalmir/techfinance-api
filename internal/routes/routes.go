package routes

import (
	"techfinance/internal/controllers"

	"github.com/gofiber/fiber/v2"
)

func InitializeRoutes() error {
	router := fiber.New()

	router.Get("/produtos", controllers.GetProducts)
	router.Get("/clientes", controllers.GetCustomers)

	return router.Listen(":3000")
}
