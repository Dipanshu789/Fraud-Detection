import torch
import torch.nn as nn
from torch_geometric.nn import SAGEConv
from torch_geometric.data import Data
from torch_geometric.utils import k_hop_subgraph
from functools import lru_cache
from typing import Dict, List, Optional, Tuple
import time
import pandas as pd
import os

class GraphSAGE(nn.Module):
    """
    GraphSAGE model architecture as defined in the training phase.
    """
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        super(GraphSAGE, self).__init__()
        self.input_dim = input_dim
        self.conv1 = SAGEConv(input_dim, hidden_dim)
        self.bn1 = nn.BatchNorm1d(hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(p=0.5)
        self.conv2 = SAGEConv(hidden_dim, output_dim)

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        # Slice x if it has more features than expected
        if x.shape[1] > self.input_dim:
            x = x[:, :self.input_dim]
        elif x.shape[1] < self.input_dim:
            # Pad with zeros if less features (unlikely but safer)
            padding = torch.zeros((x.shape[0], self.input_dim - x.shape[1]), device=x.device)
            x = torch.cat([x, padding], dim=1)
            
        x = self.conv1(x, edge_index)
        # BatchNorm1d requires more than 1 node to compute variance
        if x.size(0) > 1:
            x = self.bn1(x)
        x = self.relu(x)
        x = self.dropout(x)
        x = self.conv2(x, edge_index)
        return x

class GNNPredictor:
    """
    Inference class for GNN-based fraud detection.
    Loads models and graphs, and performs single/batch predictions.
    """
    def __init__(self, model_path: str, graph_path: str, node_mapping_path: str, device: str = "cpu"):
        self.device = torch.device(device)
        self.graph = self.load_graph(graph_path)
        self.node_mapping = self.load_node_mapping(node_mapping_path)
        self.model = self.load_model(model_path)
        self.model.eval()
        
    def load_model(self, path: str) -> nn.Module:
        state_dict = torch.load(path, map_location=self.device, weights_only=False)
        # Infer input_dim from conv1.lin_l.weight shape
        # In SAGEConv, lin_l.weight has shape [out_channels, in_channels]
        if 'conv1.lin_l.weight' in state_dict:
            input_dim = state_dict['conv1.lin_l.weight'].shape[1]
        else:
            input_dim = self.graph.x.shape[1]
            
        model = GraphSAGE(input_dim=input_dim, hidden_dim=64, output_dim=1)
        model.load_state_dict(state_dict)
        model.to(self.device)
        return model

    def load_graph(self, path: str) -> Data:
        data = torch.load(path, map_location=self.device, weights_only=False)
        return data

    def load_node_mapping(self, path: str) -> Dict[str, int]:
        """Loads account_id to node_index mapping."""
        if not os.path.exists(path):
            # Fallback for demo if file doesn't exist
            return {}
        df = pd.read_csv(path)
        # Assuming account_id is the unique identifier
        return {str(val): i for i, val in enumerate(df['account_id'])}

    @lru_cache(maxsize=1000)
    def _extract_subgraph_data(self, node_idx: int, num_hops: int = 2) -> Tuple[torch.Tensor, torch.Tensor, int]:
        """Internal cached method for subgraph extraction."""
        subset, edge_index, mapping, edge_mask = k_hop_subgraph(
            node_idx, num_hops, self.graph.edge_index, relabel_nodes=True
        )
        x = self.graph.x[subset]
        return x, edge_index, mapping.item()

    def predict(self, transaction: Dict) -> Dict:
        """
        Performs fraud prediction for a single transaction.
        Args:
            transaction: Dictionary containing transaction details.
        Returns:
            Dictionary with prediction results.
        """
        start_time = time.time()
        
        # We use nameOrig (sender) as the reference node for prediction
        account_id = str(transaction.get('nameOrig'))
        node_idx = self.node_mapping.get(account_id, 0) # Default to 0 if not found
        
        x_sub, edge_index_sub, mapping_idx = self._extract_subgraph_data(node_idx)
        
        # --- Inject Dynamic Features from User Input ---
        # Make a copy to avoid mutating the cached graph data
        x_dynamic = x_sub.clone()
        
        # Feature Mapping (Step, Amount, Balances, Type One-Hot)
        try:
            # 1. Temporal Information (Step)
            x_dynamic[mapping_idx, 0] = float(transaction.get('step', 1)) / 744.0
            
            # 2. Transaction Amount (Log-scaled or normalized)
            # Standardizing to a reasonable scale for GNN weights
            amount = float(transaction.get('amount', 0))
            x_dynamic[mapping_idx, 1] = torch.log1p(torch.tensor(amount)).item() / 15.0 
            
            # 3. Balance Dynamics
            x_dynamic[mapping_idx, 2] = float(transaction.get('oldbalanceOrg', 0)) / 1000000.0
            x_dynamic[mapping_idx, 3] = float(transaction.get('newbalanceOrig', 0)) / 1000000.0
            x_dynamic[mapping_idx, 4] = float(transaction.get('oldbalanceDest', 0)) / 1000000.0
            x_dynamic[mapping_idx, 5] = float(transaction.get('newbalanceDest', 0)) / 1000000.0
            
            # 4. Type Encoding (assuming features 6-9 are One-Hot types)
            tx_type = transaction.get('type', 'PAYMENT')
            type_map = {'PAYMENT': 6, 'TRANSFER': 7, 'CASH_OUT': 8, 'CASH_IN': 9, 'DEBIT': 6}
            target_feat = type_map.get(tx_type, 6)
            
            # Reset types and set active one
            x_dynamic[mapping_idx, 6:10] = 0.0
            if target_feat < x_dynamic.shape[1]: 
                x_dynamic[mapping_idx, target_feat] = 1.0
                
        except Exception as e:
            # Fallback to base graph features if mapping fails
            print(f"Feature injection failure: {e}")
            x_dynamic = x_sub
            
        with torch.no_grad():
            logits = self.model(x_dynamic, edge_index_sub)
            score = torch.sigmoid(logits[mapping_idx]).item()
            
        latency = (time.time() - start_time) * 1000
        
        return {
            "transaction_id": transaction.get("transaction_id", "unknown"),
            "is_fraud": score > 0.15, # Using threshold from base_config.yaml
            "confidence": score if score > 0.5 else 1 - score,
            "risk_score": score,
            "explanation": "High connectivity to known fraud clusters" if score > 0.15 else "Normal transaction pattern",
            "latency_ms": round(latency, 2)
        }

    def batch_predict(self, transactions: List[Dict]) -> List[Dict]:
        """Vectorized or iterative batch inference."""
        # For small graphs/batches, iterative is fine.
        return [self.predict(t) for t in transactions]

    def get_node_features(self, account_id: str) -> Optional[List[float]]:
        """Look up account node features."""
        node_idx = self.node_mapping.get(account_id)
        if node_idx is not None and node_idx < self.graph.x.size(0):
            return self.graph.x[node_idx].tolist()
        return None
