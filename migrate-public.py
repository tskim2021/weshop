import concurrent.futures
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import time
from urllib.parse import urlencode, urljoin, urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
BASE = 'https://talmoschool.com'
OUT = ROOT / 'migration'
OUT.mkdir(exist_ok=True)

def api(method, data=None):
    url = BASE + '/trpc/' + method
    if data is not None:
        url += '?' + urlencode({'input': json.dumps({'json': data})})
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={'User-Agent': 'koreamall-content-migration/1.0'}), timeout=30) as r:
                result = json.load(r)
            return result['result']['data']['json']
        except Exception:
            if attempt == 2: raise
            time.sleep(1)

def pages(method, key, extra=None):
    result, page = [], 1
    while True:
        data = api(method, dict(extra or {}, page=page, limit=100))
        rows = data[key]
        result.extend(rows)
        if not rows or len(result) >= data['total']: break
        page += 1
    return result

categories = api('category.list')
boards = [b for b in api('community.boards') if b['slug'] != 'inquiry' and b['isActive']]
products = pages('product.list', 'products')
posts = {}
for board in boards:
    for post in pages('community.posts', 'posts', {'boardId': board['id']}):
        if post.get('isHidden'): continue
        post['authorName'] = post.get('displayName') or post.get('authorName') or post.get('userName') or '이전 게시글'
        post['userId'] = 0
        post['orderId'] = None
        post['orderItemId'] = None
        for field in ['userName', 'displayName', 'userGrade', 'openId', 'productName', 'productThumbnail', 'productSlug', 'hasHumanReply']:
            post.pop(field, None)
        posts[post['id']] = post
    print('Public board:', board['slug'], 'collected', len(posts), flush=True)

media = set()
class CleanHTML(HTMLParser):
    allowed = {'p','br','div','span','b','strong','i','em','u','s','h1','h2','h3','h4','ul','ol','li','blockquote','table','thead','tbody','tr','td','th','img','hr'}
    void = {'img','br','hr'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in {'script','style','iframe','object'}: self.skip += 1; return
        if self.skip or tag not in self.allowed: return
        safe = []
        for k,v in attrs:
            if tag == 'img' and k == 'src' and v:
                v = urljoin(BASE, v)
                if urlsplit(v).scheme == 'https' and urlsplit(v).hostname == 'talmoschool.com':
                    media.add(v); safe.append(('src',v))
            elif k in {'alt','colspan','rowspan'} and v:
                safe.append((k,v))
        self.parts.append('<'+tag+''.join(' '+k+'="'+html.escape(v,quote=True)+'"' for k,v in safe)+'>')
    def handle_endtag(self, tag):
        if tag in {'script','style','iframe','object'}: self.skip = max(0,self.skip-1); return
        if not self.skip and tag in self.allowed and tag not in self.void: self.parts.append('</'+tag+'>')
    def handle_data(self, data):
        if not self.skip: self.parts.append(html.escape(data))

data = {'categories': categories, 'boards': boards, 'products': products, 'posts': list(posts.values())}
for records in data.values():
    for record in records:
        for key in ['content', 'description']:
            if isinstance(record.get(key),str):
                parser=CleanHTML(); parser.feed(record[key]); record[key]=''.join(parser.parts).replace('탈모학교','koreamall')
        for key in ['thumbnail','imageUrl']:
            if record.get(key): media.add(urljoin(BASE,record[key]))
        for value in record.get('images') or []:
            if isinstance(value,str): media.add(urljoin(BASE,value))

asset_dir=ROOT/'dist/public/media/imported'
asset_dir.mkdir(parents=True,exist_ok=True)
def download(url):
    if urlsplit(url).hostname != 'talmoschool.com' or urlsplit(url).scheme != 'https':
        return url, None, 'external host'
    try:
        with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':BASE+'/'}),timeout=20) as r:
            body=r.read(12*1024*1024+1)
        if len(body)>12*1024*1024: raise ValueError('too large')
        ext = '.jpg' if body.startswith(b'\xff\xd8') else '.png' if body.startswith(b'\x89PNG') else '.gif' if body.startswith(b'GIF8') else '.webp' if body[8:12]==b'WEBP' else None
        if not ext: raise ValueError('not an image')
        name=hashlib.sha256(url.encode()).hexdigest()[:24]+ext
        (asset_dir/name).write_bytes(body)
        return url, '/media/imported/'+name, None
    except Exception as e: return url,None,type(e).__name__

mapping, failures = {}, []
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    for i,(url,path,error) in enumerate(pool.map(download,sorted(media)),1):
        if path: mapping[url]=path
        else: failures.append({'url':url,'reason':error})
        if i % 50 == 0: print('Images:', i, '/', len(media), flush=True)

def rewrite(value):
    if isinstance(value,dict): return {k:rewrite(v) for k,v in value.items()}
    if isinstance(value,list): return [rewrite(v) for v in value]
    if isinstance(value,str):
        for old,new in mapping.items(): value=value.replace(old,new)
    return value
data=rewrite(data)
(OUT/'public-data.json').write_text(json.dumps(data,ensure_ascii=False))
report={'source':BASE,'counts':{k:len(v) for k,v in data.items()},'imagesDownloaded':len(mapping),'imageFailures':failures,'excluded':['members','orders','payment settings','private inquiries','hidden posts','comments']}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='imageFailures'},ensure_ascii=False),flush=True)
print('Failed images:',len(failures),flush=True)
