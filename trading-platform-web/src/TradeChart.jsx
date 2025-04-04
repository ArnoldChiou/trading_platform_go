import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const TradeChart = ({ candleData }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      console.log('Initializing chart with dimensions:', containerRef.current.offsetWidth, containerRef.current.offsetHeight);
      try {
        const chart = createChart(containerRef.current, {
          width: containerRef.current.offsetWidth || 600,
          height: containerRef.current.offsetHeight || 400,
          layout: {
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
          },
          grid: {
            vertLines: { color: '#e1e1e1' },
            horzLines: { color: '#e1e1e1' },
          },
          timeScale: {
            timeVisible: true, // Ensure the time axis shows detailed time
            secondsVisible: true, // Show seconds on the time axis
          },
        });

        if (chart && typeof chart.addCandlestickSeries === 'function') {
          const candlestickSeries = chart.addCandlestickSeries();
          candlestickSeries.setData(candleData || []);

          chartRef.current = { chart, candlestickSeries };
          console.log('Candlestick chart initialized successfully');
        } else {
          console.error('Chart object is invalid or addCandlestickSeries is not a function:', chart);
        }
      } catch (error) {
        console.error('Error initializing candlestick chart:', error);
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.chart.remove();
        chartRef.current = null;
        console.log('Chart removed');
      }
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && candleData) {
      const { candlestickSeries } = chartRef.current;
      candlestickSeries.setData(candleData);
      console.log('Candlestick chart updated with new data');
    }
  }, [candleData]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    />
  );
};

export default React.memo(TradeChart);