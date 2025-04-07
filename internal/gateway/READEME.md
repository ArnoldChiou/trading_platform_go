## Gateway (`internal/gateway`)

`gateway` 模組扮演著系統的入口，負責接收來自外部（例如前端應用或API消費者）的請求，並將其路由至適當的處理程序。

**主要職責：**

1.  **HTTP API 端點:**
    * 使用 `Gin` 框架 (`routes.go`, `handlers.go`) 建立和管理 API 路由。
    * 目前主要定義了 `/api/order` 端點 (`POST` 方法)，用於接收新的交易訂單。
    * `routes.go`: 負責將 URL 路徑映射到對應的處理函數。
    * `handlers.go`: 包含 `OrderHandler` 函數，這是處理 `/api/order` 請求的具體邏輯。

2.  **請求處理與驗證:**
    * `handlers.go` 中的 `OrderHandler`:
        * 解析傳入的 HTTP 請求（JSON 格式的訂單資料 `OrderRequest`）。
        * **風險控管整合:** 在正式處理訂單前，會呼叫 `risk_client.go` 中的 `validateOrderWithPython` 函數。
        * `risk_client.go`:
            * 將訂單資訊 (`RiskOrderRequest`) 序列化成 JSON。
            * 向運行在 `http://127.0.0.1:8000/api/order/validate` 的外部 Python 風險控管服務發送 `POST` 請求。
            * 檢查 Python 服務的回應，如果驗證失敗或通訊錯誤，則拒絕訂單。
        * 將通過驗證的 `OrderRequest` 轉換為撮合引擎內部使用的 `engine.Order` 結構。

3.  **與撮合引擎通訊 (WebSocket 客戶端):**
    * `ws_client.go`:
        * 實現了一個 WebSocket **客戶端**，用於連接到撮合引擎 (`engine`) 的 WebSocket 伺服器 (預設地址 `ws://localhost:5002/ws`)。
        * 使用 `sync.Once` 確保只有一個 WebSocket 連線 (Singleton 模式)。
        * `SendOrderToEngine` 函數:
            * 獲取 WebSocket 連線。
            * 將 `engine.Order` 透過 WebSocket 發送給撮合引擎。
            * 等待並接收撮合引擎的初步回應（例如，訂單已接收的確認）。
    * `handlers.go` 在風控通過後，會呼叫 `SendOrderToEngine` 將訂單發送至撮合引擎，並將引擎的回應返回給原始的 HTTP 請求者。