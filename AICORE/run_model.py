import torch
import torch.nn as nn

# ==============================
# 1️⃣ Define Model Architecture
# (MUST be same as training)
# ==============================

class MyModel(nn.Module):
    def __init__(self):
        super(MyModel, self).__init__()
        self.fc = nn.Linear(10, 2)   # CHANGE if your model is different

    def forward(self, x):
        return self.fc(x)

# ==============================
# 2️⃣ Load Model Weights
# ==============================

MODEL_PATH = "model.pth"

model = MyModel()
model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device("cpu")))
model.eval()

print("✅ Model Loaded Successfully")

# ==============================
# 3️⃣ Create Test Data
# ==============================

# Change input size if needed
test_data = torch.randn(1, 10)

# ==============================
# 4️⃣ Run Inference
# ==============================

with torch.no_grad():
    output = model(test_data)
    prediction = torch.argmax(output, dim=1)

# ==============================
# 5️⃣ Print Results
# ==============================

print("Test Input:", test_data)
print("Raw Output:", output)
print("Predicted Class:", prediction.item())
