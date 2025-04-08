from kafka import KafkaProducer
import json
from datetime import datetime

BROKER_ADDRESS = '127.0.0.1:9092'  # Kafka broker address
TOPIC_NAME = 'trade_records'       # Kafka topic name

# Kafka Producer 設定
producer = KafkaProducer(
    bootstrap_servers=[BROKER_ADDRESS],
    value_serializer=lambda x: json.dumps(x).encode('utf-8')  # 序列化為 JSON 格式
)

# 發送訊息
trade_message = {
    "symbol": "BTCUSDT",
    "price": 150.25,
    "quantity": 10,
    "buy_id": 12345,
    "sell_id": 67890,
    "time": datetime.now().strftime("%Y-%m-%dT%H:%M:%S")  # ISO 8601 格式
}

try:
    print(f"發送訊息到 Kafka topic '{TOPIC_NAME}': {trade_message}")
    producer.send(TOPIC_NAME, value=trade_message)
    producer.flush()  # 確保訊息被立即發送
    print("訊息已成功發送")
except Exception as e:
    print(f"發送訊息時發生錯誤: {e}")
