import sys
import os

# Now that this file is inside 'backend/api/', we need to add the 'backend/' folder to the path
# '..' goes up from 'api/' to 'backend/'
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app
