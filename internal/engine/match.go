package engine

import (
	"log"
	"sync"
)

// OrderBook 存放等待成交的訂單
type OrderBook struct {
	BuyOrders  []*Order
	SellOrders []*Order
	mu         sync.Mutex
}

var book = OrderBook{
	BuyOrders:  []*Order{},
	SellOrders: []*Order{},
}

// 新增訂單並嘗試撮合
func AddOrder(order *Order) {
	book.mu.Lock()
	defer book.mu.Unlock()

	log.Printf("新訂單進入：%+v", order)

	if order.Type == BUY {
		book.BuyOrders = append(book.BuyOrders, order)
	} else if order.Type == SELL {
		book.SellOrders = append(book.SellOrders, order)
	}

	matchOrders(order.Symbol)
}

// 撮合邏輯
func matchOrders(symbol string) {
	var matched []*Order

	// 持續撮合直到無法成交
	for {
		buyOrder, sellOrder := bestBid(), bestAsk()
		if buyOrder == nil || sellOrder == nil {
			break
		}

		// 買價需高於或等於賣價才能成交
		if buyOrder.Price >= sellOrder.Price {
			execQty := min(buyOrder.Quantity, sellOrder.Quantity)
			log.Printf("成交: BUY[%d] & SELL[%d] @ %.2f (%f units)", buyOrder.ID, sellOrder.ID, sellOrder.Price, execQty)

			buyOrder.Quantity -= execQty
			sellOrder.Quantity -= execQty

			if buyOrder.Quantity == 0 {
				matched = append(matched, buyOrder)
				removeOrder(&book.BuyOrders, buyOrder.ID)
			}

			if sellOrder.Quantity == 0 {
				matched = append(matched, sellOrder)
				removeOrder(&book.SellOrders, sellOrder.ID)
			}
		} else {
			break
		}
	}

	if len(matched) == 0 {
		log.Println("沒有撮合成功的訂單")
	}
}

func bestBid() *Order {
	if len(book.BuyOrders) == 0 {
		return nil
	}
	best := book.BuyOrders[0]
	for _, order := range book.BuyOrders {
		if order.Price > best.Price || (order.Price == best.Price && order.Timestamp.Before(best.Timestamp)) {
			best = order
		}
	}
	return best
}

func bestAsk() *Order {
	if len(book.SellOrders) == 0 {
		return nil
	}
	best := book.SellOrders[0]
	for _, order := range book.SellOrders {
		if order.Price < best.Price || (order.Price == best.Price && order.Timestamp.Before(best.Timestamp)) {
			best = order
		}
	}
	return best
}

func removeOrder(orders *[]*Order, id int64) {
	for i, order := range *orders {
		if order.ID == id {
			*orders = append((*orders)[:i], (*orders)[i+1:]...)
			return
		}
	}
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
