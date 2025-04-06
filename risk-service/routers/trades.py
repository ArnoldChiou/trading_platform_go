from fastapi import APIRouter
import psycopg2
from pydantic import BaseModel

router = APIRouter()

# PostgreSQL 連線設定
conn = psycopg2.connect(
    dbname="trading_db",
    user="arrnoldc",
    password="860508",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

### Kafka 啟動

# 確保 Kafka 已啟動，並建立 `trade_records` Topic：
# bin/kafka-topics.sh --create --topic trade_records --bootstrap-server localhost:9092

class TradeQuery(BaseModel):
    symbol: str

@router.post("/trades")
def get_trades(query: TradeQuery):
    cursor.execute("""
        SELECT * FROM trade_records WHERE symbol = %s ORDER BY time DESC
    """, (query.symbol,))
    trades = cursor.fetchall()
    return {"trades": trades}