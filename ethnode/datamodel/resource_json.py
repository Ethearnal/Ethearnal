from datamodel.resource_sqlite import ResourceSQLite
# from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from crypto.signer import SignerInterface
# from toolkit.kadmini_codec import sha256_bin_digest
from toolkit.kadmini_codec import guid_hex_to_bin, guid_bin_to_hex
import traceback


class BinResource(object):
    def __init__(self,
                 data_store: ResourceSQLite,
                 content_type: bytes=b'application/json',
                 content_encoding: bytes=b'identity'):
        self.data_store = data_store
        # self.signer = signer
        self.content_type = content_type
        self.content_encoding = content_encoding

    def create(self, json_data: bytes, owner_hash: bytes, resource_signature: bytes,
               content_type=None,
               content_encoding=None,
               ):
        if not content_type:
            content_type = self.content_type
        if not content_encoding:
            content_encoding = self.content_encoding

        pk_hash = self.data_store.create_resource(owner_hash,
                                                  resource_signature,
                                                  content_type,
                                                  content_encoding,
                                                  json_data)
        return pk_hash

    def read(self, pk_hash):
        c = self.data_store.read_resource(pk_hash)
        return c.fetchone()

    def hashid_list(self, owner_hash):
        ll = self.data_store.list_by_owner(owner_hash)
        if ll:
            return [guid_bin_to_hex(k[0]).decode() for k in ll]

    def delete(self, pk_hash):
        res = self.read(pk_hash)
        if res:
            self.data_store.delete_resource(pk_hash)
            return res
        return res


class BinResourceLocalApi(object):
    def __init__(self, jsr: BinResource, signer: SignerInterface):
        self.signer = signer
        self.jsr = jsr

    def create(self, js_data: bin,
               content_type=None, content_encoding=None):
        bin_sig = self.signer.sign(js_data)
        if not content_type:
            content_type = self.jsr.content_type
        if not content_encoding:
            content_encoding = self.jsr.content_encoding

        r = self.jsr.create(
            js_data, self.signer.owner, bin_sig,
            content_type=content_type,
            content_encoding=content_encoding
        )
        return r

    # todo signature verification
    def query(self, pk_hash, verify=False):
        res = self.jsr.read(pk_hash)
        if res:
            data = res[-1]
            content_encoding = res[-2].decode('utf-8')
            content_type = res[-3].decode('utf-8')
            return data, content_type, content_encoding
        else:
            return None, None, None

    def hashid_list(self):
        import json
        ll = self.jsr.hashid_list(self.signer.owner)
        js = json.dumps(ll)
        return js.encode(encoding='utf-8')

    def delete(self, pk_hash):
        res = self.jsr.delete(pk_hash)
        if res:
            data = res[-1]
            content_encoding = res[-2].decode('utf-8')
            content_type = res[-3].decode('utf-8')
            return data, content_type, content_encoding
        else:
            return None, None, None


class GigResourceWebLocalApi(object):
    exposed = True

    def __init__(self, cherrypy, api: BinResourceLocalApi, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def GET(self, q: str):
        try:
            pk_hash_bin = guid_hex_to_bin(q)
            bin_rs, content_type, content_encoding = self.api.query(pk_hash=pk_hash_bin)
            self.cherrypy.response.status = 200
            if bin_rs:
                return bin_rs
            else:
                self.cherrypy.response.status = 400
                return b'null'
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def POST(self):
        try:
            body = self.cherrypy.request.body.read()
            if body:
                pk_bin = self.api.create(body)
                pk_hex = guid_bin_to_hex(pk_bin)
                self.cherrypy.response.status = 201
                return pk_hex
            self.cherrypy.response.status = 400
            return b'null'
        except:
            traceback.print_exc()
            self.cherrypy.response.status = 400
            return b'null'

    def DELETE(self, q):
        try:
            pk_hash_bin = guid_hex_to_bin(q)
            bin_rs, content_type, content_encoding = self.api.delete(pk_hash=pk_hash_bin)
            self.cherrypy.response.status = 200
            return bin_rs
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            '/api/v1/my/gig/', {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class GigsMyResourceWebLocalApi(object):
    exposed = True

    def __init__(self, cherrypy, api: BinResourceLocalApi, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def GET(self):
        try:
            bin_rs = self.api.hashid_list()
            self.cherrypy.response.status = 200
            return bin_rs
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b''

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            '/api/v1/my/gigs/', {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class ImageResourceWebLocalApi(object):
    exposed = True

    def __init__(self, cherrypy, api: BinResourceLocalApi, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def GET(self, q: str):
        try:
            pk_hash_bin = guid_hex_to_bin(q)
            bin_rs, content_type, content_encoding = self.api.query(pk_hash=pk_hash_bin)
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
                content_type = self.cherrypy.request.headers['Content-Type'].encode('utf8')
                content_encoding='identity'.encode('utf-8')
                pk_bin = self.api.create(body, content_type=content_type, content_encoding=content_encoding)
                pk_hex = guid_bin_to_hex(pk_bin)
                self.cherrypy.response.status = 201
                return pk_hex
            self.cherrypy.response.status = 400
            return b'null'
        except:
            traceback.print_exc()
            self.cherrypy.response.status = 400
            return b'null'

    def DELETE(self, q):
        try:
            pk_hash_bin = guid_hex_to_bin(q)
            bin_rs, content_type, content_encoding = self.api.delete(pk_hash=pk_hash_bin)
            if bin_rs:
                self.cherrypy.response.headers['Content-Type'] = content_type
                self.cherrypy.response.headers['Content-Encoding'] = content_encoding
                self.cherrypy.response.status = 200
                return bin_rs
            else:
                self.cherrypy.response.status = 400
                return b'null'
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            '/api/v1/my/img/', {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class ResourceImagesWebLocalApi(object):
    exposed = True

    def __init__(self, cherrypy, api: BinResourceLocalApi, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def GET(self):
        try:
            bin_rs = self.api.hashid_list()
            self.cherrypy.response.status = 200
            return bin_rs
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            '/api/v1/my/imgs/', {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )