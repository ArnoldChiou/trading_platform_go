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
  const [candleData, setCandleData] = useState([]);

  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  // Fetch historical candlestick data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get(
          'https://api.binance.com/api/v3/klines',
          {
            params: {
              symbol: 'BTCUSDT',
              interval: '1m',
              limit: 500,
            },
          }
        );

        const historicalData = response.data.map((candle) => ({
          time: candle[0] / 1000, // Convert to seconds
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
        }));

        setCandleData(historicalData);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, []);

  // Update candlestick data with real-time WebSocket data
  useEffect(() => {
    let binanceWS;

    const connectWithRetry = () => {
      if (retryCount >= maxRetries) {
        console.error('Max retries reached. Unable to connect to WebSocket.');
        return;
      }

      binanceWS = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

      binanceWS.onopen = () => {
        console.log('WebSocket connection established.');
        setRetryCount(0); // Reset retry count on successful connection
      };

      binanceWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const candlestick = data.k;
        const newCandle = {
          time: candlestick.t / 1000, // Convert to seconds
          open: parseFloat(candlestick.o),
          high: parseFloat(candlestick.h),
          low: parseFloat(candlestick.l),
          close: parseFloat(candlestick.c),
        };

        setCandleData((prev) => {
          const updatedData = [...prev];
          if (updatedData.length > 0 && updatedData[updatedData.length - 1].time === newCandle.time) {
            updatedData[updatedData.length - 1] = newCandle; // Update the last candle
          } else {
            updatedData.push(newCandle); // Add a new candle
          }
          return updatedData;
        });
      };

      binanceWS.onerror = (error) => {
        console.error('WebSocket Error:', error);
        binanceWS.close();
      };

      binanceWS.onclose = () => {
        console.log('WebSocket connection closed. Retrying...');
        setRetryCount((prev) => prev + 1);
        setTimeout(connectWithRetry, 2000); // Retry after 2 seconds
      };
    };

    connectWithRetry();

    return () => binanceWS && binanceWS.close();
  }, [retryCount]);

  // WebSocket integration for real-time messages
  useEffect(() => {
    const ws = connectWS(
      'ws://localhost:5002/ws',
      (message) => {
        console.log('WebSocket message received:', message);
        setMessages((prevMessages) => [...prevMessages, message]); // Append new message to the state
      },
      () => console.log('WebSocket connection opened.'),
      () => console.log('WebSocket connection closed.')
    );

    return () => ws.close(); // Clean up WebSocket connection on component unmount
  }, []);

  const handleOrderSubmit = async () => {
    try {
      const payload = { ...order, price: candleData[candleData.length - 1]?.close || order.price };
      console.log('Order payload:', JSON.stringify(payload, null, 2)); // Log the payload in detail

      const res = await submitOrder(payload);
      console.log('Order submitted successfully:', res.data); // Log the response from the server
    } catch (error) {
      console.error('API Error:', error);

      if (error.response) {
        console.error('Response data:', error.response.data); // Log the response data from the server
        console.error('Response status:', error.response.status); // Log the response status
        console.error('Response headers:', error.response.headers); // Log the response headers
      } else if (error.request) {
        console.error('No response received:', error.request); // Log the request if no response was received
      } else {
        console.error('Error setting up the request:', error.message); // Log any other errors
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Arial, sans-serif', overflow: 'hidden', backgroundColor: '#f4f4f9' }}>
      
      <header style={{ padding: '1rem', backgroundColor: '#4CAF50', color: 'white', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
        模擬交易平台
      </header>

      <main style={{ flex: 3, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
        <TradeChart candleData={candleData} />
      </main>

      <footer style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderTop: '1px solid #ddd', flexShrink: 0 }}>
        <h2 style={{ marginBottom: '1rem', color: '#333' }}>交易面板</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>類型：</label>
            <select
              value={order.type}
              onChange={(e) => setOrder({ ...order, type: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Symbol：</label>
            <input
              type="text"
              value={order.symbol}
              onChange={(e) => setOrder({ ...order, symbol: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>價格：</label>
            <input
              type="number"
              value={candleData[candleData.length - 1]?.close || ''}
              readOnly
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>數量：</label>
            <input
              type="number"
              value={order.quantity}
              onChange={(e) => setOrder({ ...order, quantity: parseFloat(e.target.value) })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleOrderSubmit}
              style={{
                width: '100%',
                padding: '0.75rem',
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
        </div>

        <h2 style={{ marginBottom: '1rem', color: '#333' }}>📥 即時訊息：</h2>
        <div style={{ border: '1px solid #ccc', padding: '1rem', height: '100px', overflowY: 'scroll', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          {messages.map((msg, idx) => (
            <pre key={idx} style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>{JSON.stringify(msg, null, 2)}</pre>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default App;
