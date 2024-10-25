package controllers

import (
	"fmt"
	"techfinance/internal/config"
	"techfinance/internal/db"
	"techfinance/internal/repositories"
	"techfinance/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// GetProducts godoc
// @Summary Retorna uma lista de produtos
// @Description Retorna uma lista de produtos
// @Tags produtos
// @Accept json
// @Produce json
// @Param descricao query string false "Descrição do produto"
// @Param grupo query string false "Grupo do produto"
// @Param limite query int false "Limite de registros por página"
// @Param pagina query int false "Número da página"
// @Success 200 {array} models.Product
// @Router /produtos [get]
// @Security BearerAuth
func GetProducts(c *fiber.Ctx) error {
	description := c.Query("descricao")
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
