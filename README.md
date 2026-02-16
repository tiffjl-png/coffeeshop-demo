# EarlyBirds Coffee Shop Demo

A simple three-tier web application with a FastAPI backend, React frontend, and Firestore database.

## Prerequisites
- Python 3.11+
- Node.js 18+
- Google Cloud Project with Firestore enabled.
- Google Cloud SDK installed.

## Local Setup

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set GCP credentials if using Firestore
# export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-file.json"
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

## Deployment to Cloud Run

### Build and Push Images
```bash
# Set your project ID
PROJECT_ID=$(gcloud config get-value project)

# Backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/earlybirds-backend backend
gcloud run deploy earlybirds-backend --image gcr.io/$PROJECT_ID/earlybirds-backend --platform managed --allow-unauthenticated

# Frontend
# Note: Update API_BASE in App.tsx to your backend URL before building
gcloud builds submit --tag gcr.io/$PROJECT_ID/earlybirds-frontend frontend
gcloud run deploy earlybirds-frontend --image gcr.io/$PROJECT_ID/earlybirds-frontend --platform managed --allow-unauthenticated
```

## Features
- **Authentication**: Simple email/passcode login.
- **User Profiles**: Profile creation on first login.
- **Menu**: Starbucks-inspired coffee options.
- **Order History**: Saved in Firestore for future recommendations.
