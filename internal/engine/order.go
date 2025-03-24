package engine

import "time"

type OrderType string

const (
	BUY  OrderType = "BUY"
	SELL OrderType = "SELL"
)

type Order struct {
	ID        int64     `json:"id"`
	Type      OrderType `json:"type"`
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price"`
	Quantity  float64   `json:"quantity"`
	Timestamp time.Time `json:"timestamp"`
}
