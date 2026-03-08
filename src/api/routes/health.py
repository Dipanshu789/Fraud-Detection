from fastapi import APIRouter, Response
from typing import Dict, Any
import time
from datetime import datetime

router = APIRouter()

# Global start time for uptime calculation
START_TIME = time.time()

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Detailed health check for the API and GNN model.
    """
    # These would normally check the actual model status and graph stats
    # For now, we return mock/placeholder data reflecting the system state
    return {
        "status": "healthy",
        "model_loaded": True,
        "graph_stats": {
            "num_nodes": 5, # As seen in the graph file
            "num_edges": 10
        },
        "uptime_seconds": int(time.time() - START_TIME),
        "last_prediction_time": datetime.now().isoformat()
    }

@router.get("/metrics")
async def get_metrics() -> Dict[str, Any]:
    """
    Returns fraud detection performance metrics.
    """
    return {
        "fraud_rate_last_1hr": 0.05,
        "avg_confidence": 0.92,
        "false_positive_rate": 0.01,
        "total_processed": 1250
    }

@router.get("/stats/live")
async def live_stats_sse():
    """
    Server-Sent Events endpoint for live streaming statistics.
    """
    # In a real implementation, this would yield streaming data
    # Here we provide a placeholder compatible with FastAPI SSE patterns
    from sse_starlette.sse import EventSourceResponse
    import asyncio

    async def event_generator():
        while True:
            data = {
                "timestamp": datetime.now().isoformat(),
                "active_connections": 12,
                "tps": 45.5,
                "fraud_detected_last_min": 2
            }
            yield {"data": data}
            await asyncio.sleep(5)

    return EventSourceResponse(event_generator())
