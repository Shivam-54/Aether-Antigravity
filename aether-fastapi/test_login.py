import sys
sys.path.append("/Users/shivampatel/aether-isle/aether-fastapi/backend")
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
try:
    response = client.post("/api/auth/login", data={"username": "shivamvp054@gmail.com", "password": "123"})
    print("Status code:", response.status_code)
    print("Response text:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
