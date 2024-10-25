package controllers

import (
	"fmt"
	"techfinance/internal/config"
	"techfinance/internal/db"
	"techfinance/internal/repositories"
	"techfinance/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// GetCustomers
// @Summary Retorna uma lista de clientes
// @Description Retorna uma lista de clientes
// @Tags clientes
// @Accept json
// @Produce json
// @Param nome query string false "Nome do cliente"
// @Param grupo query string false "Grupo do cliente"
// @Param limite query int false "Limite de registros por página"
// @Param pagina query int false "Número da página"
// @Success 200 {array} models.Customer
// @Router /clientes [get]
// @Security BearerAuth
func GetCustomers(c *fiber.Ctx) error {
	name := c.Query("nome")
	group := c.Query("grupo")

	limit := c.QueryInt("limite", 10)
	page := utils.MaxInt(c.QueryInt("pagina", 1)-1, 0)
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
