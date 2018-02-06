import sys
from random import randint


CATEGORIES = ('sd', 'fa', 'ma', 'va', 'gd', 'tw', 'os')


class WordnetParser(object):

    def __init__(self, file_name,
                 on_interest_callback=None):

        def empty(*a, **kw):
            return None

        self.file_name = file_name

        if on_interest_callback:
            self.on_interest_callback = on_interest_callback
        else:
            self.on_interest_callback = empty

    def terms(self, l):
        try:
            return [k for k in l.split('@')[0].split()[4:] if not k.isdigit() and len(k) >= 3]
        except:
            pass

    def l0(self, ln):
        try:
            l, r = ln.split('|')
            return l, r
        except:
            return None, None

    def description(self, r):
        try:
            return [k.strip() for k in r.split(';') if k.strip() != '']
        except:
            pass

    def construct(self, terms, descr):
        tags = terms,
        title = "I'll %s" % descr[0]
        description = ' '.join([k.strip('"') for k in descr[0:]])
        return tags, title, description

    def parse_line(self, ln):
        l, r = self.l0(ln)
        if l and r:
            terms = self.terms(l)
            descr = self.description(r)
            if terms and descr:
                tg, tl, ds = self.construct(terms, descr)
                self.on_interest_callback(tags=tg,title=tl,description=ds)

    def load(self, start, end):
        cnt = 0
        process = False
        with open(self.file_name, 'r') as fpio:
            ln = fpio.readline()
            while ln:
                if cnt == start:
                    process = True
                if process:
                    self.parse_line(ln)
                if cnt == end:
                    break
                cnt += 1
                ln = fpio.readline()


class ImagesFromCdnData(object):
    def __init__(self, data_dir):
        self.data_dir = data_dir

    def __call__(self, *a, **kw):
        from glob import glob
        return [k.split('.json')[-2].split('/'[-1])[-1] for k in glob('%s/*.json' % self.data_dir)]


class GigGeneratorWordnet(object):
    def __init__(self, wdn: WordnetParser, img: ImagesFromCdnData):
        self.wdn = wdn
        self.img = img
        self.wdn.on_interest_callback = self.on_interest
        self.images_hashes = img()
        self.gigs = list()

    def on_interest(self, tags=None, title=None, description=None):
        price = randint(1, 7000)
        lock = randint(1, 99)
        category = CATEGORIES[randint(0, 6)]
        if not self.images_hashes:
            self.images_hashes = self.img()
        self.gigs.append(
            {'title': title,
             'model': 'Gig',
             'image_hash': self.images_hashes.pop(),
             'description': description,
             'category': category,
             'general_domain_of_expertise': category,
             'tags': tags[0],
             'price': price,
             'lock': lock,
             })

    def gen_a(self):
        self.wdn.load(1000, 2000)

    def gen_from_range(self, s, e):
        self.wdn.load(s, e)
        return e-s

