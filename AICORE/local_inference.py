import torch
import itertools
from torch_geometric.data import Data
from gnn_model import GNNModel # Import the GNNModel from the local file

# Define the build_graph function, including 'distance_to_goal' feature
def build_graph(freeze_frame, label=None):
    positions = []
    teams = []
    distances_to_goal = []

    # Assuming standard pitch dimensions 120x80
    # And attacking team is trying to score on the right goal
    opponent_goal_x = 120
    opponent_goal_y = 40

    for player in freeze_frame:
        x, y = player["location"]

        # Normalize positions
        normalized_x = x/120
        normalized_y = y/80
        positions.append([normalized_x, normalized_y])

        # is_attacker (1 for teammate, 0 for opponent)
        is_attacker = 1 if player["teammate"] else 0
        teams.append(is_attacker)

        # Calculate distance to opponent's goal
        distance = torch.sqrt(torch.tensor((x - opponent_goal_x)**2 + (y - opponent_goal_y)**2))
        distances_to_goal.append(distance / torch.sqrt(torch.tensor(120**2 + 80**2))) # Normalize distance

    x = torch.tensor(
        [[pos[0], pos[1], teams[i], distances_to_goal[i]] for i, pos in enumerate(positions)],
        dtype=torch.float
    )

    edge_index = torch.tensor(
        list(itertools.permutations(range(len(positions)), 2)),
        dtype=torch.long
    ).t().contiguous()

    graph = Data(x=x, edge_index=edge_index)
    if label is not None:
        graph.y = torch.tensor([label], dtype=torch.float)

    return graph

def get_user_freeze_frame():
    print("\nEnter player data. Type 'done' when finished.")
    print("Format: x,y,is_teammate (e.g., 100,40,True)")

    user_freeze_frame = []
    player_count = 0

    while True:
        user_input = input(f"Player {player_count + 1} (x,y,is_teammate or 'done'): ").strip().lower()
        if user_input == 'done':
            break

        try:
            parts = user_input.split(',')
            if len(parts) != 3:
                raise ValueError("Incorrect format. Please use x,y,is_teammate.")

            x = float(parts[0])
            y = float(parts[1])
            is_teammate = parts[2].lower() == 'true'

            # Validate coordinates are within pitch dimensions (0-120, 0-80)
            if not (0 <= x <= 120 and 0 <= y <= 80):
                print("Warning: Player coordinates are outside standard pitch dimensions (0-120x0-80).")

            user_freeze_frame.append({"location": [x, y], "teammate": is_teammate})
            player_count += 1
        except ValueError as e:
            print(f"Invalid input: {e}. Please try again.")
        except Exception as e:
            print(f"An unexpected error occurred: {e}. Please try again.")

    if not user_freeze_frame:
        print("No player data entered. Using a default sample freeze frame for demonstration.")
        return [
            {"location": [100, 40], "teammate": True},
            {"location": [90, 30], "teammate": True},
            {"location": [110, 42], "teammate": False},
            {"location": [105, 35], "teammate": False},
        ]
    return user_freeze_frame


# Initialize device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the model
model = GNNModel().to(device)
model.load_state_dict(torch.load("model.pth", map_location=device))
model.eval() # Set model to evaluation mode

print(f"Model loaded successfully on {device}.")

### Implement User Input Handling (Example)
# Get user input for freeze frame
user_generated_freeze_frame = get_user_freeze_frame()

print("\nProcessing user-generated freeze frame:")
for player in user_generated_freeze_frame:
    team_status = "Attacker" if player["teammate"] else "Defender"
    print(f"  - {team_status} at X:{player['location'][0]:<5} Y:{player['location'][1]:<5}")

# Build the graph from the freeze frame
graph_data = build_graph(user_generated_freeze_frame)
graph_data = graph_data.to(device)

print(f"\nGenerated graph with {graph_data.num_nodes} nodes and {graph_data.num_edges} edges.")
print(f"Node features (first 5 nodes):\n{graph_data.x[:5] if graph_data.num_nodes > 0 else 'No nodes'}") # [normalized_x, normalized_y, is_attacker, normalized_distance_to_goal]

### Make Predictions
with torch.no_grad():
    # Model outputs logits, apply sigmoid to get probability
    raw_output_logits = model(graph_data)
    shot_probability = torch.sigmoid(raw_output_logits).item()

print(f"\nPredicted Shot Probability: {shot_probability:.4f}")

# Interpretation:
if shot_probability > 0.5:
    print("Interpretation: The model predicts a shot is more likely to occur.")
elif shot_probability < 0.5:
    print("Interpretation: The model predicts a pass is more likely to occur.")
else:
    print("Interpretation: The model is uncertain (probability is 0.5).")
