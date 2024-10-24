package models

type Product struct {
	ID          string `json:"id" db:"codigo"`
	Description string `json:"descricao" db:"descricao_produto"`
	GroupID     string `json:"id_grupo" db:"id_grupo"`
	Group       string `json:"grupo" db:"descricao_grupo"`
}

type Customer struct {
	ID          string `json:"id" db:"id_cliente"`
	Name        string `json:"nome" db:"razao_cliente"`
	FantasyName string `json:"nome_fantasia" db:"nome_fantasia"`
	City        string `json:"cidade" db:"cidade"`
	State       string `json:"estado" db:"uf"`
	GroupID     int    `json:"id_grupo" db:"id_grupo"`
	Group       string `json:"grupo" db:"descricao_grupo"`
}
