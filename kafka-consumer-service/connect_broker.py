from kafka import KafkaConsumer
import psycopg2
import json
from datetime import datetime

BROKER_ADDRESS = '127.0.0.1:9092'  # Kafka broker address

try:
    print(f"嘗試連接到 Kafka broker (KRaft 模式): {BROKER_ADDRESS}")
    # Kafka Consumer 設定
    consumer = KafkaConsumer(
        'trade_records',
        bootstrap_servers=[BROKER_ADDRESS],
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='trade_group',
        value_deserializer=lambda x: json.loads(x.decode('utf-8')) if x else None
    )
    print("成功連接到 Kafka broker (KRaft 模式)")
except Exception as e:
    print(f"無法連接到 Kafka broker ({BROKER_ADDRESS}): {e}")
    print("請檢查 Kafka broker 是否正在運行，並確認地址和端口是否正確。")
    print("如果使用 KRaft 模式，請確認 Kafka 配置是否正確。")
    exit(1)

# PostgreSQL 連線設定
conn = psycopg2.connect(
    dbname="trading_db",
    user="arrnoldc",
    password="860508",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# 檢查資料表是否存在（可選）
try:
    cursor.execute("""
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'trade_records';
    """)
    if cursor.fetchone() is None:
        print("資料表不存在，正在創建...")
        cursor.execute("""
        CREATE TABLE trade_records (
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
        print("資料表已創建")
    else:
        print("資料表已存在，跳過創建")
except psycopg2.Error as e:
    print(f"檢查或創建資料表時發生錯誤: {e}")
    conn.rollback()

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