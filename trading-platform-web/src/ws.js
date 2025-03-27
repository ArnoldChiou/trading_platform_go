export const connectWS = (url, onMessage, onOpen, onClose) => {
  const ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket 連線成功');
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    console.log('📥 收到 WebSocket 訊息:', event.data);
    if (onMessage) onMessage(JSON.parse(event.data));
  };

  ws.onclose = () => {
    console.log('WebSocket 已斷開');
    if (onClose) onClose();
  };

  return ws;
};
