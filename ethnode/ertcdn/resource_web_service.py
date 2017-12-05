import traceback
from toolkit.kadmini_codec import guid_hex_to_bin, guid_bin_to_hex
from ertcdn.resource_api_interface import CdnBinResourceApiInterface
from ertcdn.resource_model import SignedBinResource
from ertcdn.pubkey import CdnBinResourceVeritasApi
import bson
import json

class ResourceFieldsMeta(object):
    DATA = 'dta'
    CONTENT_TYPE = 'cty'
    CONTENT_ENCODING = 'cte'
    DATA_SIG = 'sig'
    OWNER_HASH = 'own'
    ORG_RES_HASH = 'rsh'


RM = ResourceFieldsMeta


class ResourceBsonCodec(object):
    @staticmethod
    def decode(data: bytes):
        try:
            d = bson.loads(data)
            if RM.DATA in d and RM.CONTENT_TYPE in d:
                if RM.OWNER_HASH:
                    if RM.CONTENT_ENCODING in d and RM.CONTENT_TYPE in d:
                        return d
            # todo msg require fields
            print('fields missing')
        except:
            print('decoding of bson fail')

    @staticmethod
    def encode(d: dict):
        try:
            if RM.DATA in d and RM.CONTENT_TYPE in d:
                if RM.OWNER_HASH in d:
                    if RM.CONTENT_ENCODING in d and RM.CONTENT_TYPE in d:
                        return bson.dumps(d)
            # todo msg require fields
            print('fields missing')
        except:
            print('encoding of bson fail')


class CdnBinResourceListBsonApiCherry(object):
    exposed = True

    def __init__(self, cherrypy,
                 api: CdnBinResourceApiInterface,
                 endpoint_path: str,
                 mount=True):
        self.api = api
        self.endpoint_path = endpoint_path
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def GET(self):
        ll = self.api.hashid_list_all()
        js = json.dumps(ll, ensure_ascii=False)
        return js.encode()

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            self.endpoint_path, {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class CdnBinResourceBsonApiCherry(object):
    exposed = True

    def __init__(self, cherrypy,
                 api: CdnBinResourceApiInterface,
                 endpoint_path: str,
                 codec=ResourceBsonCodec(),
                 mount=False):

        self.codec = codec
        self.api = api
        self.endpoint_path = endpoint_path
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def GET(self, q: str):
        try:
            res = self.api.read(pk_hex_hash=q)
            if res:
                d = dict()
                d[RM.DATA_SIG] = res.sig_bin
                d[RM.DATA] = res.data_bin
                d[RM.CONTENT_ENCODING] = res.content_encoding
                d[RM.CONTENT_TYPE] = res.content_type
                d[RM.OWNER_HASH] = res.owner_bin
                d[RM.ORG_RES_HASH] = res.orig_res_hash
                bs_data = self.codec.encode(d)
                if bs_data:
                    # self.cherrypy.response.headers['Content-Type'] = res.content_type_str
                    # self.cherrypy.response.headers['Content-Encoding'] = res.content_encoding_str
                    return bs_data
            self.cherrypy.response.status = 404
            return b'null'
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def POST(self):
        try:
            body = self.cherrypy.request.body.read()
            if body:
                d = self.codec.decode(body)
                if d:
                    res = SignedBinResource()
                    res.data_bin = d[RM.DATA]
                    res.owner_bin = d[RM.OWNER_HASH]
                    res.sig_bin = d[RM.DATA_SIG]
                    res.content_type = d[RM.CONTENT_TYPE]
                    res.content_encoding = d[RM.CONTENT_ENCODING]
                    # res.orig_res_hash = d[RM.ORG_RES_HASH]
                    pk_hex = self.api.create(res)
                    self.cherrypy.response.status = 201
                    return pk_hex
                else:
                    print('bson decode fail')
            self.cherrypy.response.status = 400
            return b'null'
        except:
            traceback.print_exc()
            self.cherrypy.response.status = 400
            return b'null'

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            self.endpoint_path, {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )