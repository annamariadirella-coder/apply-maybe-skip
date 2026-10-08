"""Serve the local workspace on loopback only; no dependencies or cloud account."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from functools import partial
from urllib.parse import urlsplit, unquote
root = Path(__file__).resolve().parent.parent
class WorkspaceHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        parts = Path(unquote(urlsplit(self.path).path)).parts
        private_names = {'private', 'local-data', 'data', 'output', 'node_modules', 'credentials'}
        if any(part.startswith('.') or part in private_names or part.startswith('credentials')
               or part.endswith(('.local.json', '.local.md', '.oauth.json')) for part in parts):
            self.send_error(404)
            return None
        return super().send_head()
print('JobOps: http://127.0.0.1:8765/apps/dashboard/ — Ctrl+C to stop', flush=True)
ThreadingHTTPServer(('127.0.0.1', 8765), partial(WorkspaceHandler, directory=str(root))).serve_forever()
