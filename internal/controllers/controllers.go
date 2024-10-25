package controllers

import (
	"fmt"
	"math"
	"techfinance/internal/config"
	"techfinance/internal/db"
	"techfinance/internal/repositories"

	"github.com/gofiber/fiber/v2"
)

func GetProducts(c *fiber.Ctx) error {
	description := c.Query("descricao")
	group := c.Query("grupo")

	limit := c.QueryInt("limite", 10)
	page := int(math.Max(float64(c.QueryInt("pagina", 1)-1), 0))
	offset := page * limit

	conn, err := db.GetDBConnection(config.ServerSettings.DB)

	if err != nil {
		return c.
			Status(500).
			JSON(fiber.Map{
				"message": "Erro ao conectar com o banco de dados",
				"error":   err.Error(),
			})
	}

	defer conn.Close()

	products, err := repositories.GetProducts(conn, description, group, limit, offset)

	if err != nil {
		fmt.Println(err)
		return c.
			Status(500).
			JSON(fiber.Map{
				"message": "Não foi possível buscar produtos",
				"error":   err.Error(),
			})
	}

	return c.JSON(products)
}

func GetCustomers(c *fiber.Ctx) error {
	name := c.Query("nome")
	group := c.Query("grupo")

	limit := c.QueryInt("limite", 10)
	page := int(math.Max(float64(c.QueryInt("pagina", 1)-1), 0))
	offset := page * limit

	conn, err := db.GetDBConnection(config.ServerSettings.DB)

	if err != nil {
		return c.
			Status(500).
			JSON(fiber.Map{
				"message": "Erro ao conectar com o banco de dados",
				"error":   err.Error(),
			})
	}

	defer conn.Close()

	customers, err := repositories.GetCustomers(conn, name, group, limit, offset)

	if err != nil {
		fmt.Println(err)
		return c.
			Status(500).
			JSON(fiber.Map{
				"message": "Não foi possível buscar clientes",
				"error":   err.Error(),
			})
	}

	return c.JSON(customers)
}
