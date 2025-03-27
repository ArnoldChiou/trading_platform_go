package gateway

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var (
	wsConn *websocket.Conn
	wsOnce sync.Once
	wsMux  sync.Mutex
	wsURL  = "ws://localhost:5002/ws" // 撮合引擎位置
)

// 建立單一 WebSocket 連線（Singleton）
func getWSConn() (*websocket.Conn, error) {
	var err error

	wsOnce.Do(func() {
		wsConn, _, err = websocket.DefaultDialer.Dial(wsURL, nil)
		if err != nil {
			log.Println("WebSocket 連線失敗:", err)
			return
		}
		log.Println("成功連線到 Matching Engine:", wsURL)
	})

	return wsConn, err
}

type Order struct {
	Type     string  `json:"type"`
	Symbol   string  `json:"symbol"`
	Price    float64 `json:"price"`
	Quantity float64 `json:"quantity"`
}

// 發送訂單給 Matching Engine
func SendOrderToEngine(order Order) (map[string]interface{}, error) {
	wsMux.Lock()
	defer wsMux.Unlock()

	ws, err := getWSConn()
	if err != nil {
		log.Println("WebSocket 未連線:", err)
		return nil, err
	}

	ws.SetWriteDeadline(time.Now().Add(5 * time.Second))
	if err := ws.WriteJSON(order); err != nil {
		log.Println("WebSocket 發送錯誤:", err)
		return nil, err
	}

	var response map[string]interface{}
	ws.SetReadDeadline(time.Now().Add(5 * time.Second))
	if err := ws.ReadJSON(&response); err != nil {
		log.Println("WebSocket 接收錯誤:", err)
		return nil, err
	}

	return response, nil
}
