# EarlyBirds Coffee Shop Development Plan

## 1. Architecture Overview
- **Frontend**: React (TypeScript) with Vanilla CSS.
- **Backend**: Python (FastAPI) for a high-performance, modern API.
- **Database**: Google Cloud Firestore (flexible NoSQL, perfect for user profiles and order history).
- **Deployment**: Google Cloud Run (containerized deployment for scalability).

## 2. Data Model
### Users
- `id`: Unique identifier (Email)
- `name`: Full name
- `passcode`: Hashed passcode
- `created_at`: Timestamp
- `preferences`: (Optional) Favorite coffee types

### Orders
- `id`: Order ID
- `user_id`: Reference to User
- `items`: List of coffee items (name, size, price)
- `total_price`: Total amount
- `timestamp`: Date and time of order

### Products (Menu)
- Hardcoded or stored in Firestore: Starbucks-inspired menu (e.g., Caffè Latte, Caramel Macchiato, Pumpkin Spice Latte).

## 3. Development Phases

### Phase 1: Setup & Backend (API)
- Initialize FastAPI.
- Implement Authentication: Simple JWT-based login with email/passcode.
- Create endpoints for:
    - `POST /register`: User profile creation.
    - `POST /login`: Authentication.
    - `GET /menu`: Fetch coffee options.
    - `POST /orders`: Record a new order.
    - `GET /orders`: Fetch user order history.

### Phase 2: Frontend (UI/UX)
- Scaffold React app with TypeScript.
- **Login/Signup Page**: Clean, inviting "EarlyBirds" landing.
- **Main Dashboard**: Grid view of coffee products with prices and "Order" buttons.
- **Header Component**: Profile display in the top right corner.
- **Order History**: A simple modal or page to view past purchases.

### Phase 3: Integration & Local Testing
- Connect React frontend to FastAPI backend.
- Verify user flow: Login -> View Menu -> Order -> Check History.

### Phase 4: Containerization & Cloud Deployment
- Create `Dockerfile` for both services.
- Set up `docker-compose.yml` for local testing.
- Deploy to Google Cloud Run.

## 4. Aesthetic Goals
- "EarlyBirds" theme: Warm colors (coffee browns, soft yellows, morning whites).
- Modern, responsive design with interactive feedback (hover effects, smooth transitions).
