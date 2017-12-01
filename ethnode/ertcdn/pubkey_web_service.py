from ertcdn.pubkey import CdnBinResourceVeritasApi


class ResourceFieldsMeta(object):
    DATA = 'dta'
    CONTENT_TYPE = 'cty'
    CONTENT_ENCODING = 'cte'
    DATA_SIG = 'sig'
    OWNER_HASH = 'own'


RM = ResourceFieldsMeta


class CdnBinResourceBsonApiCherry(object):
    exposed = True

    def __init__(self, cherrypy,
                 api: CdnBinResourceApi,
                 veritas: CdnBinResourceVeritasApi,
                 endpoint_path: str,
                 mount=False):
        self.api = api
        self.veritas = veritas
        self.endpoint_path = endpoint_path
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    @staticmethod
    def decode_body(body):
        try:
            d = bson.dumps(body)
            if RM.DATA in d and RM.CONTENT_TYPE in d:
                if RM.OWNER_HASH in d:
                    if RM.CONTENT_ENCODING in d and RM.CONTENT_TYPE in d:
                        return d
            # todo msg require fields
        except:
            print('decoding of bson faild')

    def GET(self, q: str):
        try:
            pk_hash_bin = guid_hex_to_bin(q)
            bin_rs, content_type, content_encoding = self.api.read(pk_hash=pk_hash_bin)
            if bin_rs:
                self.cherrypy.response.headers['Content-Type'] = content_type
                self.cherrypy.response.headers['Content-Encoding'] = content_encoding
                self.cherrypy.response.status = 200
                return bin_rs
            else:
                self.cherrypy.response.status = 400
                return b'null'
            # return bin_rs
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def POST(self):
        try:
            body = self.cherrypy.request.body.read()
            if body:
                d = self.decode_body(body)
                if d:
                    verified = self.veritas(d[RM.OWNER_HASH], d[RM.DATA], d[RM.DATA_SIG])
                    if verified:
                        pk_bin = self.api.create(data=d[RM.DATA],
                                                 owner_hash=d[RM.OWNER_HASH],
                                                 resource_signature=d[RM.DATA_SIG],
                                                 content_type=d[RM.CONTENT_TYPE],
                                                 content_encoding=d[RM.CONTENT_ENCODING])
                        pk_hex = guid_bin_to_hex(pk_bin)
                        self.cherrypy.response.status = 201
                        return pk_hex
                    else:
                        print('integrity fail')
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