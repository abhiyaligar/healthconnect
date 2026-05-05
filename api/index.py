import sys
import os

# Ensure the backend folder is in the Python path so imports resolve correctly on Vercel
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
