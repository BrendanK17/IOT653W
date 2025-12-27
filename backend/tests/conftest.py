from pathlib import Path
import sys
import os

# Set testing environment
os.environ["TESTING"] = "1"

# Ensure the `backend` directory (project package root) is on sys.path so tests
# can import `app` regardless of the current working directory or how pytest
# is invoked (from repo root, CI, or an editor).
ROOT = Path(__file__).resolve().parents[1]
ROOT_STR = str(ROOT)
if ROOT_STR not in sys.path:
    sys.path.insert(0, ROOT_STR)
