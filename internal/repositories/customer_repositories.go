package repositories

import (
	"database/sql"
	"techfinance/internal/models"
)

func GetCustomers(conn *sql.DB, name, group string, limit, offset int) ([]models.Customer, error) {
	query := `
		SELECT *
		FROM fatec_clientes
		WHERE LOWER(razao_cliente) LIKE LOWER($1) AND LOWER(descricao_grupo) LIKE LOWER($2)
		LIMIT $3 OFFSET $4
	`

	rows, err := conn.Query(query, "%"+name+"%", "%"+group+"%", limit, offset)

	if err != nil {
		return nil, err
	}

	var customers []models.Customer

	for rows.Next() {
		var customer models.Customer

		err = rows.Scan(&customer.ID, &customer.Name, &customer.FantasyName, &customer.City, &customer.State, &customer.GroupID, &customer.Group)
		if err != nil {
			return nil, err
		}

		customers = append(customers, customer)
	}

	return customers, nil
}
