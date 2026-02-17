# EarlyBirds Coffee Shop Demo

A full-stack coffee shop application with a FastAPI backend, React (TypeScript) frontend, and Google Cloud Firestore database.

## Architecture
- **Frontend**: React (TS) served by Nginx on Cloud Run.
- **Backend**: FastAPI on Cloud Run.
- **Database**: Google Cloud Firestore (Database: `coffeeshop-demo`).
- **CI/CD**: Google Cloud Build.

## 🚀 Cloud Deployment (Manual)

### 1. Backend Deployment
```bash
cd backend
# Build and Push
gcloud builds submit --tag gcr.io/swift-arcadia-486017-q4/earlybirds-backend
# Deploy
gcloud run deploy earlybirds-backend \
  --image gcr.io/swift-arcadia-486017-q4/earlybirds-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars USE_FIRESTORE=true \
  --project swift-arcadia-486017-q4
```

### 2. Frontend Deployment
**Note**: Ensure `App.tsx` has the correct `API_BASE` URL before building.
```bash
cd frontend
# Build and Push
gcloud builds submit --tag gcr.io/swift-arcadia-486017-q4/earlybirds-frontend
# Deploy
gcloud run deploy earlybirds-frontend \
  --image gcr.io/swift-arcadia-486017-q4/earlybirds-frontend \
  --platform managed \
  --region us-central1 \
  --project swift-arcadia-486017-q4
```

## 🔒 Private Access (Secure Tunneling)
If services are not public (`allUsers`), use the following proxies to access the app locally:

**Terminal 1 (Backend Proxy):**
```bash
gcloud run services proxy earlybirds-backend --port=8001 --region=us-central1
```

**Terminal 2 (Frontend Proxy):**
```bash
gcloud run services proxy earlybirds-frontend --port=4001 --region=us-central1
```
Access the app at: **http://localhost:4001**

## 💻 Local Development (Rapid Testing)
To test new features locally without triggering a cloud build:

1. **Start the Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   # Backend will run at http://localhost:8001
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm start
   # Frontend will run at http://localhost:3000
   ```

3. **Verify**: Open [http://localhost:3000](http://localhost:3000). The frontend is pre-configured to talk to the local backend. Changes you make to the code will "Hot Reload" instantly.

## 🛠 CI/CD Pipeline
Once your changes look good locally, push them to GitHub and run the pipeline:
The project includes a `cloudbuild.yaml` file for automated deployments.

To trigger manually:
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_BACKEND_URL="https://earlybirds-backend-418660309017.us-central1.run.app"
```

## 🗄 Firestore Configuration
- **Database Name**: `coffeeshop-demo`
- **Location**: `us-central1`
- **Required IAM Roles**: The Cloud Run service account must have `roles/datastore.user`.

## 💻 Local Development
1. **Backend**: `cd backend && pip install -r requirements.txt && python main.py`
2. **Frontend**: `cd frontend && npm install && npm start`
