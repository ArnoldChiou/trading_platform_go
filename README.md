# Trading Platform (Go)

![Go](https://img.shields.io/badge/Go-1.24-blue)

A scalable and modular trading platform written in Go. This project consists of an **API Gateway**, a **Matching Engine**, and a **React Frontend** designed to handle trading operations efficiently and provide real-time updates.

## Project Structure

```
trading-platform-go/
├── cmd
│   ├── api-gateway
│   │   └── main.go
│   └── matching-engine
│       └── main.go
├── internal
│   ├── gateway
│   │   ├── handlers.go
│   │   ├── routes.go
│   │   └── ws_client.go
│   └── engine
│       ├── websocket.go
│       ├── match.go
│       └── order.go
├── pkg
│   └── utils
│       └── helpers.go
├── go.mod
└── go.sum
```

## Features

- **API Gateway**: Manages client requests and routes them to the appropriate services via REST and WebSocket.
- **Matching Engine**: Handles trade matching and execution using FIFO logic.
- **WebSocket Support**: Provides real-time updates and notifications for trading events.
- **React Frontend Integration**: Web interface built with React, integrated via REST APIs and WebSocket for real-time trading.
- **Modular Architecture**: Organized structure for scalability and maintainability.

## Current Progress

✅ **Matching Logic Implemented**: Robust trade matching logic with real-time client notifications.

✅ **API Gateway Integrated**: API Gateway connected to the Matching Engine, supporting cross-service communication.

✅ **Real-Time Web Interface**: React frontend fully integrated and functional, with live updates through WebSocket.

## Next Steps

- **User Authentication and Account Management**: Implement user management, authentication (JWT), and permissions.
- **Risk Management Module**: Develop a Python-based risk management engine to enforce trading rules.
- **Database Integration**: Persist orders and trade history using PostgreSQL or Redis.
- **Deployment Automation**: Containerize services with Docker and automate deployments using CI/CD pipelines.

## Getting Started

### Prerequisites
- Go 1.24.1+
- Node.js & npm (for React frontend)
- Docker (optional, for containerized deployment)

### Installation

```sh
git clone https://github.com/ArnoldChiou/trading-platform-go.git
cd trading-platform-go
go mod tidy
```

### Running the Services

#### Matching Engine

```sh
go run cmd/matching-engine/main.go
```

#### API Gateway

```sh
go run cmd/api-gateway/main.go
```

#### React Frontend

```sh
cd trading-platform-web
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

## Example Usage

1. Navigate to `http://localhost:5173`.
2. Submit a buy and sell order via the React interface:

**Buy Order Example:**
```json
{
	"type": "BUY",
	"symbol": "BTCUSD",
	"price": 42000,
	"quantity": 1
}
```

**Sell Order Example:**
```json
{
	"type": "SELL",
	"symbol": "BTCUSD",
	"price": 41950,
	"quantity": 1
}
```

The Matching Engine will automatically execute and notify you in real-time via WebSocket.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the Arnold License.

