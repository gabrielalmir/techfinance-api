package repositories

import (
	"database/sql"
	"fmt"
	"techfinance/internal/models"
)

func GetCustomers(conn *sql.DB, name, group string, limit, offset int) ([]models.Customer, error) {
	query := fmt.Sprintf(
		"SELECT * FROM fatec_clientes WHERE razao_cliente LIKE '%%%s%%' AND descricao_grupo LIKE '%%%s%%' LIMIT %d OFFSET %d",
		name, group, limit, offset,
	)

	rows, err := conn.Query(query)

	if err != nil {
		return nil, err
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

	return customers, nil
}

func GetProducts(conn *sql.DB, description, group string, limit, offset int) ([]models.Product, error) {
	query := fmt.Sprintf(
		"SELECT * FROM fatec_produtos WHERE descricao_produto LIKE '%%%s%%' AND descricao_grupo LIKE '%%%s%%' LIMIT %d OFFSET %d",
		description, group, limit, offset,
	)

	rows, err := conn.Query(query)

	if err != nil {
		return nil, err
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

	return products, nil
}
