from pathlib import Path
import shutil
root=Path(__file__).resolve().parent.parent
for p in (root/'services/collector').glob('*.gs'):
 shutil.copy2(p,root/'services/matcher/apps-script'/p.name)
print('Collector test copies synchronized.')
