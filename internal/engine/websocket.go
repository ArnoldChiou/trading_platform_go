package engine

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func StartWebSocketServer(addr string) {
	http.HandleFunc("/ws", wsHandler)
	log.Printf("Matching Engine started at %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer ws.Close()

	for {
		var order Order
		if err := ws.ReadJSON(&order); err != nil {
			log.Println("讀取訊息錯誤:", err)
			break
		}

		// 為訂單加入ID與Timestamp
		order.ID = time.Now().UnixNano()
		order.Timestamp = time.Now()

		AddOrder(&order)

		ws.WriteJSON(map[string]interface{}{
			"status": "received",
			"order":  order,
		})
	}
}
