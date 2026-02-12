import torch
import torch.nn.functional as F
from torch_geometric.nn import GATConv, global_mean_pool
from torch.nn import Linear

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
        # Sigmoid removed as BCEWithLogitsLoss is used
        x = self.fc(x)

        return x
