package engine_test

import (
	"testing"
	"time"
	"trading_platform_go/internal/engine"
)

func TestAddOrder(t *testing.T) {
	order := &engine.Order{
		ID:        1,
		UserID:    123,
		Type:      engine.BUY,
		Symbol:    "BTCUSD",
		Price:     42000,
		Quantity:  1,
		Timestamp: time.Now(),
	}

	engine.AddOrder(order, "client1")

	orderBook := engine.GetOrderBook()
	if len(orderBook.BuyOrders) != 1 {
		t.Errorf("expected 1 buy order, got %d", len(orderBook.BuyOrders))
	}
}
