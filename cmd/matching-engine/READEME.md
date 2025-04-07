# Matching Engine Service

此目錄包含 `trading_platform_go` 專案的 Matching Engine 服務的進入點。

## 功能

* **啟動 WebSocket 伺服器:** 呼叫 `internal/engine` 套件中的 `StartWebSocketServer` 函數，在 `:5002` 埠口上啟動一個 WebSocket 伺服器。這個伺服器很可能用於處理實時的訂單撮合相關通訊。

## 如何運行

在 `cmd/matching-engine` 目錄下執行以下命令來編譯和運行此服務：

```bash
go run main.go
服務啟動後將開始監聽 :5002 埠口的 WebSocket 連接。

依賴套件
trading_platform_go/internal/engine: 包含 Matching Engine 的核心邏輯以及 WebSocket 伺服器的實現。