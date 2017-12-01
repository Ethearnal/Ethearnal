from ertcdn.resource_model import SignedBinResource


class CdnBinResourceApiInterface(object):
    def create(self,
               res: SignedBinResource
               ) -> str:
        pass

    def read(self, pk_hex_hash: str) -> SignedBinResource:
        pass

