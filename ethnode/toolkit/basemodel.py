import json


def none_cls():
    return None


def blank_st_cls():
    return ''


def empty_ls_cls():
    return list()


class BaseModel(object):

    SPEC_PREFIX = 'spe'
    dict_cls = dict
    list_cls = list
    none_cls = none_cls

    FIELDS_SPEC = {}

    @classmethod
    def get_class(cls):
        return cls

    def to_dict(self):
        # todo key and val codecs
        cls = self.get_class()
        d = self.dict_cls()
        for k in cls.FIELDS_SPEC:
            mtype, codec, default_class = cls.FIELDS_SPEC[k]
            # print(k, '=', mtype, codec, default_class)
            v = getattr(self, k, default_class())
            d[k] = v
        return d

    def from_dict(self, d):
        # todo key and val codecs
        cls = self.get_class()
        for k in cls.FIELDS_SPEC:
            mtype, codec, default_class = cls.FIELDS_SPEC[k]
            if k in d:
                setattr(self, k, d[k])
        return self

    def to_json(self):
        return json.dumps(self.to_dict(), ensure_ascii=False)

    def from_json_st(self, st):
        d = json.loads(st, ensure_ascii=False)
        return self.from_dict(d)

    def from_json_file(self, json_file):
        with open(json_file) as fs:
            d = json.load(fs)
        if not d:
            raise ValueError('Deserialize of %s failed!' % json_file)
        return self.from_dict(d)

    def to_json_file(self, json_file):
        with open(json_file, 'w') as fs:
            json.dump(self.to_dict(), fs, ensure_ascii=False)
