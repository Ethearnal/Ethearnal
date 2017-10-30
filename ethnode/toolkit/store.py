import os
import json


class CrudJsonListStore(object):

    def __init__(self, fname, lst=None,):
        if not lst:
            self._ls = list()

        self.fname = fname
        if not os.path.isfile(self.fname):
            self.dump()
        else:
            self.load()

    def commit(self):
        return self.dump()

    def dump(self):
        js = json.dumps(self._ls, ensure_ascii=False)
        js_bts = js.encode('utf-8')
        with open(self.fname, 'wb') as fp:
            fp.write(js_bts)
        return js

    def load(self):
        if not os.path.isfile(self.fname):
            self.dump()
        with open(self.fname, 'rb') as fp:
            js_bts = fp.read()
            js = js_bts.decode('utf-8')
            self._ls = json.loads(js)
        return js_bts

    def create(self, d):
        self._ls.append(d)
        return 200

    def read(self, idx):
        return self._ls[idx]

    def update(self, idx, d):
        self._ls[idx] = d

    def delete(self, idx):
        del self._ls[idx]

    def read_list(self):
        return self._ls


