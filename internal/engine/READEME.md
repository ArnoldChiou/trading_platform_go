## Matching Engine (`internal/engine`)

`engine` 模組是交易平台的核心，負責處理訂單的存儲、匹配和成交。

**主要職責：**

1.  **訂單資料結構:**
    * `order.go`: 定義了系統中訂單 (`Order`) 的標準結構，包含 `ID`, `UserID`, `Type` (`BUY`/`SELL`), `Symbol`, `Price`, `Quantity`, `Timestamp` 等欄位。同時定義了 `OrderType` 常數。

2.  **WebSocket 伺服器:**
    * `websocket.go`:
        * 使用 `gorilla/websocket` 套件啟動一個 WebSocket **伺服器** (預設監聽 `localhost:5002/ws`)。
        * `StartWebSocketServer`: 啟動伺服器的函數。
        * `wsHandler`: 處理每個 WebSocket 連線的請求。
        * **客戶端管理:**
            * 為每個連線的客戶端 (例如 `gateway`) 分配一個唯一 ID (`clientID`)。
            * 使用 `sync.Mutex` 保護的 `clients` map 來追蹤所有活躍的連線 (`registerClient`, `unregisterClient`)。
        * **訂單接收:**
            * 持續監聽來自客戶端 (如 `gateway`) 的 WebSocket 訊息。
            * 將接收到的 JSON 訊息解析為 `Order` 結構。
            * 為訂單分配唯一 ID (`UnixNano`) 和時間戳。
            * 呼叫 `AddOrder` 將訂單加入撮合邏輯中。
            * **初步回應:** 在收到訂單後，會立即回傳一個包含 `status: "received"` 和訂單詳情的 JSON 訊息給發送方 (`gateway`)。

3.  **訂單簿 (Order Book) 與撮合邏輯:**
    * `match.go`:
        * **訂單簿 (`OrderBook`)**:
            * 維護一個全局的 `OrderBook` 結構 (`book`)，包含 `BuyOrders` 和 `SellOrders` 兩個切片，分別存放未成交的買單和賣單。
            * 使用 `sync.Mutex` (`book.mu`) 來確保對訂單簿操作的線程安全。
        * **新增訂單 (`AddOrder`)**:
            * 將新的訂單根據其類型 (`BUY`/`SELL`) 加入到對應的訂單列表 (`BuyOrders` 或 `SellOrders`)。
            * 呼叫 `matchOrders` 嘗試進行撮合。
        * **撮合演算法 (`matchOrders`)**:
            * 持續尋找最佳買價 (`bestBid`) 和最佳賣價 (`bestAsk`)。
            * **匹配條件:** 當最佳買價大於或等於最佳賣價時，發生撮合。
            * **成交邏輯:**
                * 以賣單價格作為成交價 (`price`)。
                * 計算最小的可成交數量 (`execQty`)。
                * 更新參與撮合的買賣訂單的剩餘數量。
                * 產生一筆成交記錄 (`trade`)，包含狀態、商品、價格、數量、買賣方訂單ID和時間。
            * **移除已完成訂單:** 如果訂單數量變為 0，則將其從訂單簿中移除 (`removeOrder`)。
            * **價格/時間優先:** `bestBid` 和 `bestAsk` 的邏輯隱含了價格優先（買價越高越優先，賣價越低越優先），相同價格下時間優先（先來的訂單優先）的原則。
        * **輔助函數:** `min`, `bestBid`, `bestAsk`, `removeOrder`。

4.  **成交結果處理與通知:**
    * `match.go`:
        * **Kafka 整合:**
            * 初始化一個 Kafka 生產者 (`kafkaWriter`)，用於將成交記錄發送到指定的 Kafka 主題 (`trade_records`, Broker 在 `localhost:9092`)。
            * `sendToKafka` 函數負責將 `trade` 記錄序列化為 JSON 並發送。
        * **即時通知客戶端:**
            * 當撮合發生時 (`matchOrders` 內)，會遍歷 `websocket.go` 中維護的所有已連線客戶端 (`clients`)。
            * 將成交記錄 (`trade`) 以 JSON 格式透過 WebSocket 推送給 **所有** 連線的客戶端 (主要是 `gateway`，`gateway` 再決定如何處理，例如通知用戶)。
