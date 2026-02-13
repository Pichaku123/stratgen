import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

# Global variables from training
max_attacker_dim = 20
max_defender_dim = 22
attacker_dim = max_attacker_dim # Alias for clarity
defender_dim = max_defender_dim # Alias for clarity
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class CVAE(nn.Module):
    def __init__(self, attacker_dim, defender_dim, latent_dim=16):
        super(CVAE, self).__init__()

        input_dim = attacker_dim + defender_dim

        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU()
        )

        self.mu = nn.Linear(64, latent_dim)
        self.logvar = nn.Linear(64, latent_dim)

        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim + defender_dim, 64),
            nn.ReLU(),
            nn.Linear(64, attacker_dim)
        )

    def reparameterize(self, mu, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def forward(self, attackers, defenders):
        x = torch.cat([attackers, defenders], dim=1)

        h = self.encoder(x)
        mu = self.mu(h)
        logvar = self.logvar(h)

        z = self.reparameterize(mu, logvar)

        z_cond = torch.cat([z, defenders], dim=1)
        recon_attackers = self.decoder(z_cond)

        return recon_attackers, mu, logvar

def process_player_data_for_cvae(player_data_list):
    """
    Processes a list of player dictionaries for CVAE input.
    Separates players into attackers and defenders, normalizes coordinates,
    pads them to CVAE training dimensions, and reshapes for model compatibility.

    Args:
        player_data_list (list): A list of dictionaries, where each dictionary
                                 represents a player with 'x', 'y', 'is_attacker',
                                 and 'distance_to_goal' keys.

    Returns:
        tuple: A tuple containing two torch.Tensor objects:
               - padded_attackers_tensor: (1, max_attacker_dim) tensor of attacker positions.
               - padded_defenders_tensor: (1, max_defender_dim) tensor of defender positions.
    """
    attacker_coords_normalized = []
    defender_coords_normalized = []

    # Assuming standard pitch dimensions 120x80
    pitch_width = 120.0
    pitch_height = 80.0

    for player_data in player_data_list:
        x = player_data['x']
        y = player_data['y']

        normalized_x = x / pitch_width
        normalized_y = y / pitch_height

        if player_data['is_attacker']:
            attacker_coords_normalized.append(normalized_x)
            attacker_coords_normalized.append(normalized_y)
        else:
            defender_coords_normalized.append(normalized_x)
            defender_coords_normalized.append(normalized_y)

    # Convert lists to tensors
    attackers = torch.tensor(attacker_coords_normalized, dtype=torch.float)
    defenders = torch.tensor(defender_coords_normalized, dtype=torch.float)

    # Pad or Truncate attackers to max_attacker_dim
    current_attacker_dim = attackers.shape[0]
    if current_attacker_dim < max_attacker_dim:
        padding = torch.zeros(max_attacker_dim - current_attacker_dim, dtype=torch.float)
        padded_attackers = torch.cat([attackers, padding])
    else:
        padded_attackers = attackers[:max_attacker_dim]

    # Pad or Truncate defenders to max_defender_dim
    current_defender_dim = defenders.shape[0]
    if current_defender_dim < max_defender_dim:
        padding = torch.zeros(max_defender_dim - current_defender_dim, dtype=torch.float)
        padded_defenders = torch.cat([defenders, padding])
    else:
        padded_defenders = defenders[:max_defender_dim]

    # Reshape to add a batch dimension
    padded_attackers_tensor = padded_attackers.unsqueeze(0)
    padded_defenders_tensor = padded_defenders.unsqueeze(0)

    return padded_attackers_tensor, padded_defenders_tensor

def generate_optimal_attacker_positions(player_data_list, cvae_model):
    """
    Generates optimal attacker positions using the trained CVAE model.

    Args:
        player_data_list (list): A list of dictionaries, where each dictionary
                                 represents a player with 'x', 'y', 'is_attacker',
                                 and 'distance_to_goal' keys.
        cvae_model (CVAE): The trained CVAE model.

    Returns:
        list: A list of dictionaries, where each dictionary contains
              denormalized 'x' and 'y' coordinates for optimal attacker positions.
    """
    # Preprocess the input player data
    padded_attackers_tensor, padded_defenders_tensor = process_player_data_for_cvae(player_data_list)

    # Set the model to evaluation mode
    cvae_model.eval()

    # Generate reconstructed attackers from the CVAE
    with torch.no_grad():
        recon_attackers, _, _ = cvae_model(
            padded_attackers_tensor.to(device),
            padded_defenders_tensor.to(device)
        )

    # Convert recon_attackers to numpy array and reshape to (num_players, 2)
    reconstructed_attacker_coords = recon_attackers.cpu().numpy().reshape(-1, 2)

    # Denormalize coordinates
    pitch_width = 120.0
    pitch_height = 80.0

    denormalized_coords = []
    for x_norm, y_norm in reconstructed_attacker_coords:
        # Filter out padded zeros (assuming 0,0 is not a valid player position in practice)
        if not (abs(x_norm) < 1e-6 and abs(y_norm) < 1e-6): # Using a small epsilon for float comparison
            denormalized_x = x_norm * pitch_width
            denormalized_y = y_norm * pitch_height

            # Clip coordinates to be within pitch boundaries (0-120 for x, 0-80 for y)
            denormalized_x = max(0.0, min(pitch_width, denormalized_x))
            denormalized_y = max(0.0, min(pitch_height, denormalized_y))

            denormalized_coords.append({"x": denormalized_x, "y": denormalized_y})

    return denormalized_coords

if __name__ == '__main__':
    # Initialize the CVAE model
    cvae_model = CVAE(attacker_dim, defender_dim).to(device)

    # Load the saved state dictionary
    import os
    # Get the directory of the current script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'cvae_model.pth')

    # Load the saved state dictionary
    try:
        if not os.path.exists(model_path):
             raise FileNotFoundError(f"{model_path} does not exist.")
        
        cvae_model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
        print(f"CVAE model loaded successfully from {model_path}")
    except Exception as e:
        print(f"Error loading model: {e}")
        exit()

    # Example usage (simulating frontend input)
    sample_player_data_list = [
        # Defender 1 (from example)
        {'x': 10, 'y': 30, 'is_attacker': False, 'distance_to_goal': 25},
        # Attacker 1 (just to show how it would be structured, though CVAE generates these)
        {'x': 90, 'y': 50, 'is_attacker': True, 'distance_to_goal': 35},
        # Defender 2
        {'x': 70, 'y': 20, 'is_attacker': False, 'distance_to_goal': 50},
        # Defender 3
        {'x': 80, 'y': 60, 'is_attacker': False, 'distance_to_goal': 40},
        # Defender 4
        {'x': 60, 'y': 40, 'is_attacker': False, 'distance_to_goal': 60}
    ]

    print("\nSample Input Player Data:")
    for player in sample_player_data_list:
        print(player)

    optimal_positions = generate_optimal_attacker_positions(sample_player_data_list, cvae_model)

    print("\nGenerated Optimal Attacker Positions (Denormalized):")
    for pos in optimal_positions:
        print(f"x: {pos['x']:.2f}, y: {pos['y']:.2f}")
