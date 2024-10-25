package main

import (
	"log"
	"techfinance/internal/config"
	"techfinance/internal/routes"
)

func main() {
	config.ConfigureEnvironment()
	log.Fatalln(routes.InitializeRoutes())
}
