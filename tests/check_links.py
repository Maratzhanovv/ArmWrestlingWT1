from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
root = Path(__file__).resolve().parents[1]
errors = []
class Check(HTMLParser):
    def __init__(self, file):
        super().__init__(); self.file=file; self.ids=set(); self.refs=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids: errors.append(f'{self.file.name}: duplicate ID {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag=='form' and 'novalidate' not in attrs: errors.append(f'{self.file.name}: missing novalidate')
        if tag in ('input','textarea'):
            if any(k in attrs for k in ['required','pattern','minlength','maxlength','min','max']) or attrs.get('type')=='email': errors.append(f'{self.file.name}: native validation attribute')
        if tag=='img' and 'alt' not in attrs: errors.append(f'{self.file.name}: missing alt')
        for key in ['href','src']:
            ref=attrs.get(key)
            if ref and not urlsplit(ref).scheme:
                self.refs.append(ref)
parsers={}
for file in root.glob('*.html'):
    parser=Check(file); parser.feed(file.read_text(encoding='utf-8')); parsers[file.name]=parser
for name,parser in parsers.items():
    for ref in parser.refs:
        parts=urlsplit(ref); target=unquote(parts.path) or name
        if not (root/target).is_file(): errors.append(f'{name}: missing {ref}')
        elif parts.fragment and target in parsers and parts.fragment not in parsers[target].ids: errors.append(f'{name}: missing anchor {ref}')
assert len(parsers)>=6
assert not errors, '\n'.join(errors)
print(f'PASS: {len(parsers)} pages, all local links/assets/anchors, unique IDs, image alt text and JS-only forms.')
