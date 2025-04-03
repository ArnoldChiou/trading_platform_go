import { useState, useEffect } from 'react';
import { submitOrder } from './api';
import { connectWS } from './ws';
import TradeChart from './TradeChart';
import axios from 'axios';

function App() {
  const [order, setOrder] = useState({
    user_id: 123,
    type: 'BUY',
    symbol: 'BTCUSD',
    price: 42000,
    quantity: 1,
  });
  const [messages, setMessages] = useState([]);
  const [realTimePrice, setRealTimePrice] = useState(null);

  useEffect(() => {
    const ws = connectWS(
      'ws://localhost:5002/ws',
      (msg) => {
        setMessages((prev) => [...prev, msg]);
      },
      null,
      null
    );

    return () => ws.close();
  }, []);

  useEffect(() => {
    const binanceWS = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

    binanceWS.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const price = parseFloat(data.p);
      setRealTimePrice(price);
    };

    return () => binanceWS.close();
  }, []);

  const handleOrderSubmit = async () => {
    try {
      const res = await submitOrder({ ...order, price: realTimePrice || order.price });
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <div style={{ flex: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <TradeChart realTimePrice={realTimePrice} />
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderTop: '1px solid #ccc', flexShrink: 0, height: 'auto' }}>
        <h2>交易面板</h2>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label>類型：</label>
            <select value={order.type} onChange={(e) => setOrder({ ...order, type: e.target.value })}>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div>
            <label>Symbol：</label>
            <input
              type="text"
              value={order.symbol}
              onChange={(e) => setOrder({ ...order, symbol: e.target.value })}
            />
          </div>

          <div>
            <label>價格：</label>
            <input
              type="number"
              value={realTimePrice || ''}
              readOnly
            />
          </div>

          <div>
            <label>數量：</label>
            <input
              type="number"
              value={order.quantity}
              onChange={(e) => setOrder({ ...order, quantity: parseFloat(e.target.value) })}
            />
          </div>

          <button
            onClick={handleOrderSubmit}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#45a049')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#4CAF50')}
          >
            送出訂單
          </button>
        </div>

        <h2>📥 即時訊息：</h2>
        <div style={{ border: '1px solid #ccc', padding: '1rem', height: '50px', overflowY: 'scroll' }}>
          {messages.map((msg, idx) => (
            <pre key={idx}>{JSON.stringify(msg, null, 2)}</pre>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
