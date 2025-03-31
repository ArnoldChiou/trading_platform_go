package engine

import (
	"log"
	"sync"
	"time"
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
func AddOrder(order *Order, clientID string) {
	book.mu.Lock()
	defer book.mu.Unlock()

	log.Printf("新訂單進入：%+v", order)

	if order.Side == "BUY" {
		book.BuyOrders = append(book.BuyOrders, order)
	} else {
		book.SellOrders = append(book.SellOrders, order)
	}

	matchOrders(order.Symbol, clientID)

}

// 撮合邏輯
func matchOrders(symbol, clientID string) {
	for {
		buyOrder, sellOrder := bestBid(), bestAsk()
		if buyOrder == nil || sellOrder == nil {
			break
		}

		if buyOrder.Price >= sellOrder.Price {
			execQty := min(buyOrder.Quantity, sellOrder.Quantity)
			price := sellOrder.Price

			buyOrder.Quantity -= execQty
			sellOrder.Quantity -= execQty

			trade := map[string]interface{}{
				"status":   "matched",
				"symbol":   symbol,
				"price":    price,
				"quantity": execQty,
				"buy_id":   buyOrder.ID,
				"sell_id":  sellOrder.ID,
				"time":     time.Now(),
			}

			log.Printf("成交通知: %+v", trade)
			log.Printf("撮合結果：買單[%v], 賣單[%v]", buyOrder, sellOrder)

			// 【重點】推送給所有已連線的客戶端
			clientsMu.Lock()
			for _, client := range clients {
				err := client.Conn.WriteJSON(trade)
				if err != nil {
					log.Printf("推送撮合訊息失敗給客戶端 [%s]: %v", client.ID, err)
				}
			}
			clientsMu.Unlock()

			if buyOrder.Quantity == 0 {
				removeOrder(&book.BuyOrders, buyOrder.ID)
			}

			if sellOrder.Quantity == 0 {
				removeOrder(&book.SellOrders, sellOrder.ID)
			}
		} else {
			break
		}
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
