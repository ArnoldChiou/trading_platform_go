export const connectWS = (url, onMessage, onOpen, onClose) => {
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket 連線成功');
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    console.log('📥 收到 WebSocket 訊息:', event.data);
    try {
      const parsedData = JSON.parse(event.data);
      if (onMessage) onMessage(parsedData);
    } catch (error) {
      console.error('解析 WebSocket 訊息失敗:', error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket 已斷開');
    if (onClose) onClose();
  };

  return ws;
};
