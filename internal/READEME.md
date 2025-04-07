## 主要工作流程 (以一筆訂單為例)

1.  **外部請求:** 一個包含訂單資訊的 HTTP `POST` 請求發送到 `gateway` 的 `/api/order` 端點。
2.  **Gateway 處理:** `handlers.go` 解析請求。
3.  **風險檢查:** `risk_client.go` 將訂單發送給 Python 風控服務進行驗證。
4.  **訂單轉發:** 若風控通過，`gateway` 的 `ws_client.go` 透過 WebSocket 將訂單發送給 `engine`。
5.  **Engine 接收:** `engine` 的 `websocket.go` 接收到訂單，分配 ID 和時間戳，並回傳 "received" 確認給 `gateway`。
6.  **加入撮合:** `engine` 的 `websocket.go` 呼叫 `match.go` 的 `AddOrder`，將訂單加入 `OrderBook`。
7.  **執行撮合:** `match.go` 的 `matchOrders` 檢查是否有可匹配的對手單。
8.  **結果處理:**
    * **若成交:**
        * `match.go` 將成交記錄 (`trade`) 發送至 Kafka。
        * `match.go` 透過 `websocket.go` 將成交記錄 (`trade`) 推送給所有連線的客戶端 (包括 `gateway`)。
    * **若未成交或部分成交:** 訂單 (或剩餘部分) 留在 `OrderBook` 中等待後續撮合。
9.  **Gateway 回應:** `gateway` 在步驟 5 收到 "received" 確認後 (或在步驟 8 收到成交通知後，取決於具體設計)，向原始的 HTTP 請求者回傳最終的處理結果 (可能是訂單已接收，或訂單已成交等)。

---

## 依賴關係與環境

* **Go Modules:** 依賴 `github.com/gin-gonic/gin`, `github.com/gorilla/websocket`, `github.com/segmentio/kafka-go` 等套件 (應由 `go.mod` 管理)。
* **外部服務:**
    * 需要一個運行在 `http://127.0.0.1:8000/api/order/validate` 的 Python 風險控管服務。
    * 需要一個運行在 `localhost:9092` 的 Kafka 服務，且有名為 `trade_records` 的主題。
* **內部通訊:**
    * `gateway` (作為客戶端) 透過 WebSocket (`ws://localhost:5002/ws`) 與 `engine` (作為伺服器) 通訊。

---

## 注意事項

* 錯誤處理：程式碼中包含了一些基本的錯誤日誌記錄 (`log.Printf`, `log.Println`)，但在生產環境中可能需要更健壯的錯誤處理和監控機制。
* 並發安全：多處使用了 `sync.Mutex` 來保護共享資源 (`OrderBook`, `clients` map)，確保線程安全。
* 設定：部分配置（如服務地址、Kafka地址、主題名）是硬編碼在程式碼中的，實際部署時應考慮使用配置文件或環境變數。