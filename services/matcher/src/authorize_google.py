"""Local OAuth bootstrap: credentials stay in ignored output/, never stdout."""
import argparse
import base64
import hashlib
import json
import secrets
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlencode, urlsplit

import requests

from src.drive import SCOPES


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--client-secret', required=True)
    args = parser.parse_args()
    installed = json.loads(Path(args.client_secret).read_text(encoding='utf-8'))['installed']
    if not installed['client_id'].endswith('.apps.googleusercontent.com'):
        raise ValueError('Invalid Google client')
    destination = Path(__file__).resolve().parent.parent / 'output/google_credentials.json'
    if destination.exists():
        raise ValueError('Credentials already exist; refusing overwrite')
    state = secrets.token_urlsafe(32)
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    finished = False
    succeeded = False

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass  # Callback URLs contain authorization codes.

        def html(self, message, status=200):
            self.send_response(status)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Referrer-Policy', 'no-referrer')
            self.end_headers()
            self.wfile.write(('<!doctype html><html lang="it"><meta charset="utf-8"><title>JobOps</title><body><h1>JobOps</h1><p>' + message + '</p></body></html>').encode())

        def do_GET(self):
            nonlocal finished, succeeded
            route = urlsplit(self.path)
            if route.path == '/start':
                url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urlencode({
                    'client_id': installed['client_id'], 'redirect_uri': redirect,
                    'response_type': 'code', 'scope': ' '.join(SCOPES),
                    'state': state, 'code_challenge': challenge, 'code_challenge_method': 'S256',
                    'access_type': 'offline', 'prompt': 'consent'})
                self.send_response(302)
                self.send_header('Location', url)
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                return
            if route.path != '/callback':
                self.html('Pagina non disponibile.', 404)
                return
            query = parse_qs(route.query)
            if query.get('state', [''])[0] != state:
                self.html('Richiesta non valida.', 400)
                return
            if 'error' in query or not query.get('code'):
                finished = True
                self.html('Autorizzazione non concessa. Nessuna credenziale salvata.')
                return
            try:
                response = requests.post('https://oauth2.googleapis.com/token', timeout=40, data={
                    'client_id': installed['client_id'], 'client_secret': installed['client_secret'],
                    'code': query['code'][0], 'code_verifier': verifier,
                    'redirect_uri': redirect, 'grant_type': 'authorization_code'})
                response.raise_for_status()
                token = response.json()
                granted = set(token.get('scope', '').split())
                if not token.get('refresh_token') or not set(SCOPES).issubset(granted):
                    raise ValueError('Incomplete permissions')
                credentials = {'type': 'authorized_user', 'client_id': installed['client_id'],
                               'client_secret': installed['client_secret'], 'refresh_token': token['refresh_token'],
                               'token_uri': 'https://oauth2.googleapis.com/token', 'scopes': SCOPES}
                destination.parent.mkdir(exist_ok=True)
                with destination.open('x', encoding='utf-8') as file:
                    json.dump(credentials, file)
                succeeded = True
                self.html('Collegamento Google completato. Le credenziali sono state salvate localmente. Puoi tornare alla chat.')
            except Exception:
                self.html('Collegamento non completato. Nessun dettaglio sensibile viene mostrato.', 400)
            finally:
                finished = True

    server = HTTPServer(('127.0.0.1', 0), Handler)
    server.timeout = 5
    redirect = f'http://127.0.0.1:{server.server_port}/callback'
    print(f'Open http://127.0.0.1:{server.server_port}/start', flush=True)
    deadline = time.monotonic() + 1800
    try:
        while not finished and time.monotonic() < deadline:
            server.handle_request()
    finally:
        server.server_close()
    print('Google authorization saved locally.' if succeeded else 'Authorization not completed.', flush=True)
    return 0 if succeeded else 1


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as error:
        print('Authorization setup failed: ' + type(error).__name__)
        raise SystemExit(1)
