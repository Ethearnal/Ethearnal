from datamodel.resource_sqlite import ResourceSQLite
from ertcdn.resource_api_interface import CdnBinResourceApiInterface
from ertcdn.resource_model import SignedBinResource
from toolkit.kadmini_codec import guid_bin_to_hex
from toolkit.kadmini_codec import guid_hex_to_bin


class CdnBinResourceApiSQlite(CdnBinResourceApiInterface):
    def __init__(self,
                 data_store: ResourceSQLite):
        self.data_store = data_store

    def create(self,
               res: SignedBinResource
               ):
        res.pk_bin = self.data_store.create_resource(res.owner_bin,
                                                     res.sig_bin,
                                                     res.content_type,
                                                     res.content_encoding,
                                                     res.data_bin)
        return res.pk_hex

    def read(self, pk_hex_hash: str):
        pk_hash = guid_hex_to_bin(pk_hex_hash)
        print(pk_hex_hash, pk_hash)
        c = self.data_store.read_resource(pk_hash)
        if c:
            t = c.fetchone()
            if t:
                pk_hash, owner_hash, resource_hash, resource_own_sig, \
                    content_type_bin, content_encoding_bin, resource_data_bin = t
                res = SignedBinResource()
                res.pk_bin = pk_hash
                res.owner_bin = owner_hash
                res.content_type = content_type_bin.decode()
                res.content_encoding = content_encoding_bin.decode()
                res.data_bin = resource_data_bin
                res.orig_res_hash = resource_hash
                return res

    def hashid_list_all(self):
        ll = self.data_store.list_all()
        if ll:
            return [guid_bin_to_hex(k[0]).decode() for k in ll]

    def hashid_list(self, owner_hash):
        ll = self.data_store.list_by_owner(owner_hash)
        if ll:
            return [guid_bin_to_hex(k[0]).decode() for k in ll]

    def hashid_list_bin(self, owner_hash):
        ll = self.data_store.list_by_owner(owner_hash)
        if ll:
            return [k[0] for k in ll]

    # def delete(self, pk_hash):
    #     res = self.read(pk_hash)
    #     if res:
    #         self.data_store.delete_resource(pk_hash)
    #         return res
    #     return res
