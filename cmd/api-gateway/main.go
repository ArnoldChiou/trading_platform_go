package main

import (
	"trading_platform_go/internal/gateway"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	gateway.SetupRoutes(r)
	r.Run(":8080")
}
