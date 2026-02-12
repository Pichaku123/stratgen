from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from gnn_model import GNNModel
import itertools

app = FastAPI()

# Enable CORS for frontend
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Model ---
MODEL_PATH = "model.pth"
try:
    # Initialize model with 4 input features: [x, y, is_attacker, distance_to_goal]
    model = GNNModel(input_dim=4, hidden_dim=64)
    # Load weights (map to CPU)
    # strict=False allows loading if there are minor mismatches, but user said they uploaded new model.pth compatible with 4 dims.
    state_dict = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()
    print("✅ Real GNN Model (4-Feature) Loaded Successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("Attempting to load with weights_only=False (for older PyTorch versions or complex objects)...")
    try:
         state_dict = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
         model.load_state_dict(state_dict)
         model.eval()
         print("✅ Real GNN Model (4-Feature) Loaded Successfully (weights_only=False)")
    except Exception as e2:
        print(f"❌ Critical Error loading model: {e2}")
        model = None

# --- Pydantic Models (based on frontend payload) ---

class Position(BaseModel):
    x: float
    y: float

class Features(BaseModel):
    # Flexible features from frontend, we extract what we need
    player_id: Optional[int] = None
    role_id: Optional[int] = None # Not used in model anymore
    jersey: Optional[str] = None
    marking_intensity: Optional[float] = None
    is_keeper: Optional[bool] = None
    pressure_applied: Optional[float] = None

class GraphNode(BaseModel):
    id: str
    type: str # "attacker" or "defender"
    is_actor: bool
    position: Position
    features: Features

class UserModifications(BaseModel):
    dragged_nodes: List[str]
    target_zone: Dict[str, float] = {}

class TacticalContext(BaseModel):
    formation: str
    possession_phase: str

class Metadata(BaseModel):
    session_id: str
    pitch_length: float
    pitch_width: float
    set_piece_type: str
    attacking_team_id: int

class FormationPayload(BaseModel):
    metadata: Metadata
    tactical_context: TacticalContext
    graph_nodes: List[GraphNode]
    user_modifications: UserModifications

# --- Helper Functions ---

def normalize(value, max_val):
    return value / max_val if max_val > 0 else 0

def create_fully_connected_edges(num_nodes):
    # Permutations of all nodes (fully connected, no self-loops)
    return torch.tensor(
        list(itertools.permutations(range(num_nodes), 2)),
        dtype=torch.long
    ).t().contiguous()

# --- Routes ---

@app.get("/")
def read_root():
    return {"message": "StratGen AI Core is running with Real GNN Model (4 Features)"}

@app.post("/evaluate-formation")
def evaluate_formation(payload: FormationPayload):
    print(f"Received payload with {len(payload.graph_nodes)} players.")
    for i, node in enumerate(payload.graph_nodes):
        print(f"  Node {i}: {node.type} at ({node.position.x}, {node.position.y})")
    
    if model is None:
        return {"score": 0.5, "message": "Model not loaded.", "details": "Error loading model.pth"}

    # 1. Prepare Data for Model
    # Features: [norm_x, norm_y, is_attacker, norm_distance_to_goal]
    
    node_features = []
    
    # Pitch Dimensions (Standard 120x80)
    MAX_X = payload.metadata.pitch_length or 120.0
    MAX_Y = payload.metadata.pitch_width or 80.0
    PITCH_DIAGONAL = (MAX_X**2 + MAX_Y**2)**0.5
    
    for node in payload.graph_nodes:
        # 1. Normalize Position
        norm_x = normalize(node.position.x, MAX_X)
        norm_y = normalize(node.position.y, MAX_Y)
        
        # 2. is_attacker
        is_attacker_bool = (node.type == "attacker")
        is_attacker_val = 1.0 if is_attacker_bool else 0.0
        
        # 3. distance_to_goal
        # MATCHING LOCAL_INFERENCE.PY: Always calculate distance to (120, 40)
        target_goal = (120.0, 40.0)
            
        # Euclidean distance
        dx = node.position.x - target_goal[0]
        dy = node.position.y - target_goal[1]
        dist = (dx**2 + dy**2)**0.5
        
        # Normalize distance
        norm_dist = dist / PITCH_DIAGONAL
        
        node_features.append([norm_x, norm_y, is_attacker_val, norm_dist])
        
    x = torch.tensor(node_features, dtype=torch.float)
    
    # 2. Create Edges
    # Fully connected graph
    num_nodes = len(node_features)
    if num_nodes > 1:
        # Match local_inference2.py permutation logic
        edge_index = torch.tensor(
            list(itertools.permutations(range(num_nodes), 2)),
            dtype=torch.long
        ).t().contiguous()
    else:
        # Handle single node case or empty
        edge_index = torch.empty((2, 0), dtype=torch.long)
    
    # Batch vector (all nodes belong to graph 0)
    batch = torch.zeros(num_nodes, dtype=torch.long)
    
    data = Data(x=x, edge_index=edge_index, batch=batch)
    
    # 3. Run Inference
    try:
        with torch.no_grad():
            logits = model(data)
            # Apply Sigmoid to get probability (0-1)
            score = torch.sigmoid(logits).item()
            print(f"Model Prediction (Logit: {logits.item():.2f}): {score:.4f}")
            
        return {
            "score": score,
            "message": "Evaluation successful (Real Model 4-Feat)",
            "details": f"Processed {num_nodes} nodes."
        }
        
    except Exception as e:
        print(f"Inference Error: {e}")
        return {
            "score": 0.0,
            "message": "Inference Error",
            "details": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
