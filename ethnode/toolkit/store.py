import os
import json


class CrudJsonStore(object):

    def __init__(self, fname, dic=None, lst=None,):
        self._db = dict()

        if not dic:
            self._db['dict'] = dict()
        else:
            self._db['dict'] = dic

        if not lst:
            self._db['list'] = list()
        else:
            self._db['list'] = lst

        self.fname = fname
        if not os.path.isfile(self.fname):
            self.dump()
        else:
            self.load()

    def commit(self):
        self.dump()

    def dump(self):
        js = json.dumps(self._db, ensure_ascii=False)
        js_bts = js.encode('utf-8')
        with open(self.fname, 'wb') as fp:
            fp.write(js_bts)

    def load(self):
        with open(self.fname, 'rb') as fp:
            js_bts = fp.read()
            js = js_bts.decode('utf-8')
            self._db = json.loads(js)
        return js_bts

    def create(self, o, key):
        if key not in self._db['dict']:
            self._db['list'].append(o)
            self._db['dict'][key] = len(self._db['list']) - 1
            return 201
        else:
            return 200

    def __contains__(self, item):
        if item in self._db['dict']:
            return True
        else:
            return False

    def read_by_idx(self, idx):
        return self._db['list'][idx]

    def read_by_key(self, key):
        return self.read_by_idx(self._db['dict'][key])

    def update_by_idx(self, idx, val):
        self._db['list'][idx] = val

    def update_by_key(self, key, val):
        self.update_by_idx(self._db['dict'][key], val)

    def delete_by_key(self, key):
        idx = self._db['dict'][key]
        del self._db['list'][idx]
        del self._db['dict'][key]

    def read_list(self):
        return self._db['list']

    def read_dict(self):
        return self._db['dict']
