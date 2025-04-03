from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import datetime
from datetime import datetime, timezone

router = APIRouter()

class OrderRequest(BaseModel):
    user_id: int
    symbol: str
    price: float
    quantity: float
    type: str = Field(..., pattern="^(BUY|SELL)$")  # 修改為使用 pattern


MAX_QUANTITY = 100.0
ALLOWED_SYMBOLS = {"BTCUSD", "ETHUSD"}

@router.post("/order/validate")
def validate_order(order: OrderRequest):
    if order.symbol not in ALLOWED_SYMBOLS:
        raise HTTPException(status_code=400, detail="Symbol not allowed")

    if not (0 < order.quantity <= MAX_QUANTITY):
        raise HTTPException(status_code=400, detail="Invalid quantity")

    if order.price <= 0:
        raise HTTPException(status_code=400, detail="Price must be greater than 0")

    return {
        "status": "approved",
        "timestamp": datetime.now(timezone.utc),  # Updated to use timezone-aware datetime
        "order": order.model_dump()  # Updated to use Pydantic's model_dump
    }
