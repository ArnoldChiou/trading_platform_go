# Trading Platform (Go)

![Go](https://img.shields.io/badge/Go-1.24-blue) ![React](https://img.shields.io/badge/React-19.0-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.95-green) ![Python](https://img.shields.io/badge/Python-3.13-yellow)

A scalable and modular trading platform written in Go, React, and Python. This project consists of an **API Gateway**, a **Matching Engine**, a **Risk Management Service**, and a **React Frontend** designed to handle trading operations efficiently and provide real-time updates.

---

## Project Structure

```
trading-platform-go/
├── cmd/
│   ├── api-gateway/         # API Gateway entry point
│   │   └── main.go
│   └── matching-engine/     # Matching Engine entry 
│       └── main.go
├── internal/
│   ├── gateway/             # API Gateway logic 
│   │   ├── handlers.go
│   │   ├── risk_client.go
│   │   ├── routes.go
│   │   └── ws_client.go
│   └── engine/              # Matching Engine logic 
│       ├── match.go
│       ├── order.go
│       └── websocket.go
├── pkg/
│   └── utils/               # Utility functions
│       └── helpers.go
├── risk-service/            # Python-based Risk Management Service
│   ├── models/              # Data models
│   │   └── order.py
│   ├── routers/             # API routes
│   │   ├── orders.py
│   │   └── trades.py
│   ├── tests/               # Unit tests
│   │   ├── test_orders.py
│   │   └── report.html
│   ├── install.txt          # Installation instructions
│   ├── main.py              # FastAPI entry point
│   └── requirements.txt     # Python dependencies
├── kafka-consumer-service/  # Kafka consumer service for trade records
│   └── main.py
├── scripts/                 # Utility scripts
├── test/                    # Go unit tests
│   └── engine_match_test.go
├── trading-platform-web/    # React frontend
│   ├── public/              # Static assets
│   │   └── vite.svg
│   ├── src/                 # Frontend source code
│   │   ├── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── ws.js
│   │   ├── TradeChart.jsx
│   │   └── assets/
│   │       └── react.svg
│   ├── eslint.config.js     # ESLint configuration
│   ├── index.html           # HTML entry point
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── README.md            # Frontend documentation
├── go.mod                   # Go module dependencies
├── go.sum                   # Go module checksums
├── websocket.html           # WebSocket testing page
├── project_structure.txt    # Project structure overview
└── README.md                # Project documentation
```

---

## Features

- **API Gateway**: Manages client requests and routes them to the appropriate services via REST and WebSocket.
- **Matching Engine**: Handles trade matching and execution using FIFO logic.
- **Risk Management Service**: Python-based service to validate trading orders.
- **Kafka Consumer**: Consumes trade records from Kafka and stores them in PostgreSQL.
- **WebSocket Support**: Provides real-time updates and notifications for trading events.
- **React Frontend**: Web interface built with React, integrated via REST APIs and WebSocket for real-time trading.
- **Database Integration**: PostgreSQL for persisting trade records.
- **Modular Architecture**: Organized structure for scalability and maintainability.

---

## Prerequisites

- **Go**: Version 1.24.1 or higher
- **Node.js**: Version 16 or higher (for React frontend)
- **Python**: Version 3.10 or higher (for Risk Management Service)
- **PostgreSQL**: Version 13 or higher
- **Kafka**: For trade record streaming
- **Docker**: Optional, for containerized deployment

---

## Setup and Installation

### Clone the Repository

```bash
git clone https://github.com/ArnoldChiou/trading-platform-go.git
cd trading-platform-go
```

### Install Dependencies

#### Backend (Go)
```bash
go mod tidy
```

#### Risk Management Service (Python)
```bash
cd risk-service
pip install -r requirements.txt
```

#### Frontend (React)
```bash
cd trading-platform-web
npm install
```

---

## Running the Services

### 1. Matching Engine
```bash
go run cmd/matching-engine/main.go
```

### 2. API Gateway
```bash
go run cmd/api-gateway/main.go
```

### 3. Risk Management Service
```bash
cd risk-service
uvicorn main:app --reload
```

### 4. Kafka Consumer Service
```bash
cd kafka-consumer-service
python main.py
```

### 5. React Frontend
```bash
cd trading-platform-web
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Example Usage

### Submit Orders via Frontend

1. Navigate to `http://localhost:5173`.
2. Fill in the order details (e.g., type, symbol, price, quantity) and submit.

### WebSocket Real-Time Updates

- The frontend receives real-time trade execution updates via WebSocket.

### API Endpoints

#### API Gateway
- **POST** `/api/order`: Submit a trading order.

#### Risk Management Service
- **POST** `/api/order/validate`: Validate a trading order.
- **POST** `/api/trades`: Query trade records.

---

## Next Steps

- **User Authentication**: Add JWT-based authentication and user management.
- **Advanced Analytics**: Integrate real-time analytics for trade performance.
- **Deployment**: Containerize services with Docker and automate deployments using CI/CD pipelines.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.

