# Trading Platform (Go)

![Go](https://img.shields.io/badge/Go-1.24-blue)

A scalable and modular trading platform written in Go. This project consists of an API Gateway and a Matching Engine designed to handle trading operations efficiently.

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
│   │   └── routes.go
│   └── engine
│       ├── websocket.go
│       └── match.go
├── pkg
│   └── utils
│       └── helpers.go
├── go.mod
└── go.sum
```

## Features

- **API Gateway**: Manages client requests and routes them to the appropriate services.
- **Matching Engine**: Handles trade matching and execution.
- **WebSocket Support**: Provides real-time updates to clients.
- **Modular Architecture**: Organized structure for scalability and maintainability.

## Next Steps

✅ **Enhance Matching Logic**: Implement robust trade matching in `internal/engine/match.go`.

✅ **Integrate API Forwarding**: Connect API Gateway to Matching Engine in `internal/gateway/`.

✅ **Expand Functional Modules**: Add user management, authentication, and permissions under `internal/`.

## Getting Started

### Prerequisites
- Go 1.24.1+
- Docker (optional, for containerized deployment)

### Installation

```sh
git clone https://github.com/ArnoldChiou/trading-platform-go.git
cd trading-platform-go
go mod tidy
```

### Running the Services

#### API Gateway
```sh
go run cmd/api-gateway/main.go
```

#### Matching Engine
```sh
go run cmd/matching-engine/main.go
```

### Contributing
Contributions are welcome! Please open an issue or submit a pull request.

### License
This project is licensed under the Arnold License.

