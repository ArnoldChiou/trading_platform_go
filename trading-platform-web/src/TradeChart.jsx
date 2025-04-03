import React, { useEffect, useRef } from 'react';

const TradeChart = ({ realTimePrice }) => {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !widgetRef.current) {
      try {
        const widgetConfig = {
          container_id: containerRef.current.id,
          autosize: true,
          symbol: "BINANCE:BTCUSDT",
          interval: "1",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          studies: ["MACD@tv-basicstudies"],
        };

        widgetRef.current = new window.TradingView.widget(widgetConfig);
        console.log('TradingView widget initialized');
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
      }
    }
  }, []);

  return (
    <div
      id="tradingview_chart"
      ref={containerRef}
      style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", boxSizing: "border-box" }}
    />
  );
};

export default TradeChart;