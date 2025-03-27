package main

import (
	"log"
	"trading_platform_go/internal/gateway"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	// 加入這裡設定允許跨域請求 (CORS)
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: true,
	}))

	gateway.SetupRoutes(router)

	log.Println("API Gateway running at :8080")
	router.Run(":8080")
}
