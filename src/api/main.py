import os
import asyncio
import json
import time
from datetime import datetime
from typing import Set, Dict
from contextlib import asynccontextmanager

import torch
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app, Counter, Histogram

from src.api.routes import predict, explain, health
from src.inference.predictor import GNNPredictor
from src.api.middleware import AuthMiddleware, RateLimitMiddleware, LoggingMiddleware

# --- Lifespan Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load GNN model and graph into memory on startup.
    Start background tasks.
    """
    model_path = os.getenv("MODEL_PATH", "src/models/checkpoints/GraphSAGE_best_model.pt")
    graph_path = os.getenv("GRAPH_PATH", "Data/graphs/paysim/paysim_full_graph.pt")
    node_mapping_path = os.getenv("NODE_MAPPING_PATH", "Data/processed/nodes_accounts.csv")
    
    # Fallback to general best_model.pt
    if not os.path.exists(model_path):
        model_path = "src/models/checkpoints/best_model.pt"

    print(f"Loading GNN Model from {model_path}...")
    try:
        app.state.predictor = GNNPredictor(
            model_path=model_path,
            graph_path=graph_path,
            node_mapping_path=node_mapping_path,
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
        print("Model and Graph loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
    
    # Start live feed simulation
    sim_task = asyncio.create_task(simulate_live_feed())
    
    yield
    
    # Shutdown
    sim_task.cancel()
    print("Shutting down live feed simulation...")

# --- FastAPI App Initialization ---
app = FastAPI(
    title="SentinelFlow GNN Fraud Detection API",
    description="Production-grade API for distributed financial fraud detection using Graph Neural Networks.",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan
)

# --- Middleware & Metrics ---
app.add_middleware(LoggingMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus Metrics
from prometheus_client import REGISTRY

def get_or_create_counter(name, documentation, labelnames):
    if name in REGISTRY._names_to_collectors:
        return REGISTRY._names_to_collectors[name]
    return Counter(name, documentation, labelnames)

def get_or_create_histogram(name, documentation):
    if name in REGISTRY._names_to_collectors:
        return REGISTRY._names_to_collectors[name]
    return Histogram(name, documentation)

FRAUD_PREDICTIONS = get_or_create_counter("fraud_predictions_total", "Total fraud predictions", ["is_fraud"])
PREDICTION_LATENCY = get_or_create_histogram("prediction_latency_ms", "Latency of fraud predictions in ms")

# Mount prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics_internal", metrics_app) # Internal prometheus endpoint

# --- Routes ---
app.include_router(predict.router, prefix="/api/v1/predict", tags=["Prediction"])
app.include_router(explain.router, prefix="/api/v1/explain", tags=["Explainability"])
app.include_router(health.router, prefix="/api/v1/health", tags=["Health"])

# --- WebSocket: Live Transaction Feed ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

manager = ConnectionManager()

@app.websocket("/ws/live-feed")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Maintain connection
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# --- Live Feed Simulation ---
async def simulate_live_feed():
    """
    Background task to simulate a live transaction stream.
    Broadcasting a message every 500ms to all connected clients.
    """
    print("Live feed simulation task started.")
    types = ["PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"]
    
    while True:
        try:
            if manager.active_connections:
                # Generate synthetic transaction
                tx_id = f"tx_{int(time.time() * 1000)}"
                amount = 10.0 + (torch.rand(1).item() * 5000)
                tx_type = types[int(torch.rand(1).item() * len(types))]
                is_fraud = torch.rand(1).item() < 0.05
                confidence = 0.85 + (0.14 * (torch.rand(1).item()))
                
                payload = {
                    "timestamp": datetime.now().isoformat(),
                    "tx_id": tx_id,
                    "amount": round(amount, 2),
                    "type": tx_type,
                    "sender": f"C{int(torch.rand(1).item()*10000)}",
                    "receiver": f"M{int(torch.rand(1).item()*10000)}",
                    "is_fraud": is_fraud,
                    "confidence": round(confidence, 4),
                    "processing_time_ms": round(15.0 + (5.0 * torch.rand(1).item()), 2)
                }
                
                await manager.broadcast(json.dumps(payload))
                
                # Record metrics
                FRAUD_PREDICTIONS.labels(is_fraud=str(is_fraud)).inc()
                PREDICTION_LATENCY.observe(payload["processing_time_ms"])
                
            await asyncio.sleep(0.5)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in simulation: {e}")
            await asyncio.sleep(1)

if __name__ == "__main__":
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True)
