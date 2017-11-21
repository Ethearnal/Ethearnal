from datamodel.resource_sqlite import ResourceSQLite
# from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from crypto.signer import SignerInterface
# from toolkit.kadmini_codec import sha256_bin_digest
from toolkit.kadmini_codec import guid_hex_to_bin, guid_bin_to_hex
import traceback


class JsonStringResource(object):
    def __init__(self,
                 data_store: ResourceSQLite,
                 content_type: bytes=b'application/json',
                 content_encoding: bytes=b'utf-8'):
        self.data_store = data_store
        # self.signer = signer
        self.content_type = content_type
        self.content_encoding = content_encoding

    def create(self, json_data: bytes, owner_hash: bytes, resource_signature: bytes):
        pk_hash = self.data_store.create_resource(owner_hash,
                                                  resource_signature,
                                                  self.content_type,
                                                  self.content_encoding,
                                                  json_data)
        return pk_hash

    def read(self, pk_hash):
        c = self.data_store.read_resource(pk_hash)
        return c.fetchone()

    def delete(self, pk_hash):
        res = self.read(pk_hash)
        res_data = res[-1]
        c = self.data_store.delete_resource(pk_hash)
        return res_data


class JsonStringResourceLocalApi(object):
    def __init__(self, jsr: JsonStringResource, signer: SignerInterface):
        self.signer = signer
        self.jsr = jsr

    def create(self, js_data: bin):
        bin_sig = self.signer.sign(js_data)
        r = self.jsr.create(
            js_data, self.signer.owner, bin_sig
        )
        return r

    # todo signature verification
    def query(self, pk_hash, verify=False):
        res = self.jsr.read(pk_hash)
        data = res[-1]
        return data

    def delete(self, pk_hash):
        res = self.jsr.delete(pk_hash)
        return res


class GigResourceWebLocalApi(object):
    exposed = True

    def __init__(self, cherrypy, api: JsonStringResourceLocalApi, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def GET(self, q: str):
        try:
            pk_hash_bin = guid_hex_to_bin(q)
            bin_rs = self.api.query(pk_hash=pk_hash_bin)
            self.cherrypy.response.status = 200
            print(bin_rs)
            return bin_rs
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b''

    def POST(self):
        print('POST MY GIG')
        try:
            body = self.cherrypy.request.body.read()
            if body:
                pk_bin = self.api.create(body)
                pk_hex = guid_bin_to_hex(pk_bin)
                self.cherrypy.response.status = 201
                return pk_hex
            self.cherrypy.response.status = 400
            return b''
        except:
            traceback.print_exc()
            self.cherrypy.response.status = 400
            return b''

    def DELETE(self, q):
        try:
            pk_hash_bin = guid_hex_to_bin(q)
            bin_rs = self.api.delete(pk_hash=pk_hash_bin)
            self.cherrypy.response.status = 200
            print(bin_rs)
            return bin_rs
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b''

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            '/api/v1/my/gig/', {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )