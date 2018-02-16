
# bundle for
#  dl collection (dl on dht)
#  indexer
#  indexer config (what and how to index)
#  garbage collector ?
#  event plugin ?
#  web dht endpoints
#  web index endpoints
#  swagger defs endpoints
#  doc model

from webdht.double_linked import instance_dl
from kadem.kad import DHTFacade
from datetime import datetime
# from ert_profile import EthearnalProfileController
from toolkit.kadmini_codec import hash_from_st, value_protocol, guid_hex_to_bin, guid_key_composer
from toolkit.tools import ErtLogger, Print, default_value


class DocumentCollectionCRD(object):

    def __init__(self,
                 collection_name: str,
                 dhf: DHTFacade,
                 own_guid_hex,
                 key_composer=None,
                 logger=None,
                 ):

        self.collection_name = collection_name
        self.collection_name_present = '.%s.present' % collection_name
        self.collection_name_deleted = '.%s.deleted' % collection_name
        self.model_class_name = '.%s.model' % collection_name
        self.own_guid_hex = own_guid_hex
        self.dhf = dhf
        self._key_compose = key_composer
        self.logger = default_value(logger, ErtLogger(logger=Print()))

        self.dl_deleted = instance_dl(
            dhf=dhf,
            hex=self.own_guid_hex,
            collection_name=self.collection_name_deleted
        )
        self.dl_present = instance_dl(
            dhf=dhf,
            hex=self.own_guid_hex,
            collection_name=self.collection_name_present
        )

    def default_key_composer(self):
        st = datetime.utcnow().isoformat() # + self.own_guid_hex
        key = st
        return key

    @property
    def key_composer(self):
        if self._key_compose:
            return self._key_compose()
        else:
            return self.default_key_composer()

    def create(self, data: dict):
        data['owner_guid'] = self.own_guid_hex
        data['model'] = self.model_class_name
        self.dl_present.insert(self.key_composer, data)

    def delete(self, hkey: str):
        item = self.dl_present.delete(key='', hkey=hkey)
        if item:
            d = item.to_dict()
            self.dl_deleted.insert(item.key, item.to_dict())
            return d

    def _add_hkeys(self, data):
        if 'next_key' in data:
            nxkey = data['next_key']
            if nxkey:
                data['next_key_hk'] = guid_key_composer(key=nxkey, guid_hex=self.own_guid_hex)
        if 'prev_key' in data:
            prkey = data['prev_key']
            if prkey:
                data['prev_key_hk'] = guid_key_composer(key=prkey, guid_hex=self.own_guid_hex)
        return data

    def read(self, key=None, hkey=None, deleted=False):
        dl = self.dl_present
        if deleted:
            dl = self.dl_deleted
        data = None
        if hkey:
            data = dl.get_item(key='', hk_key=hkey).to_dict()
        elif key:
            data = dl.get_item(key=key, hk_key=None).to_dict()
        if data:
            return self._add_hkeys(data)

    @property
    def tail(self, deleted=False):
        return self.read(key=self.dl_present.last_key, deleted=deleted)

    @property
    def head(self, deleted=False):
        return self.read(key=self.dl_present.first_key, deleted=deleted)

    def items(self, paginate=0, from_key=None, from_hkey=None, inverted=True, deleted=False):
        dl = self.dl_present
        if deleted:
            dl = self.dl_deleted
        return dl.iter_items(from_hkey=from_hkey, from_key=from_key, inverted=inverted, paginate=paginate)

    def items_data(self, paginate=0, from_key=None, from_hkey=None, inverted=True, deleted=False):
        return [self._add_hkeys(k.to_dict()) for k in self.items(from_key=from_key,
                                                                 from_hkey=from_hkey,
                                                                 inverted=inverted,
                                                                 deleted=deleted,
                                                                 paginate=paginate)]



