# 模擬交易平台前端 (Simulated Trading Platform Frontend)

這是一個使用 React 建構的模擬交易平台前端應用程式。它旨在提供一個介面來視覺化即時金融市場數據（特別是加密貨幣，如 BTC/USDT），並允許用戶提交模擬的買賣訂單。

## ✨ 主要功能

* **📈 即時 K 線圖 (Candlestick Chart)**:
    * 從 Binance API 獲取歷史 K 線數據（預設為 BTC/USDT 1 分鐘線）。
    * 透過 Binance WebSocket (`wss://stream.binance.com:9443/ws/btcusdt@kline_1m`) 連接，即時更新 K 線圖的最新價格。
    * 使用 [Lightweight Charts™](https://github.com/tradingview/lightweight-charts) 函式庫渲染高效能的互動式圖表。
    * 具備 WebSocket 連線重試機制，以增加連線穩定性。
* **🛒 模擬訂單提交**:
    * 提供一個交易面板，讓使用者可以選擇訂單類型（BUY/SELL）、輸入交易對象（Symbol）和數量。
    * 價格欄位會自動顯示當前最新的收盤價（從 K 線圖數據獲取），此價格將用於提交訂單。
    * 點擊「送出訂單」按鈕會將訂單資訊透過 HTTP POST 請求發送到設定的後端 API (`http://localhost:8080/api/order`)。
* **websocket 訊息顯示**:
    * 連接到一個本地的 WebSocket 伺服器 (`ws://localhost:5002/ws`)。
    * 即時接收來自後端 WebSocket 的訊息（例如：訂單確認、系統通知等）並顯示在介面下方。

## 🛠️ 技術棧

* **前端框架**: React (v18+)
* **JavaScript**: ES6+
* **狀態管理**: React Hooks (`useState`, `useEffect`, `useRef`)
* **HTTP 客戶端**: Axios (用於與後端 API 通訊)
* **圖表庫**: Lightweight Charts (用於顯示 K 線圖)
* **WebSocket**: 原生 WebSocket API (用於連接 Binance 和本地後端)
* **構建工具**: (推測為 Vite，基於 `main.jsx` 和 `.jsx` 副檔名)
* **CSS**: 基本 CSS (用於元件樣式)

## ⚙️ 環境要求與設定

在開始之前，請確保你的開發環境滿足以下條件：

1.  **Node.js**: 需要安裝 Node.js (建議 LTS 版本) 和 npm (或 yarn)。你可以從 [Node.js 官網](https://nodejs.org/) 下載。
2.  **後端 API 服務**:
    * **必須**: 需要一個在本機 `http://localhost:8080` 運行的後端 API 伺服器。
    * 該伺服器需要能夠接收 `POST` 請求到 `/api/order` 路徑，並處理訂單提交邏輯。
3.  **後端 WebSocket 服務**:
    * **必須**: 需要一個在本機 `ws://localhost:5002/ws` 運行的 WebSocket 伺服器。
    * 該伺服器負責將即時訊息（如訂單狀態更新）推送到此前端應用程式。
4.  **網路連線**: 需要穩定的網路連線才能從 Binance 獲取數據。
5.  **網頁瀏覽器**: 一個現代的網頁瀏覽器 (如 Chrome, Firefox, Edge)。

## 🚀 啟動與運行

1.  **進入專案目錄**:
    ```bash
    cd trading_platform_go\trading-platform-web
    ```
    (你需要位於包含 `package.json` 檔案的目錄，這個目錄通常在 `src` 的上一層。如果沒有 `package.json`，你需要先初始化專案 `npm init -y` 或 `yarn init -y` 並安裝必要的依賴)

3.  **安裝依賴**:
    * 使用 npm:
        ```bash
        npm install
        ```
    * 或使用 yarn:
        ```bash
        yarn install
        ```
    * 這會安裝 `react`, `react-dom`, `axios`, `lightweight-charts` 等必要的函式庫。

4.  **確保後端服務已運行**:
    * 啟動你在 `http://localhost:8080` 設定的後端 API 伺服器。
    * 啟動你在 `ws://localhost:5002` 設定的後端 WebSocket 伺服器。
    * **沒有這兩個後端服務，訂單提交和本地即時訊息功能將無法正常運作。**

5.  **啟動前端開發伺服器**:
    * (假設使用 Vite) 使用 npm:
        ```bash
        npm run dev
        ```
    * (假設使用 Vite) 或使用 yarn:
        ```bash
        yarn dev
        ```
    * 這會啟動一個本地開發伺服器 (通常在 `http://localhost:5173` 或類似的端口)。

6.  **開啟瀏覽器**:
    * 在瀏覽器中打開開發伺服器提供的 URL (例如 `http://localhost:5173`)。
    * 你應該能看到模擬交易平台的介面，包括 K 線圖和交易面板。