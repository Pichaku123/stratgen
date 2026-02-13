from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from gnn_model import GNNModel
from cvae_inference import CVAE, generate_optimal_attacker_positions, attacker_dim, defender_dim
import itertools
import os # Ensure os is imported for path handling

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

# --- Load CVAE Model ---
CVAE_MODEL_PATH = "cvae_model.pth"
try:
    cvae_model = CVAE(attacker_dim, defender_dim)
    # Load weights (map to CPU)
    # Using weights_only=True for safety as per new Pytorch defaults, matching cvae_inference.py
    if os.path.exists(CVAE_MODEL_PATH):
        cvae_state = torch.load(CVAE_MODEL_PATH, map_location=torch.device('cpu'), weights_only=True)
        cvae_model.load_state_dict(cvae_state)
        cvae_model.eval()
        print("✅ CVAE Model Loaded Successfully")
    else:
        print(f"⚠️ CVAE model file not found at {CVAE_MODEL_PATH}")
        cvae_model = None
except Exception as e:
    print(f"❌ Error loading CVAE model: {e}")
    cvae_model = None

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
            # Model now applies Sigmoid internally, so output is already probability (0-1)
            probability = model(data)
            score = probability.item()
            print(f"Model Prediction (Probability): {score:.4f}")
            
    except Exception as e:
        print(f"Inference Error: {e}")
        return {
            "score": 0.0,
            "message": "Inference Error",
            "details": str(e)
        }
    
    # 4. Run CVAE Inference (Target Functionality)
    optimal_placements = []
    if cvae_model:
        try:
             # Prepare data list for CVAE: needs [{'x':, 'y':, 'is_attacker':, 'distance_to_goal':}]
             # We already calculated normalized features, but cvae_inference expects raw-ish dictionaries 
             # (actually it processes them again in process_player_data_for_cvae).
             # Let's reconstruct the list expected by generate_optimal_attacker_positions
             
             cvae_input_data = []
             for node in payload.graph_nodes:
                 # Check if we need to pass normalized or raw. 
                 # cvae_inference.process_player_data_for_cvae does: x / pitch_width. 
                 # So we should pass RAW coordinates.
                 
                 is_attacker = (node.type == "attacker")
                 
                 # Calculate raw distance for consistency (though inference might recalculate or not use it directly if not in tensor)
                 # Inspecting process_player_data_for_cvae in cvae_inference.py:
                 # It reads 'x', 'y', 'is_attacker'. It does NOT seem to read 'distance_to_goal' explicitly 
                 # for the tensor construction (it calculates it? No, looking at file content step 602...)
                 # user's cvae_inference.py loop (lines 79-92) ONLY uses x, y, is_attacker.
                 # So drag distance is irrelevant for the CVAE tensor construction defined there.
                 
                 cvae_input_data.append({
                     'x': node.position.x,
                     'y': node.position.y,
                     'is_attacker': is_attacker,
                     'distance_to_goal': 0 # Placeholder, not used by current CVAE processor
                 })
             
             raw_placements = generate_optimal_attacker_positions(cvae_input_data, cvae_model)
             print(f"DEBUG: Raw placements from CVAE: {raw_placements}")
             
             # Extract IDs of attackers to map back to response
             attacker_ids = [node.id for node in payload.graph_nodes if node.type == "attacker"]
             print(f"DEBUG: Found {len(attacker_ids)} attackers in payload: {attacker_ids}")

             # Convert numpy types/lists to Python dicts with IDs
             optimal_placements = []
             # Safely zip; if model output count differs (shouldn't if logic holds), we truncate
             for pid, p in zip(attacker_ids, raw_placements):
                 print(f"DEBUG: Mapping {pid} to {p}")
                 optimal_placements.append({
                     'id': pid, # The ID sent from frontend (e.g. "p_123")
                     'x': float(p['x']),
                     'y': float(p['y'])
                 })
             print(f"Generated {len(optimal_placements)} optimal ghost positions mapped to players.")
             
        except Exception as e:
             print(f"CVAE Inference Error: {e}")
             # proper error handling: don't crash main response
             
    return {
        "score": score,
        "optimal_placements": optimal_placements,
        "message": "Evaluation successful",
        "details": f"Processed {num_nodes} nodes. Generated {len(optimal_placements)} ghost hints."
    }
        


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
