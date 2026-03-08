# SentinelFlow: Graph-based ML Fraud Detection System

SentinelFlow is a production-grade financial fraud detection platform leveraging **Graph Neural Networks (GNNs)** to identify suspicious transaction patterns in real-time.

##  Quick Start

Follow these steps to deploy the full stack using Docker:

### 1. Clone and Prepare
```bash
git clone <repository-url>
cd Fraud-detection
cp .env.example .env
```

### 2. Build and Launch
```bash
docker-compose up --build
```

### 3. Access the Services
- **Web UI**: [http://localhost](http://localhost) (Served via Nginx)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **MLflow Tracking**: [http://localhost:5000](http://localhost:5000)
- **Prometheus Metrics**: `http://localhost/metrics`

##  Architecture

- **Frontend**: React/Vite + Tailwind CSS + Framer Motion (Cyberpunk UI)
- **Backend API**: FastAPI (Python 3.11)
- **Inference**: PyTorch Geometric (GraphSAGE Model)
- **Infrastructure**: Redis (Cache), MLflow (Model Registry), Nginx (Reverse Proxy)

##  Configuration

Edit the `.env` file to customize:
- `MODEL_PATH`: Location of the trained GNN model.
- `GRAPH_PATH`: Path to the PaySim graph dataset.
- `REDIS_URL`: Connection string for the Redis instance.

---
*Developed as a high-performance distributed AI microservice.*
