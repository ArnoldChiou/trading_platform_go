import { useState, useEffect } from 'react';
import { submitOrder } from './api';
import { connectWS } from './ws';

function App() {
  const [order, setOrder] = useState({
    user_id: 123,
    side: 'BUY',
    symbol: 'BTCUSD',
    price: 42000,
    quantity: 1,
  });
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = connectWS(
      'ws://localhost:5002/ws',
      (msg) => setMessages((prev) => [...prev, msg]),
      () => console.log('WebSocket opened'),
      () => console.log('WebSocket closed')
    );

    return () => ws.close();
  }, []);

  const handleOrderSubmit = async () => {
    try {
      const res = await submitOrder(order);
      console.log('API Response:', res.data);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📈 模擬交易平台</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>類型：</label>
        <select value={order.side} onChange={(e) => setOrder({ ...order, side: e.target.value })}>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Symbol：</label>
        <input
          type="text"
          value={order.symbol}
          onChange={(e) => setOrder({ ...order, symbol: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>價格：</label>
        <input
          type="number"
          value={order.price}
          onChange={(e) => setOrder({ ...order, price: parseFloat(e.target.value) })}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>數量：</label>
        <input
          type="number"
          value={order.quantity}
          onChange={(e) => setOrder({ ...order, quantity: parseFloat(e.target.value) })}
        />
      </div>

      <button onClick={handleOrderSubmit}>送出訂單</button>

      <h2>📥 即時訊息：</h2>
      <div style={{ border: '1px solid #ccc', padding: '1rem', height: '200px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <pre key={idx}>{JSON.stringify(msg, null, 2)}</pre>
        ))}
      </div>
    </div>
  );
}

export default App;
