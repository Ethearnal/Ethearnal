from ertcdn.resource_model import SignedBinResource


class CdnBinResourceApiInterface(object):
    def create(self,
               res: SignedBinResource
               ) -> str:
        pass

    def read(self, pk_hex_hash: str) -> SignedBinResource:
        pass

    def hashid_list(self, owner_hash) -> list:
        pass

    def hashid_list_all(self) -> list:
        pass

