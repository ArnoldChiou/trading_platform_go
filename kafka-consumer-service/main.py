from kafka import KafkaConsumer
import psycopg2
import json
from datetime import datetime

# Kafka Consumer 設定
consumer = KafkaConsumer(
    'trade_records',
    bootstrap_servers=['127.0.0.1:9092'],
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='trade_group',
    value_deserializer=lambda x: json.loads(x.decode('utf-8')) if x else None
)

# PostgreSQL 連線設定
conn = psycopg2.connect(
    dbname="trading_db",
    user="arrnoldc",
    password="860508",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# 建立交易紀錄表格
cursor.execute("""
CREATE TABLE IF NOT EXISTS trade_records (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10),
    price FLOAT,
    quantity FLOAT,
    buy_id BIGINT,
    sell_id BIGINT,
    time TIMESTAMP
)
""")
conn.commit()

# 消費 Kafka 訊息並寫入 PostgreSQL
for message in consumer:
    if message.value is None:
        print("接收到空訊息，跳過處理")
        continue

    try:
        trade = message.value
        print(f"接收到的 Kafka 訊息: {trade}")

        # 驗證時間格式
        try:
            datetime.strptime(trade['time'], "%Y-%m-%dT%H:%M:%S")
        except ValueError:
            print(f"無效的時間格式，跳過此訊息: {trade['time']}")
            continue

        cursor.execute("""
            INSERT INTO trade_records (symbol, price, quantity, buy_id, sell_id, time)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (trade['symbol'], trade['price'], trade['quantity'], trade['buy_id'], trade['sell_id'], trade['time']))
        conn.commit()
        print(f"交易紀錄已儲存: {trade}")
    except json.JSONDecodeError as e:
        print(f"JSON 解碼錯誤，跳過此訊息: {e}")
    except psycopg2.Error as e:
        print(f"資料庫錯誤，回滾交易: {e}")
        conn.rollback()
    except Exception as e:
        print(f"處理訊息時發生錯誤: {e}")
        conn.rollback()