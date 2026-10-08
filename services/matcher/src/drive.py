"""Fresh Google sources plus private Drive output/state. No source writes."""
import io
import json
import os
import zipfile
from urllib.parse import quote
from xml.etree import ElementTree as ET

from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import AuthorizedSession

from src.providers import request

DRIVE = 'https://www.googleapis.com/drive/v3/files'
SCOPES = ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/spreadsheets.readonly']


def docx_paragraphs(content):
    with zipfile.ZipFile(io.BytesIO(content)) as archive:
        info = archive.getinfo('word/document.xml')
        if info.file_size > 5_000_000:
            raise ValueError('Document too large')
        root = ET.fromstring(archive.read(info))
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    return [''.join(t.text or '' for t in p.findall('.//w:t', ns))
            for p in root.findall('.//w:p', ns)]


class Drive:
    def __init__(self, config):
        self.config = config
        info = json.loads(os.environ['GOOGLE_CREDENTIALS_JSON'])
        credentials = (service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
                       if info.get('type') == 'service_account'
                       else Credentials.from_authorized_user_info(info, scopes=SCOPES))
        self.session = AuthorizedSession(credentials)

    def metadata(self, file_id):
        return request(self.session, 'GET', DRIVE + '/' + quote(file_id, safe=''),
                       params={'fields': 'id,mimeType,modifiedTime,parents,trashed', 'supportsAllDrives': 'true'}).json()

    def source(self, file_id):
        meta = self.metadata(file_id)
        if meta.get('trashed'):
            raise ValueError('Source is trashed')
        url = DRIVE + '/' + quote(file_id, safe='')
        mime = meta['mimeType']
        if mime == 'application/vnd.google-apps.document':
            text = request(self.session, 'GET', url + '/export', params={'mimeType': 'text/plain'}).text
            paragraphs = text.splitlines()
        elif mime == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            paragraphs = docx_paragraphs(request(self.session, 'GET', url, params={'alt': 'media'}).content)
        elif mime in ('text/plain', 'text/markdown'):
            paragraphs = request(self.session, 'GET', url, params={'alt': 'media'}).text.splitlines()
        else:
            raise ValueError('Unsupported source format')
        if sum(len(p) for p in paragraphs) < 100:
            raise ValueError('Source empty or incomplete')
        return paragraphs

    def tracker(self):
        sheet_id = quote(self.config['TRACKER_SHEET_ID'], safe='')
        range_name = quote(self.config['TRACKER_RANGE'], safe='')
        body = request(self.session, 'GET', f'https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{range_name}').json()
        return body.get('values', [])

    def find_output(self, name):
        folder = self.config['OUTPUT_FOLDER_ID']
        if not all(c.isalnum() or c in '-_' for c in folder):
            raise ValueError('Invalid output folder ID')
        body = request(self.session, 'GET', DRIVE, params={
            'q': f"'{folder}' in parents and name = '{name}' and trashed = false",
            'fields': 'files(id),nextPageToken', 'pageSize': 100,
            'supportsAllDrives': 'true', 'includeItemsFromAllDrives': 'true'}).json()
        if body.get('nextPageToken') or len(body.get('files', [])) > 1:
            raise ValueError('Duplicate state/output files')
        return body.get('files', [])

    def read_state(self):
        files = self.find_output('processed_jobs.json')
        if not files:
            return {'version': 1, 'processed': {}}
        state = request(self.session, 'GET', DRIVE + '/' + files[0]['id'], params={'alt': 'media'}).json()
        if state.get('version') != 1 or not isinstance(state.get('processed'), dict):
            raise ValueError('Invalid state')
        return state

    def write_output(self, name, content, mime='application/json'):
        if name not in ('processed_jobs.json', 'shortlist.json', 'shortlist.md', 'candidates.json', 'candidates.md'):
            raise ValueError('Unapproved output filename')
        folder_meta = self.metadata(self.config['OUTPUT_FOLDER_ID'])
        if folder_meta['mimeType'] != 'application/vnd.google-apps.folder' or folder_meta.get('trashed'):
            raise ValueError('Output folder unavailable')
        files = self.find_output(name)
        if files:
            file_id = files[0]['id']
            if file_id in (self.config['EVIDENCE_FILE_ID'], self.config['CHARTER_FILE_ID'], self.config['TRACKER_SHEET_ID']):
                raise ValueError('Refusing to write a source')
            request(self.session, 'PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + file_id,
                    params={'uploadType': 'media', 'supportsAllDrives': 'true'}, data=content.encode(), headers={'Content-Type': mime})
        else:
            # Non-sensitive metadata first; body is sent only to the dedicated folder.
            created = request(self.session, 'POST', DRIVE, json={'name': name, 'mimeType': mime,
                              'parents': [self.config['OUTPUT_FOLDER_ID']]}, params={'fields': 'id', 'supportsAllDrives': 'true'}).json()
            request(self.session, 'PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + created['id'],
                    params={'uploadType': 'media', 'supportsAllDrives': 'true'}, data=content.encode(), headers={'Content-Type': mime})
