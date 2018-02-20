from kadem.kad import DHTFacade
from toolkit import kadmini_codec as cdx
from webdht.bundle import DocumentCollectionCRD
from datetime import datetime


class SelfEvent(object):
    def __init__(self, crd: DocumentCollectionCRD):
        self.crd = crd

    def ping(self):
        data = {
            "from_guid": self.crd.own_guid_hex,
            "timestamp": int(datetime.utcnow().timestamp()),
            "kind": 'ping'
        }
        self.crd.create(data)






