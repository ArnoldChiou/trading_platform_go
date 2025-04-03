import sys
import os

# Add the parent directory of 'risk-service' to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_validate_order_buy():
    payload = {
        "user_id": 1,
        "symbol": "BTCUSD",
        "price": 50000,
        "quantity": 1,
        "type": "BUY",
    }
    response = client.post("/api/order/validate", json=payload)
    print("Request Payload:", payload)
    print("Response Status Code:", response.status_code)
    print("Response JSON:", response.json())
    assert response.status_code == 200
    assert response.json()["status"] == "approved"

def test_validate_order_sell():
    payload = {
        "user_id": 1,
        "symbol": "BTCUSD",
        "price": 50000,
        "quantity": 1,
        "type": "SELL",
    }
    response = client.post("/api/order/validate", json=payload)
    print("Request Payload:", payload)
    print("Response Status Code:", response.status_code)
    print("Response JSON:", response.json())
    assert response.status_code == 200
    assert response.json()["status"] == "approved"

def test_invalid_symbol():
    payload = {
        "user_id": 1,
        "symbol": "INVALID",
        "price": 50000,
        "quantity": 1,
        "type": "BUY",
    }
    response = client.post("/api/order/validate", json=payload)
    print("Request Payload:", payload)
    print("Response Status Code:", response.status_code)
    print("Response JSON:", response.json())
    assert response.status_code == 400
    assert response.json()["detail"] == "Symbol not allowed"

def test_invalid_quantity():
    payload = {
        "user_id": 1,
        "symbol": "BTCUSD",
        "price": 50000,
        "quantity": 0,
        "type": "BUY",
    }
    response = client.post("/api/order/validate", json=payload)
    print("Request Payload:", payload)
    print("Response Status Code:", response.status_code)
    print("Response JSON:", response.json())
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid quantity"

def test_invalid_price():
    payload = {
        "user_id": 1,
        "symbol": "BTCUSD",
        "price": -1,
        "quantity": 1,
        "type": "BUY",
    }
    response = client.post("/api/order/validate", json=payload)
    print("Request Payload:", payload)
    print("Response Status Code:", response.status_code)
    print("Response JSON:", response.json())
    assert response.status_code == 400
    assert response.json()["detail"] == "Price must be greater than 0"