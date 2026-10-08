"""Bounded public ATS discovery and authoritative detail validation."""
import html
import re
import time
from html.parser import HTMLParser
from urllib.parse import quote

import requests


class ProviderError(RuntimeError):
    pass


def request(session, method, url, **kwargs):
    for attempt in range(3):
        response = session.request(method, url, timeout=40, **kwargs)
        if response.status_code != 429 and response.status_code < 500:
            response.raise_for_status()
            return response
        if attempt < 2:
            time.sleep(2 ** attempt)
    response.raise_for_status()


class TextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def plain(value):
    parser = TextParser()
    parser.feed(html.unescape(value or ''))
    return re.sub(r'\s+', ' ', ' '.join(parser.parts)).strip()


def base(board):
    token = quote(board['board'], safe='')
    if board['provider'] == 'greenhouse':
        return f'https://boards-api.greenhouse.io/v1/boards/{token}/jobs'
    if board['provider'] == 'lever':
        host = 'api.eu.lever.co' if board.get('region') == 'eu' else 'api.lever.co'
        return f'https://{host}/v0/postings/{token}'
    if board['provider'] == 'ashby':
        return f'https://api.ashbyhq.com/posting-api/job-board/{token}'
    raise ProviderError('Unsupported provider')


def job_from(raw, board):
    if board['provider'] == 'ashby':
        if raw.get('isListed') is not True:
            return None
        # The public endpoint identifies postings through their canonical job URL.
        job_id = raw['jobUrl'].rstrip('/').split('/')[-1]
        locations = [raw.get('location', '')] + [x.get('location', '') for x in raw.get('secondaryLocations', [])]
        if ((raw.get('address') or {}).get('postalAddress') or {}).get('addressCountry') in ('DE', 'Germany'):
            locations.append('Germany')
        return {'id': job_id, 'provider': 'ashby', 'board': board, 'company': board['company'],
                'title': raw['title'], 'url': raw['jobUrl'],
                'location': ('Remote ' if raw.get('isRemote') else '') + '; '.join(filter(None, locations)),
                'description': plain(raw.get('descriptionHtml') or raw.get('descriptionPlain', '')),
                'published_at': raw.get('publishedAt', '')}
    if board['provider'] == 'greenhouse':
        if raw.get('internal_job_id') is None:  # prospect/talent pool, not a vacancy
            return None
        return {'id': str(raw['id']), 'provider': 'greenhouse', 'board': board,
                'company': board['company'], 'title': raw['title'], 'url': raw['absolute_url'],
                'location': raw.get('location', {}).get('name', ''),
                'description': plain(raw.get('content', ''))}
    lists = ' '.join(x.get('text', '') + ' ' + x.get('content', '') for x in raw.get('lists', []))
    return {'id': str(raw['id']), 'provider': 'lever', 'board': board,
            'company': board['company'], 'title': raw['text'], 'url': raw['hostedUrl'],
            'location': raw.get('categories', {}).get('location', ''),
            'description': plain(' '.join([raw.get('description', ''), lists,
                                          raw.get('additional', ''), raw.get('workplaceType', '')]))}


def discover(session, board):
    jobs = []
    if board['provider'] == 'ashby':
        body = request(session, 'GET', base(board)).json()
        if not isinstance(body.get('jobs'), list):
            raise ProviderError('Malformed Ashby listing')
        return [job for raw in body['jobs'] if (job := job_from(raw, board))]
    if board['provider'] == 'greenhouse':
        body = request(session, 'GET', base(board), params={'content': 'true'}).json()
        if not isinstance(body.get('jobs'), list):
            raise ProviderError('Malformed listing')
        total = body.get('meta', {}).get('total')
        if total is not None and total != len(body['jobs']):
            raise ProviderError('Incomplete listing')
        return [job for raw in body['jobs'] if (job := job_from(raw, board))]
    for page in range(100):
        body = request(session, 'GET', base(board), params={'mode': 'json', 'skip': page * 100, 'limit': 100}).json()
        if not isinstance(body, list):
            raise ProviderError('Malformed listing')
        jobs.extend(job_from(raw, board) for raw in body)
        if len(body) < 100:
            return jobs
    raise ProviderError('Pagination limit exceeded')


def validate_live(session, job):
    if job['provider'] == 'ashby':
        fresh = next((j for j in discover(session, job['board']) if j['id'] == job['id']), None)
        if fresh and len(fresh['description']) < 200:
            raise ProviderError('Missing substantial JD')
        return fresh
    try:
        raw = request(session, 'GET', base(job['board']) + '/' + quote(job['id'], safe=''),
                      params={'mode': 'json'}).json()
    except requests.HTTPError as error:
        if error.response.status_code in (404, 410):
            return None
        raise
    if str(raw.get('id')) != job['id']:
        raise ProviderError('Detail identity mismatch')
    fresh = job_from(raw, job['board'])
    if not fresh or len(fresh['description']) < 200:
        raise ProviderError('Missing substantial JD')
    return fresh
