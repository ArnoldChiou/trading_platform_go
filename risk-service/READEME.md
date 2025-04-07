# Risk Management Service

## 描述 (Description)

本模組是一個使用 FastAPI 框架建立的風險管理服務。其主要功能是驗證傳入的交易訂單 (Trading Orders)，確保它們符合預先定義的風險規則，然後才允許它們進入下一個處理階段。此外，它還提供了一個端點來查詢歷史交易記錄 (需要配置資料庫)。

## 功能特色 (Features)

* **訂單驗證 (Order Validation)**: 提供 `/api/order/validate` 端點來驗證交易訂單。
* **基於規則的檢查 (Rule-Based Checks)**:
    * 檢查交易標的 (Symbol) 是否在允許的清單內 (`BTCUSD`, `ETHUSD`)。
    * 檢查交易數量 (Quantity) 是否在有效範圍內 (大於 0 且小於等於 100)。
    * 檢查交易價格 (Price) 是否為正數。
    * 驗證訂單類型 (Type) 是否為 `BUY` 或 `SELL`。
* **健康檢查 (Health Check)**: 提供 `/health` 端點以監控服務狀態。
* **交易查詢 (Trade Query)**: 提供 `/api/trades` 端點，用於從 PostgreSQL 資料庫查詢特定標的的歷史交易記錄 (需額外設定)。
* **非同步框架 (Asynchronous Framework)**: 使用 FastAPI，支援非同步請求處理，提高效能。
* **自動化 API 文件 (Automated API Docs)**: 自動產生 Swagger UI (`/docs`) 和 ReDoc (`/redoc`) 文件頁面。

## 環境需求 (Prerequisites)

在開始之前，請確保您的系統已安裝以下軟體：

1.  **Python**: 建議使用 Python 3.8 或更高版本。您可以從 [Python 官網](https://www.python.org/) 下載並安裝。
2.  **pip**: Python 的套件安裝程式，通常會隨 Python 一起安裝。
3.  **(可選) PostgreSQL 資料庫**: 如果您需要使用 `/api/trades` 端點的功能，則需要一個正在運行的 PostgreSQL 伺服器。
    * 資料庫名稱: `trading_db`
    * 使用者名稱: `arrnoldc`
    * 密碼: `860508` (**安全警告**: 程式碼中直接寫入了密碼，這在生產環境中是不安全的，建議改用環境變數或其他安全方式管理。)
    * 主機: `localhost`
    * 連接埠: `5432`
    * 您需要確保這個資料庫和 `trade_records` 資料表已存在。
4.  **(可選) Kafka**: `routers/trades.py` 文件中有註解提到需要 Kafka 及 `trade_records` 主題 (Topic)。如果您的完整系統架構依賴 Kafka，請確保 Kafka 服務已啟動並已建立該主題。

## 安裝步驟 (Installation)

請依照以下步驟設定您的開發環境：

1.  **複製儲存庫 (Clone the Repository)**:
    (假設您已將程式碼放在 `risk-service` 資料夾中，若透過 git 管理，則使用 `git clone <repository_url>`)

2.  **進入專案目錄 (Navigate to Project Directory)**:
    ```bash
    cd risk-service
    ```

3.  **建立並啟用虛擬環境 (Create and Activate Virtual Environment)**:
    使用虛擬環境是個好習慣，可以隔離專案所需的套件，避免與系統或其他專案產生衝突。
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS / Linux
    python3 -m venv venv
    source venv/bin/activate
    ```
    啟用後，您的命令提示字元前方應該會出現 `(venv)` 字樣。

4.  **安裝依賴套件 (Install Dependencies)**:
    `requirements.txt` 文件列出了本專案所需的核心 Python 套件。使用 pip 進行安裝。
    ```bash
    pip install -r requirements.txt
    ```
    *注意*: 如果您需要使用 `/api/trades` 端點，還需要安裝 PostgreSQL 的 Python 連接器 `psycopg2`。建議使用包含二進制依賴的版本：
    ```bash
    pip install psycopg2-binary
    ```

## 執行服務 (Running the Service)

安裝完畢後，您可以透過 `uvicorn` 伺服器來啟動 FastAPI 應用程式。

1.  **啟動服務 (Start the Server)**:
    在 `risk-service` 資料夾的根目錄下執行以下命令：
    ```bash
    uvicorn main:app --reload
    ```
    * `main`: 指的是 `main.py` 這個檔案。
    * `app`: 指的是在 `main.py` 中建立的 FastAPI 應用程式實例 (`app = FastAPI(...)`)。
    * `--reload`: 這個選項會讓伺服器在偵測到程式碼變更時自動重新載入，非常適合開發階段使用。

2.  **確認服務運行 (Verify Service is Running)**:
    啟動成功後，您應該會在終端機看到類似以下的訊息：
    ```
    INFO:     Uvicorn running on [http://127.0.0.1:8000](http://127.0.0.1:8000) (Press CTRL+C to quit)
    INFO:     Started reloader process [xxxxx] using statreload
    INFO:     Started server process [xxxxx]
    INFO:     Waiting for application startup.
    INFO:     Application startup complete.
    ```
    這表示您的服務已經在本地端的 `8000` 連接埠成功運行。

3.  **存取服務 (Access the Service)**:
    * **基本 URL**: `http://127.0.0.1:8000`
    * **健康檢查**: `http://127.0.0.1:8000/health`
    * **API 文件 (Swagger UI)**: `http://127.0.0.1:8000/docs` - 提供互動式介面，方便您測試 API。
    * **API 文件 (ReDoc)**: `http://127.0.0.1:8000/redoc` - 提供另一種風格的 API 文件。

## API 端點說明 (API Endpoints)

以下是本服務提供的 API 端點詳細說明：

### 1. 健康檢查 (`/health`)

* **方法 (Method)**: `GET`
* **路徑 (Path)**: `/health`
* **描述**: 用來檢查服務是否正常運行。
* **請求 (Request)**: 無需任何參數或請求體。
* **成功回應 (Success Response)**:
    * **狀態碼 (Status Code)**: `200 OK`
    * **回應內容 (Body)**:
        ```json
        {
          "status": "ok"
        }
        ```

### 2. 驗證訂單 (`/api/order/validate`)

* **方法 (Method)**: `POST`
* **路徑 (Path)**: `/api/order/validate`
* **描述**: 接收一個交易訂單請求，並根據預設規則進行驗證。
* **請求內容 (Request Body)**:
    必須是符合以下結構的 JSON 物件：
    ```json
    {
      "user_id": integer,     // 用戶 ID
      "symbol": string,       // 交易標的 (e.g., "BTCUSD", "ETHUSD")
      "price": float,         // 交易價格 (必須 > 0)
      "quantity": float,      // 交易數量 (必須 > 0 and <= 100)
      "type": string          // 訂單類型 ("BUY" or "SELL")
    }
    ```
    **範例請求 (Example Request)**:
    ```json
    {
      "user_id": 1,
      "symbol": "BTCUSD",
      "price": 50000.50,
      "quantity": 1.5,
      "type": "BUY"
    }
    ```
* **成功回應 (Success Response - Validation Passed)**:
    * **狀態碼 (Status Code)**: `200 OK`
    * **回應內容 (Body)**:
        ```json
        {
          "status": "approved",
          "timestamp": "datetime string in ISO 8601 format", // 驗證通過的時間 (UTC)
          "order": { // 驗證通過的訂單內容
            "user_id": integer,
            "symbol": string,
            "price": float,
            "quantity": float,
            "type": string
          }
        }
        ```
        **範例回應 (Example Response)**:
        ```json
        {
          "status": "approved",
          "timestamp": "2025-04-07T06:45:00.123456+00:00",
          "order": {
            "user_id": 1,
            "symbol": "BTCUSD",
            "price": 50000.5,
            "quantity": 1.5,
            "type": "BUY"
          }
        }
        ```
* **失敗回應 (Error Response - Validation Failed)**:
    * **狀態碼 (Status Code)**: `400 Bad Request`
    * **回應內容 (Body)**:
        * **無效標的 (Invalid Symbol)**:
            ```json
            { "detail": "Symbol not allowed" }
            ```
        * **無效數量 (Invalid Quantity)**:
            ```json
            { "detail": "Invalid quantity" }
            ```
        * **無效價格 (Invalid Price)**:
            ```json
            { "detail": "Price must be greater than 0" }
            ```
        * **無效訂單類型 (Invalid Type)**: (FastAPI 會自動處理 `pattern` 驗證)
            ```json
            // 大致結構，細節可能因 FastAPI 版本而異
            {
              "detail": [
                {
                  "loc": ["body", "type"],
                  "msg": "string does not match regex \"^(BUY|SELL)$\"",
                  "type": "value_error.str.regex"
                  // ... 其他欄位
                }
              ]
            }
            ```

### 3. 查詢交易記錄 (`/api/trades`)

* **方法 (Method)**: `POST`
* **路徑 (Path)**: `/api/trades`
* **描述**: 根據提供的交易標的，從 PostgreSQL 資料庫查詢相關的歷史交易記錄，並按時間倒序排列。
* **依賴 (Dependency)**: 此端點需要正確配置並連接到 PostgreSQL 資料庫 (`trading_db`)。
* **請求內容 (Request Body)**:
    ```json
    {
      "symbol": string // 要查詢的交易標的 (e.g., "BTCUSD")
    }
    ```
    **範例請求 (Example Request)**:
    ```json
    {
      "symbol": "BTCUSD"
    }
    ```
* **成功回應 (Success Response)**:
    * **狀態碼 (Status Code)**: `200 OK`
    * **回應內容 (Body)**:
        ```json
        {
          "trades": [
            // ... 從資料庫查詢到的交易記錄列表 ...
            // 格式取決於 'trade_records' 資料表的結構
            // 例如: [trade_id, user_id, symbol, price, quantity, type, timestamp]
          ]
        }
        ```
        **範例回應 (Example Response - 假設的資料表結構)**:
        ```json
        {
          "trades": [
            [102, 1, "BTCUSD", 50100.0, 0.5, "SELL", "2025-04-07T06:30:00+00:00"],
            [101, 2, "BTCUSD", 50050.0, 1.0, "BUY", "2025-04-07T06:25:00+00:00"]
            // ... more trades
          ]
        }
        ```
* **失敗回應 (Error Response)**:
    * 如果資料庫連接失敗或查詢出錯，可能會返回 `500 Internal Server Error`，具體錯誤細節需要查看服務端的日誌。

## 測試 (Testing)

本專案包含使用 `pytest` 框架編寫的單元/整合測試，主要針對 `/api/order/validate` 端點。

1.  **執行測試 (Run Tests)**:
    確保您已安裝 `pytest` (通常作為開發依賴安裝，若未包含在 `requirements.txt`，可執行 `pip install pytest fastapi httpx`)。然後在專案根目錄下執行：
    ```bash
    pytest tests/
    ```
    或者，如果 `pytest` 在您的 PATH 中：
    ```bash
    pytest
    ```

2.  **測試報告 (Test Report)**:
    測試執行完成後，會在終端機顯示結果。您提供的資料夾中包含一個 `tests/report.html` 檔案，這是由 `pytest-html` 套件產生的測試報告，可以用瀏覽器開啟查看詳細的測試結果。

## 主要依賴套件 (Key Dependencies)

* **fastapi**: 主要的 Web 框架。
* **uvicorn**: ASGI 伺服器，用於運行 FastAPI 應用。
* **pydantic**: 用於資料驗證和模型定義。
* **psycopg2-binary** (可選): 用於連接 PostgreSQL 資料庫 (若需使用 `/api/trades`)。
* **pytest** (開發依賴): 用於執行測試。
* **httpx** (開發依賴): `TestClient` 需要此套件來發送非同步請求。

## 未來改進建議 (Potential Improvements)

* **資料庫密碼管理**: 將 `routers/trades.py` 中的資料庫密碼移出程式碼，改用環境變數、設定檔或密鑰管理服務。
* **錯誤處理**: 為資料庫操作 (`/api/trades`) 增加更細緻的錯誤處理和日誌記錄。
* **設定管理**: 使用設定管理工具 (如 Pydantic's BaseSettings) 來處理應用程式設定 (如 `ALLOWED_SYMBOLS`, `MAX_QUANTITY`, 資料庫連接資訊等)。
* **非同步資料庫操作**: 如果效能是關鍵考量，可以將 `/api/trades` 中的資料庫操作改為非同步 (例如使用 `databases` 或 `asyncpg`)。
* **Kafka 整合**: 釐清 `routers/trades.py` 中 Kafka 註解的實際用途，並完善相關的生產者/消費者邏輯 (如果需要)。
* **擴充測試**: 為 `/api/trades` 端點和其他潛在邏輯增加測試案例。