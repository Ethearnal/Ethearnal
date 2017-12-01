from datamodel.pubkey_sqlite import PubkeySQLite
from toolkit.kadmini_codec import verify_message


class CdnBinResourceVeritasApi(object):
    def __init__(self,
                 data_store: PubkeySQLite,
                 veritas=None):
        self.data_store = data_store
        # self.signer = signer

    def __call__(self, own_hash: bytes, data: bytes, sig: bytes):
        t = self.data_store.read(own_hash).fetchone()
        if t:
            pub_der = t[1]
            return verify_message(data, sig, pub_der)
        return False

    def create(self, pubkey: bytes):
        pass

    def read(self, pk_hash: bytes):
        pass
