package gateway

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type RiskOrderRequest struct {
	UserID   int     `json:"user_id"`
	Symbol   string  `json:"symbol"`
	Price    float64 `json:"price"`
	Quantity float64 `json:"quantity"`
	Type     string  `json:"type"`
}

type RiskResponse struct {
	Status    string                 `json:"status"`
	Timestamp string                 `json:"timestamp"`
	Order     map[string]interface{} `json:"order"`
}

func validateOrderWithPython(order RiskOrderRequest) error {
	jsonData, err := json.Marshal(order)
	if err != nil {
		return fmt.Errorf("JSON序列化錯誤: %w", err)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		"http://127.0.0.1:8000/api/order/validate",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return fmt.Errorf("建立HTTP請求失敗: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("風控服務連線錯誤: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("風控檢查未通過，狀態碼: %d", resp.StatusCode)
	}

	var riskResp RiskResponse
	if err := json.NewDecoder(resp.Body).Decode(&riskResp); err != nil {
		return fmt.Errorf("解析風控回應錯誤: %w", err)
	}

	return nil
}
