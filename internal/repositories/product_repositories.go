package repositories

import (
	"database/sql"
	"techfinance/internal/models"
)

func GetProducts(conn *sql.DB, description, group string, limit, offset int) ([]models.Product, error) {
	query := `
        SELECT * FROM fatec_produtos
        WHERE LOWER(descricao_produto) LIKE LOWER($1) AND LOWER(descricao_grupo) LIKE LOWER($2)
        LIMIT $3 OFFSET $4
    `

	rows, err := conn.Query(query, "%"+description+"%", "%"+group+"%", limit, offset)

	if err != nil {
		return nil, err
	}

	var products []models.Product

	for rows.Next() {
		var product models.Product

		err = rows.Scan(&product.ID, &product.Description, &product.GroupID, &product.Group)

		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	return products, nil
}
