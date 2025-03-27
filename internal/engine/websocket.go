package engine

import (
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
}

var (
	clients   = make(map[string]*Client)
	clientsMu sync.Mutex
	upgrader  = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}
)

func StartWebSocketServer(addr string) {
	http.HandleFunc("/ws", wsHandler)
	log.Printf("Matching Engine started at %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("連接錯誤:", err)
		return
	}
	defer conn.Close()

	clientID := time.Now().Format("20060102150405.000000")
	client := &Client{ID: clientID, Conn: conn}

	registerClient(client)
	defer unregisterClient(clientID)

	for {
		var order Order
		if err := conn.ReadJSON(&order); err != nil {
			log.Println("讀取訊息錯誤 (正常斷線或異常斷線):", err)
			break
		}
		order.ID = time.Now().UnixNano()
		order.Timestamp = time.Now()

		log.Printf("收到訂單來自 [%s]: %+v", clientID, order)

		AddOrder(&order, clientID)

		// 這裡主動回應給 API Gateway
		ack := map[string]interface{}{
			"status": "received",
			"order":  order,
		}
		if err := conn.WriteJSON(ack); err != nil {
			log.Println("回應 WebSocket 訊息錯誤:", err)
			break
		}
	}
}

func registerClient(client *Client) {
	clientsMu.Lock()
	defer clientsMu.Unlock()
	clients[client.ID] = client
	log.Printf("Client [%s] 已連線", client.ID)
}

func unregisterClient(clientID string) {
	clientsMu.Lock()
	defer clientsMu.Unlock()
	delete(clients, clientID)
	log.Printf("Client [%s] 已斷開", clientID)
}

func notifyClient(clientID string, message interface{}) {
	clientsMu.Lock()
	client, exists := clients[clientID]
	clientsMu.Unlock()

	if exists {
		client.Conn.WriteJSON(message)
	}
}
