package main

import (
	"log"
	"techfinance/internal/routes"
)

func main() {
	log.Fatalln(routes.InitializeRoutes())
}
