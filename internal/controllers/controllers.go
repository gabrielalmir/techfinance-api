package controllers

import (
	"fmt"
	"math"
	"techfinance/internal/config"
	"techfinance/internal/db"
	"techfinance/internal/models"

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

	query := fmt.Sprintf(
		"SELECT * FROM fatec_produtos WHERE descricao_produto LIKE '%%%s%%' AND descricao_grupo LIKE '%%%s%%' LIMIT %d OFFSET %d",
		description, group, limit, offset,
	)

	rows, err := conn.Query(query)

	if err != nil {
		fmt.Println(err)
		return c.
			Status(500).
			JSON(fiber.Map{
				"message": "Não foi possível buscar produtos",
				"error":   err.Error(),
			})
	}

	var products []models.Product = []models.Product{}

	for rows.Next() {
		var product models.Product

		err = rows.Scan(&product.ID, &product.Description, &product.GroupID, &product.Group)

		if err != nil {
			panic(err)
		}

		products = append(products, product)
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

	query := fmt.Sprintf(
		"SELECT * FROM fatec_clientes WHERE razao_cliente LIKE '%%%s%%' AND descricao_grupo LIKE '%%%s%%' LIMIT %d OFFSET %d",
		name, group, limit, offset,
	)

	rows, err := conn.Query(query)

	if err != nil {
		fmt.Println(err)
		return c.
			Status(500).
			JSON(fiber.Map{
				"message": "Não foi possível buscar clientes",
				"error":   err.Error(),
			})
	}

	var customers []models.Customer = []models.Customer{}

	for rows.Next() {
		var customer models.Customer

		err = rows.Scan(&customer.ID, &customer.Name, &customer.FantasyName, &customer.City, &customer.State, &customer.GroupID, &customer.Group)

		if err != nil {
			panic(err)
		}

		customers = append(customers, customer)
	}

	return c.JSON(customers)
}
