"""Check the deployed static HTML SEO surface without third-party dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import collections, json, re, tomllib, xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
BASE='https://beardlogistic.com'
class Page(HTMLParser):
 def __init__(self,source):
  super().__init__();self.tags=[];self.text=collections.defaultdict(list);self.active=[]
  self.feed(source)
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs);self.tags.append((tag,attrs))
  if tag in ('title','h1'):self.active.append(tag)
 def handle_endtag(self,tag):
  if tag in self.active:self.active.remove(tag)
 def handle_data(self,text):
  for key in self.active:self.text[key].append(text)

config=tomllib.loads((ROOT/'netlify.toml').read_text())
routes={x['from']:x['to'] for x in config['redirects'] if x['from']!='/*'}
errors=[];warnings=[];titles=[];descriptions=[];indexable=[];forms=[]
for file in sorted(ROOT.rglob('*.html')):
 relative=file.relative_to(ROOT).as_posix();source=file.read_text();p=Page(source)
 check=lambda ok,msg:errors.append(relative+': '+msg) if not ok else None
 tags=lambda name:[a for t,a in p.tags if t==name]
 metas={a.get('name',a.get('property')):a.get('content') for a in tags('meta')}
 canon=[a.get('href') for a in tags('link') if a.get('rel')=='canonical']
 title=''.join(p.text['title']).strip();desc=metas.get('description','')
 check(len(tags('title'))==1 and bool(title),'exactly one nonempty title required')
 check(len(tags('h1'))==1,'exactly one H1 required')
 check(len(canon)==1,'exactly one canonical required')
 check(bool(desc),'description required')
 check(len([a for a in tags('meta') if a.get('name')=='description'])==1,'duplicate description')
 expected=BASE+('/' if relative=='index.html' else '/'+relative.removesuffix('.html'))
 utility=relative in ('thank-you.html','warehousing/cross-docking.html')
 check(canon==[BASE+'/cross-docking' if relative.startswith('warehousing/') else expected],'canonical mismatch')
 if utility:check('noindex' in metas.get('robots',''),'utility page must be noindex')
 else:
  check('noindex' not in metas.get('robots',''),'public page is noindex')
  indexable.append(expected);titles.append(title);descriptions.append(desc)
  check(metas.get('og:url')==expected,'social canonical mismatch')
  for k in ('og:title','og:description','og:image','twitter:title','twitter:description','twitter:image'):check(bool(metas.get(k)),'missing '+k)
  for k in ('og:image','twitter:image'):
   image=urlsplit(metas.get(k,''));check(image.netloc=='beardlogistic.com' and (ROOT/unquote(image.path).lstrip('/')).is_file(),k+' must point to an existing local image')
  graph=[]
  for raw in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',source,re.S):
   try:graph.extend(json.loads(raw).get('@graph',[]))
   except Exception as e:check(False,'invalid schema: '+str(e))
  check(any(n.get('@type') in ('WebPage','AboutPage','ContactPage') and n.get('url')==expected for n in graph),'missing page schema')
  check(any(n.get('@id')==BASE+'/#organization' for n in graph),'organization reference missing')
  if relative!='index.html':check(any(n.get('@type')=='BreadcrumbList' for n in graph),'missing breadcrumb schema')
  if len(title)>70:warnings.append(relative+': title exceeds 70 chars')
  if len(desc)>180:warnings.append(relative+': description exceeds 180 chars')
 for tag,a in p.tags:
  if tag=='form':forms.append((relative,a.get('name'),a.get('action')))
  if tag=='img':check('alt' in a,'image alt missing')
  attribute='href' if tag in ('a','link') else 'src' if tag in ('script','img') else None
  if not attribute or not a.get(attribute):continue
  u=urlsplit(a[attribute]);path=unquote(u.path)
  if u.scheme or u.netloc or not path:continue
  if path.startswith('/'):
   target=path if path not in routes else routes[path]
   target='/index.html' if target=='/' else target
   check((ROOT/target.lstrip('/')).is_file(),'broken local '+attribute+': '+a[attribute])
 check('11K' not in source and '11,000' not in source,'outdated forklift claim')

for label,values in [('title',titles),('description',descriptions)]:
 for v,count in collections.Counter(values).items():
  if count>1:errors.append('Duplicate '+label+': '+v)
sitemap=ET.parse(ROOT/'sitemap.xml').getroot();ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[u.text for u in sitemap.findall('s:url/s:loc',ns)]
if set(urls)!=set(indexable) or len(urls)!=len(set(urls)):errors.append('Sitemap does not match the indexable canonical pages')
if 'Sitemap: '+BASE+'/sitemap.xml' not in (ROOT/'robots.txt').read_text():errors.append('robots sitemap reference missing')
print(json.dumps({'html_pages':len(list(ROOT.rglob('*.html'))),'indexable_pages':len(indexable),'sitemap_urls':len(urls),'forms':forms,'warnings':warnings,'errors':errors},indent=2))
raise SystemExit(bool(errors))
