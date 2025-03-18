package engine

import (
	"log"
	"net/http"

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
		var msg map[string]interface{}
		if err := ws.ReadJSON(&msg); err != nil {
			log.Println("Error:", err)
			break
		}
		log.Printf("Received: %v", msg)

		// TODO: 撮合交易邏輯
		ws.WriteJSON(map[string]string{"status": "matched"})
	}
}
