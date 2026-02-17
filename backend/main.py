from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import datetime
import os
from google.cloud import firestore

app = FastAPI(title="EarlyBirds API")

# Initialize Firestore
# To use Firestore, set USE_FIRESTORE=true
USE_FIRESTORE = os.getenv("USE_FIRESTORE", "true").lower() == "true"
db = None

if USE_FIRESTORE:
    try:
        # Explicitly connecting to the 'coffeeshop-demo' database
        db = firestore.Client(database="coffeeshop-demo")
        print("Firestore 'coffeeshop-demo' initialized.")
    except Exception as e:
        print(f"Firestore Client Error: {e}. Falling back to in-memory.")
        db = None
else:
    print("Running in MOCK mode.")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    passcode: str

class CoffeeItem(BaseModel):
    id: str
    name: str
    price: float
    description: str
    image_url: str

class OrderItem(BaseModel):
    product_id: str
    name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    email: str
    items: List[OrderItem]
    total_price: float

# --- Mock Data ---
MENU = [
    {"id": "latte", "name": "Caffè Latte", "price": 4.25, "description": "Rich espresso with steamed milk.", "image_url": "https://images.unsplash.com/photo-1512568448817-bb9a9604d72b?w=300&h=300&fit=crop"},
    {"id": "macchiato", "name": "Caramel Macchiato", "price": 4.95, "description": "Espresso with vanilla-flavored syrup, milk and caramel drizzle.", "image_url": "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=300&h=300&auto=format&fit=crop"},
    {"id": "cold-brew", "name": "Vanilla Sweet Cream Cold Brew", "price": 4.45, "description": "Slow-steeped cold brew topped with house-made vanilla sweet cream.", "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=300&h=300&auto=format&fit=crop"},
    {"id": "frappuccino", "name": "Mocha Frappuccino", "price": 5.25, "description": "Coffee, mocha sauce and milk blended with ice and topped with whipped cream.", "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&h=300&auto=format&fit=crop"},
    {"id": "spring-latte", "name": "Honey Lavender Latte", "price": 5.45, "description": "🌸 Spring Special: Creamy latte with hints of honey and floral lavender.", "image_url": "https://images.unsplash.com/photo-1596701062351-8c2c14d1fcd0?w=300&h=300&fit=crop"},
]

USERS = {} # In-memory for demo
ORDERS = []

# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "Welcome to EarlyBirds API (Demo Mode)"}

@app.get("/menu", response_model=List[CoffeeItem])
async def get_menu():
    return MENU

@app.post("/register")
async def register_user(user: UserCreate):
    if db:
        user_ref = db.collection("users").document(user.email)
        if user_ref.get().exists:
            raise HTTPException(status_code=400, detail="User already exists")
        user_ref.set({
            "email": user.email,
            "name": user.name,
            "passcode": user.passcode, # In production, hash this!
            "created_at": firestore.SERVER_TIMESTAMP
        })
    else:
        USERS[user.email] = {"name": user.name, "passcode": user.passcode}
    return {"message": "User created successfully"}

@app.post("/login")
async def login(email: str, passcode: str):
    if db:
        user_ref = db.collection("users").document(email)
        user_doc = user_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            if user_data["passcode"] == passcode:
                return {"message": "Login successful", "email": email, "name": user_data["name"]}
            else:
                raise HTTPException(status_code=401, detail="Invalid passcode")
        else:
            raise HTTPException(status_code=404, detail="User not found")
            
    # Fallback for testing/mock
    if email in USERS:
        if USERS[email]["passcode"] == passcode:
            return {"message": "Login successful", "email": email, "name": USERS[email]["name"]}
        else:
            raise HTTPException(status_code=401, detail="Invalid passcode")
    else:
        return {"message": "Login successful (Auto-generated)", "email": email, "name": email.split('@')[0].capitalize()}

@app.post("/orders")
async def create_order(order: OrderCreate):
    order_dict = order.dict()
    if db:
        order_dict["timestamp"] = firestore.SERVER_TIMESTAMP
        db.collection("orders").add(order_dict)
    else:
        order_dict["timestamp"] = datetime.datetime.now().isoformat()
        ORDERS.append(order_dict)
    return {"message": "Order placed successfully"}

@app.get("/orders/{email}")
async def get_orders(email: str):
    if db:
        orders_ref = db.collection("orders").where("email", "==", email).order_by("timestamp", direction=firestore.Query.DESCENDING)
        results = []
        for doc in orders_ref.stream():
            o = doc.to_dict()
            if "timestamp" in o and o["timestamp"]:
                # Convert firestore timestamp to string for JSON serialization
                o["timestamp"] = o["timestamp"].isoformat()
            results.append(o)
        return results
    return [o for o in ORDERS if o["email"] == email]

if __name__ == "__main__":
    import uvicorn
    # Cloud Run provides the PORT environment variable
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
