import sys
import os

# Bridge the root 'api/index.py' to the 'backend/main.py' application
# This allows Vercel to find the FastAPI entry point while keeping the project organized
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from main import app
