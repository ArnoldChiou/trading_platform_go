package gateway

import "github.com/gin-gonic/gin"

func OrderHandler(c *gin.Context) {
	// 此處暫時簡單回傳
	c.JSON(200, gin.H{"message": "Order endpoint reached"})
}

func MarketHandler(c *gin.Context) {
	// 暫時簡單回傳
	c.JSON(200, gin.H{"message": "Market endpoint reached"})
}
