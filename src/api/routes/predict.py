from fastapi import APIRouter, Request, HTTPException
from typing import List, Dict
from src.api.schemas import TransactionRequest, FraudPredictionResponse, BatchPredictionRequest
import random
from datetime import datetime

router = APIRouter()

# In-memory history of last 100 predictions
PREDICTION_HISTORY = []

@router.post("/predict", response_model=FraudPredictionResponse)
async def predict_single(request: Request, transaction: TransactionRequest):
    """
    Predict fraud for a single transaction.
    """
    predictor = request.app.state.predictor
    try:
        # Convert Request model to dict for predictor
        data = transaction.model_dump()
        result = predictor.predict(data)
        
        # Add to history
        entry = result.copy()
        entry["timestamp"] = datetime.now()
        PREDICTION_HISTORY.append(entry)
        if len(PREDICTION_HISTORY) > 100:
            PREDICTION_HISTORY.pop(0)
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/batch", response_model=List[FraudPredictionResponse])
async def predict_batch(request: Request, body: BatchPredictionRequest):
    """
    Predict fraud for a batch of transactions (up to 1000).
    """
    predictor = request.app.state.predictor
    try:
        transactions_dict = [t.model_dump() for t in body.transactions]
        results = predictor.batch_predict(transactions_dict)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict/history", response_model=List[Dict])
async def get_prediction_history():
    """
    Get the last 100 predictions with timestamps.
    """
    return list(reversed(PREDICTION_HISTORY))

@router.post("/predict/simulate")
async def simulate_stream(request: Request):
    """
    Simulate a live transaction stream for demonstration purposes.
    """
    # This would trigger a background task to start sending WS messages
    # For now, just return a confirmation
    return {"status": "Simulation started", "message": "Synthetic transactions are being broadcast to /ws/live-feed"}
