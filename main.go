package main

import (
	"log"
	_ "techfinance/docs"
	"techfinance/internal/routes"
)

// @title TechFinance API
// @version 1.0
// @description TechFinance é uma solução mobile para para prover informações para apoio para tomada de decisões. Esta é uma API backend construída utilizando o framework **Fiber** (na linguagem Go).
// @termsOfService http://swagger.io/terms/
// @host https://techfinance.fly.dev
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	log.Fatalln(routes.InitializeRoutes())
}
