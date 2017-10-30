import json


class CrudJsonStore(object):

    def __init__(self, fname, dic=None, lst=None,):
        if not dic:
            self._d = dict()
        else:
            self._d = dic

        if not lst:
            self._l = list()
        else:
            self._l = lst
        self.fname = fname

    def commit(self):
        self.dump()

    def dump(self):
        d = dict()
        d['dict'] = self._d
        d['list'] = self._l
        js = json.dumps(d, ensure_ascii=False)
        with open(self.fname, 'w') as fp:
            fp.write(js)

    def load(self):
        with open(self.fname, 'r') as fp:
            js = fp.read()
            d = json.loads(js)
            self._d = d['dict']
            self._l = d['list']

    def create(self, o, key):
        self._l.append(o)
        self._d[key] = len(self._l) - 1

    def __contains__(self, item):
        if item in self._d:
            return True
        else:
            return False

    def read_by_idx(self, idx):
        return self._l[idx]

    def read_by_key(self, key):
        return self.read_by_idx(self._d[key])

    def update_by_idx(self, idx, val):
        self._l[idx] = val

    def update_by_key(self, key, val):
        self.update_by_idx(self._d[key], val)

    def delete_by_key(self, key):
        idx = self._d[key]
        del self._l[idx]
        del self._d[key]

    def read_list(self):
        return self._l
