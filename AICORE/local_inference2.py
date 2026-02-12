import torch

import random

import requests

import itertools


from torch_geometric.data import Data

from torch_geometric.loader import DataLoader

import torch.nn.functional as F

from torch.nn import Linear



# --- Data Loading and Graph Building Functions (from earlier cells) ---

def load_match_data(match_id):

    events_url = f"https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/{match_id}.json"

    three_sixty_url = f"https://raw.githubusercontent.com/statsbomb/open-data/master/data/three-sixty/{match_id}.json"



    try:

        events_response = requests.get(events_url)

        events_response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

        events = events_response.json()



        frames_response = requests.get(three_sixty_url)

        frames_response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)

        frames = frames_response.json()



        return events, frames

    except requests.exceptions.RequestException as e:

        print(f"Error fetching data for match {match_id}: {e}")

        if 'events_response' in locals() and events_response.text:

            print(f"Events response content: {events_response.text[:200]}...")

        if 'frames_response' in locals() and frames_response.text:

            print(f"Frames response content: {frames_response.text[:200]}...")

        return None, None

    except requests.exceptions.JSONDecodeError as e:

        print(f"JSONDecodeError for match {match_id}: {e}")

        if 'events_response' in locals() and events_response.text:

            print(f"Events raw response: {events_response.text[:200]}...")

        if 'frames_response' in locals() and frames_response.text:

            print(f"Frames raw response: {frames_response.text[:200]}...")

        return None, None



def extract_valid_events(events):

    valid = []



    for event in events:

        if event["type"]["name"] in ["Pass", "Shot"]:

            valid.append(event)



    return valid



def get_freeze_frame(event_id, frames):

    for frame in frames:

        if frame["event_uuid"] == event_id:

            return frame["freeze_frame"]

    return None



def build_graph(freeze_frame, label):



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

        distance = torch.sqrt(torch.tensor((x - opponent_goal_x)**2 + (y - opponent_goal_y)**2)) if x is not None and y is not None else torch.tensor(0.0) # Handle potential None

        distances_to_goal.append(distance / torch.sqrt(torch.tensor(120**2 + 80**2))) # Normalize distance



    # Ensure positions and distances_to_goal are not empty to avoid errors

    if not positions:

        return None # Or handle this case as appropriate, e.g., raise an error



    x = torch.tensor(

        [[pos[0], pos[1], teams[i], distances_to_goal[i]] for i, pos in enumerate(positions)],

        dtype=torch.float

    )



    edge_index = torch.tensor(

        list(itertools.permutations(range(len(positions)), 2)),

        dtype=torch.long

    ).t().contiguous()



    graph = Data(x=x, edge_index=edge_index)

    graph.y = torch.tensor([label], dtype=torch.float)



    return graph



# --- Re-initialize all necessary components ---

# Data generation from earlier successful cells

match_ids = [

    3788741, 3788742, 3788743, 3788744, 3788745,

    3788746, 3788747, 3788748, 3788749, 3788750,

    3788751, 3788752, 3788753, 3788754, 3788755

]

dataset = []



print("Starting data generation...")

for match_id in match_ids:

    print(f"Processing match {match_id}")

    events, frames = load_match_data(match_id)

    if events is None or frames is None:

        print(f"Skipping match {match_id} due to data loading error.")

        continue

    events = extract_valid_events(events)

    for event in events:

        freeze = get_freeze_frame(event["id"], frames)

        if freeze is None:

            continue

        label = 1 if event["type"]["name"] == "Shot" else 0

        graph = build_graph(freeze, label)

        if graph is not None:

            dataset.append(graph)

print("Total graph samples:", len(dataset))





# Shuffle dataset

random.shuffle(dataset)



# Split 80% train, 20% test

split_idx = int(0.8 * len(dataset))

train_dataset = dataset[:split_idx]

test_dataset = dataset[split_idx:]



print("Train samples:", len(train_dataset))

print("Test samples:", len(test_dataset))



# Re-define device

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")



# Re-calculate pos_weight for robustness

num_shots = sum(1 for graph in train_dataset if graph.y.item() == 1)

num_passes = sum(1 for graph in train_dataset if graph.y.item() == 0)

pos_weight = num_passes / num_shots if num_shots > 0 else 1.0 # Avoid division by zero

pos_weight_tensor = torch.tensor([pos_weight], dtype=torch.float).to(device)



# Re-define criterion with weighted BCEWithLogitsLoss

criterion = torch.nn.BCEWithLogitsLoss(pos_weight=pos_weight_tensor)



# Re-define GNNModel (ensure this matches the architecture used for training)

class GNNModel(torch.nn.Module):

    def __init__(self, input_dim=4, hidden_dim=64):

        super(GNNModel, self).__init__()

        self.gat1 = GATConv(input_dim, hidden_dim, heads=4)

        self.gat2 = GATConv(hidden_dim * 4, hidden_dim)

        self.fc = Linear(hidden_dim, 1)



    def forward(self, data):

        x, edge_index, batch = data.x, data.edge_index, data.batch

        x = F.relu(self.gat1(x, edge_index))

        x = F.relu(self.gat2(x, edge_index))

        x = global_mean_pool(x, batch)

        x = self.fc(x)

        return x



# Re-initialize the model and optimizer

model = GNNModel().to(device)

# Load the trained weights from 'model.pth'

try:

    model.load_state_dict(torch.load("model.pth", map_location=device))

    print("Model weights loaded successfully from model.pth")

except FileNotFoundError:

    print("model.pth not found. The model will run with randomly initialized weights. Please ensure model.pth is available or train the model first.")

except Exception as e:

    print(f"Error loading model weights: {e}")



optimizer = torch.optim.Adam(model.parameters(), lr=0.001)



# Re-initialize DataLoader

train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)

test_loader = DataLoader(test_dataset, batch_size=16)



# Re-define evaluation function

def evaluate(loader):

    model.eval()

    correct = 0

    total = 0



    with torch.no_grad():

        for batch in loader:

            batch = batch.to(device)

            output = model(batch)

            probs = torch.sigmoid(output)

            preds = (probs > 0.5).float()



            correct += (preds == batch.y.unsqueeze(1)).sum().item()

            total += batch.y.size(0)



    return correct / total



print("All necessary components re-initialized.")



# --- Now proceed with the user's request for multiple samples ---

print("\nPredictions for the first 20 samples from the test dataset:")



model.eval() # Set model to evaluation mode



# Loop through the first 20 samples or fewer if test_dataset is smaller

for i in range(min(50, len(test_dataset))):

    sample = test_dataset[i].to(device)



    with torch.no_grad():

        raw_logits = model(sample)

        shot_probability = torch.sigmoid(raw_logits)



    print(f"Sample {i:<2}: Predicted Shot Probability: {shot_probability.item():.4f}, True Label: {sample.y.item()}")