package main

import "trading_platform_go/internal/engine"

func main() {
	engine.StartWebSocketServer(":5002")
}
