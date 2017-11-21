from datamodel.resource_sqlite import ResourceSQLite
from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from crypto.signer import SignerInterface
from toolkit.kadmini_codec import sha256_bin_digest


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
    def read(self, pk_hash, verify=False):
        res = self.jsr.read(pk_hash)
        return res

    def delete(self, pk_hash):
        res = self.jsr.delete(pk_hash)
        return res


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
        res = self.read()
        c = self.data_store.delete_resource(pk_hash)
        return res


