"""Opt-in local embeddings. Never calls a paid API or downloads a model."""
import argparse
import copy
import json
import math
import os
from pathlib import Path


def query_for(settings):
    return json.dumps({k: settings.get(k, []) for k in
                       ('targetRoles', 'potentialRoles', 'strengths')},
                      ensure_ascii=False, separators=(',', ':'))


def document_for(job):
    return '\n'.join(str(job.get(k) or '') for k in ('title', 'location', 'description'))


def cosine(a, b):
    if not len(a) or len(a) != len(b) or not all(math.isfinite(float(x)) for x in [*a, *b]):
        raise ValueError('Invalid embeddings')
    norm = math.sqrt(sum(float(x)**2 for x in a) * sum(float(x)**2 for x in b))
    if not norm:
        raise ValueError('Zero embedding')
    return max(-1.0, min(1.0, sum(float(x)*float(y) for x, y in zip(a, b))/norm))


def rank_packet(packet, settings, model, model_version):
    jobs = packet.get('candidates')
    if not isinstance(jobs, list) or len(jobs) > 5000 or not settings.get('configured'):
        raise ValueError('Use a candidate packet and a configured profile')
    if not model_version or not any(settings.get(k) for k in ('targetRoles', 'potentialRoles', 'strengths')):
        raise ValueError('Supply search preferences and a model version')
    result = copy.deepcopy(packet)
    query = query_for(settings)
    q = model.encode_query([query], normalize_embeddings=True, show_progress_bar=False)[0]
    for job in result['candidates']:
        document = document_for(job)
        if len(document) > 101002:
            raise ValueError('Job text exceeds dashboard import limits')
        # Overlapping bounded passages reduce whole-JD truncation. Similarity
        # remains a retrieval hint, including when negation is present.
        words = document.split()
        chunks = [' '.join(words[i:i+160]) for i in range(0, len(words), 120)] or ['']
        vectors = model.encode_document(chunks, normalize_embeddings=True, show_progress_bar=False)
        if len(vectors) != len(chunks):
            raise ValueError('Missing embeddings')
        score = max(cosine(q, vector) for vector in vectors)
        job['semantic'] = {'score': score, 'query': query, 'document': document,
                           'model_version': model_version}
    # Do not modify verdicts, evidence, live status, profile or source state.
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ('packet', 'profile', 'model', 'model-version', 'output'):
        parser.add_argument('--'+name, required=True)
    args = parser.parse_args()
    model_path = Path(args.model).resolve()
    if not model_path.is_dir():
        parser.error('--model must be an existing trusted local model directory')
    output = Path(args.output).resolve()
    if output.exists():
        parser.error('Choose a new output path; existing files are not overwritten')
    if output in (Path(args.packet).resolve(), Path(args.profile).resolve()):
        parser.error('Write to a separate output file')
    os.environ['HF_HUB_OFFLINE'] = '1'
    os.environ['TRANSFORMERS_OFFLINE'] = '1'
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer(str(model_path), local_files_only=True,
                                trust_remote_code=False, device='cpu')
    packet = json.loads(Path(args.packet).read_text(encoding='utf-8'))
    settings = json.loads(Path(args.profile).read_text(encoding='utf-8'))
    result = rank_packet(packet, settings.get('profile', settings), model, args.model_version)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
