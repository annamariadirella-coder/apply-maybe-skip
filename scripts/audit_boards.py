import json,urllib.request,urllib.error,concurrent.futures,time,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(__file__).resolve().parent.parent
items=json.load(open(root/'services/matcher/context/apps_script_boards.json'))
def url(b):
 p,s=b['provider'],b['board']
 return {'greenhouse':f'https://boards-api.greenhouse.io/v1/boards/{s}/jobs','ashby':f'https://api.ashbyhq.com/posting-api/job-board/{s}','lever':f'https://api.lever.co/v0/postings/{s}?mode=json','personio':f'https://{s}.jobs.personio.de/xml?language=en','recruitee':f'https://{s}.recruitee.com/api/offers/','smartrecruiters':f'https://api.smartrecruiters.com/v1/companies/{s}/postings?limit=1','workable':f'https://www.workable.com/api/accounts/{s}?details=true'}[p]
def check(b):
 x={**b,'url':url(b),'checked_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
 if b['provider']=='workable':return {**x,'status':'deferred_provider_quota','http_status':None}
 try:
  r=urllib.request.urlopen(urllib.request.Request(x['url'],headers={'User-Agent':'JobOps coverage audit'}),timeout=9);text=r.read().decode();code=r.status
  if b['provider']=='personio':root=ET.fromstring(text);assert root.tag=='workzag-jobs';rows=root.findall('position')
  else:
   d=json.loads(text);rows=d if b['provider']=='lever' else d.get({'greenhouse':'jobs','ashby':'jobs','recruitee':'offers','smartrecruiters':'content'}.get(b['provider'],'jobs'));assert isinstance(rows,list)
  return {**x,'status':'verified','http_status':code,'postings_on_first_page':len(rows)}
 except urllib.error.HTTPError as e:return {**x,'status':'not_found' if e.code in (404,410) else 'access_denied' if e.code in (401,403) else 'rate_limited' if e.code==429 else 'http_error','http_status':e.code}
 except Exception as e:return {**x,'status':'unverified','http_status':None,'error_type':type(e).__name__}
out=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 for i,x in enumerate(pool.map(check,items)):
  out.append(x)
  if (i+1)%50==0:print('Audited',i+1,flush=True)
json.dump({'version':1,'audit_environment':'Codex runner; providers may behave differently in Apps Script','boards':out},open(root/'services/collector/board-audit.json','w'),indent=2)
from collections import Counter
print(dict(Counter(b['status'] for b in out)),flush=True)
