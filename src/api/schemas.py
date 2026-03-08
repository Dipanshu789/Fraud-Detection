from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class TransactionRequest(BaseModel):
    nameOrig: str = Field(..., description="Originator account name")
    nameDest: str = Field(..., description="Destination account name")
    amount: float = Field(..., description="Transaction amount")
    type: str = Field(..., description="Transaction type (e.g., PAYMENT, TRANSFER, CASH_OUT)")
    step: int = Field(..., description="Time step of the transaction")
    oldbalanceOrg: float = Field(..., description="Initial balance of originator")
    newbalanceOrig: float = Field(..., description="New balance of originator")
    oldbalanceDest: float = Field(..., description="Initial balance of destination")
    newbalanceDest: float = Field(..., description="New balance of destination")

class FraudPredictionResponse(BaseModel):
    transaction_id: str
    is_fraud: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    risk_score: float
    explanation: Optional[str] = None
    subgraph_data: Optional[Dict] = None
    latency_ms: float

class BatchPredictionRequest(BaseModel):
    transactions: List[TransactionRequest] = Field(..., max_length=1000)

class LiveFeedMessage(BaseModel):
    timestamp: datetime
    transaction_id: str
    amount: float
    is_fraud: bool
    confidence: float
    type: str
    sender: str
    receiver: str
    processing_time_ms: float
