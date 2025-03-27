package gateway

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func OrderHandler(c *gin.Context) {
	var order Order
	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := SendOrderToEngine(order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

func MarketHandler(c *gin.Context) {
	// 暫時簡單回傳
	c.JSON(200, gin.H{"message": "Market endpoint reached"})
}
