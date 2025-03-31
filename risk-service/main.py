from fastapi import FastAPI
from routers import orders

app = FastAPI(
    title="Risk Management Service",
    version="0.1.0",
    description="Validate trading orders."
)

app.include_router(orders.router, prefix="/api", tags=["orders"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
