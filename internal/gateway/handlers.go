package gateway

import (
	"net/http"
	"time"
	"trading_platform_go/internal/engine" // <-- 引用 engine 套件內已存在的 Order

	"github.com/gin-gonic/gin"
)

// HTTP 接收用的結構 (與前端對應)
type OrderRequest struct {
	UserID   int     `json:"user_id"`
	Symbol   string  `json:"symbol"`
	Price    float64 `json:"price"`
	Quantity float64 `json:"quantity"`
	Type     string  `json:"type"`
}

func OrderHandler(c *gin.Context) {
	var orderReq OrderRequest
	if err := c.ShouldBindJSON(&orderReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Python 風控引擎檢查
	riskOrder := RiskOrderRequest(orderReq)
	if err := validateOrderWithPython(riskOrder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 明確轉換成 engine.Order 結構（使用 engine 套件內的 Order）
	matchingOrder := engine.Order{
		UserID:    orderReq.UserID,
		Symbol:    orderReq.Symbol,
		Price:     orderReq.Price,
		Quantity:  orderReq.Quantity,
		Type:      engine.OrderType(orderReq.Type),
		Timestamp: time.Now(),
	}

	// 傳送至 Matching Engine
	response, err := SendOrderToEngine(matchingOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
