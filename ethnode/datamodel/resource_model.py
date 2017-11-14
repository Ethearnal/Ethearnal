import datetime
import hashlib
import dateutil.parser

resource_bson_model = {
    b'ty': b'',
    b'rn': b'',
    b'cn': b'',
    b'rd': b'',
    b'idn': b'',
    b'tc': b'',
    b'ta': b'',
    b'tu': b'',
}


class ResourceType(object):
    JSON = b'json'
    BIN = b'bin'
    HTML = b'html'
    JS = b'js'
    CSS = b'css'
    PY = b'python'


class BaseResource(object):
    def __init__(self,
                 res_type: bytes,
                 res_name: bytes,
                 res_data: bytes,
                 collection_name: bytes,
                 instance_id: bytes,

                 ):
        self.res_type = res_type
        self.res_name = res_name
        self.collection_name = collection_name
        self.instance_id = instance_id
        self.res_data = res_data

    def from_base_data(self, d):
        self.res_type = d[b'ty']
        self.res_name = d[b'rn']
        self.collection_name = d[b'cn'],
        self.instance_id = d[b'idn'],
        self.res_data = d[b'rd']

    @property
    def to_base_data(self):
        return {
            b'ty': self.res_type,
            b'rn': self.res_name,
            b'cn': self.collection_name,
            b'idn': self.instance_id,
            b'rd': self.res_data
        }


class BaseResourceTime(object):
    def from_time_data(self, d):

        self.time_created = d[b'tc']
        self.time_accessed = d[b'ta']
        self.time_updated = d[b'tu']

    def __init__(self,
                 time_created: bytes,
                 time_accessed: bytes,
                 time_updated: bytes,
                 ):
        self.time_created = time_created
        self.time_accessed = time_accessed
        self.time_updated = time_updated

    @property
    def to_time_data(self):
        return {
            b'tc': self.time_created,
            b'ta': self.time_accessed,
            b'tu': self.time_updated,
        }


class ResourceBinary(BaseResource, BaseResourceTime):
    def __init__(self, data_bytes,
                 res_type: str,
                 collection_name: str,
                 resource_name: str,
                 instance_id: bytes = None):

        tc = datetime.datetime.now().isoformat().encode(encoding='ascii')
        rn = resource_name.encode(encoding='utf-8')
        cn = collection_name.encode(encoding='utf-8')
        ty = res_type.encode(encoding='ascii')
        if not instance_id:
            in_id = hashlib.sha256(data_bytes).digest()
        else:
            in_id = instance_id

        BaseResource.__init__(self,
                              res_type=ty,
                              res_name=rn,
                              res_data=data_bytes,
                              collection_name=cn,
                              instance_id=in_id)

        BaseResourceTime.__init__(self,
                                  tc,
                                  tc,
                                  tc)

    @property
    def c_name(self):
        return self.collection_name.decode(encoding='utf-8')

    @property
    def r_name(self):
        return self.res_name.decode(encoding='utf-8')

    @property
    def r_type(self):
        return self.res_type.decode(encoding='ascii')

    @property
    def time_c(self):
        iso = self.time_created.decode(encoding='ascii')
        return dateutil.parser.parse(iso)

    @property
    def to_data(self):
        data = dict()
        data.update(self.to_time_data)
        data.update(self.to_base_data)
        return data

    def from_data(self, d):
        self.from_base_data(d)
        self.from_time_data(d)
