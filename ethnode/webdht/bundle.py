
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
from toolkit.kadmini_codec import hash_from_st, value_protocol, guid_hex_to_bin, guid_key_composer, guid_int_to_hex
from toolkit.tools import ErtLogger, Print, default_value
from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from datamodel.resource_index import ResourceIndexingEngine
from toolkit.store_handler import DHTStoreHandlerOne


class DocumentIndexer(object):
    def __init__(self,
                 db_name,
                 table_name,
                 logger=None,
                 ):
        self.db = InvIndexTimestampSQLite(
            db_name=db_name,
            table_name=table_name,
        )
        self.idx = ResourceIndexingEngine(self.db)
        self.logger = default_value(logger, ErtLogger(logger=Print()))

    def index_field(self,
                    container_hk_hex,
                    specifier,
                    text_data,
                    prefixes=True,
                    ert_tokens_major=0,
                    ert_tokens_minor=0,
                    q1: int = 0,
                    q2: int = 0,
                    ):
        try:
            pk_bin = guid_hex_to_bin(container_hk_hex)
            self.idx.index_bag_of_spec_text(
                container_hash=pk_bin,
                specifier=specifier,
                text_data=text_data,
                prefixes=prefixes,
                ert_tokens_major=ert_tokens_major,
                ert_tokens_minor=ert_tokens_minor,
                q1=q1,
                q2=q2)

            self.logger('INDEXED', container_hk_hex, specifier)
        except Exception as e:
            self.logger('ERR IDX FAILED', specifier, text_data, str(e))

    def unindex(self, hk_hex):
        try:
            pk_bin = guid_hex_to_bin(hk_hex)
            self.idx.unindex(pk_bin)
        except Exception as e:
            self.logger('UNINDEX FAILED', e)


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
        st = datetime.utcnow().isoformat()  # + self.own_guid_hex
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


class GigJobIndexer(object):
    def __init__(self, indexer: DocumentIndexer, logger=None):
        self.logger = default_value(logger, ErtLogger(Print()))
        self.indexer = indexer

    def index(self, hk_hex: str, data: dict):
        self.logger('INDEX', hk_hex, data)
        print('hk_hex',hk_hex)
        text = ''
        q1 = 0
        q2 = 0

        if 'price' in data:
            q1 = int(data['price'])
            print('Q1', q1)
        if 'title' in data:
            text = data['title']
        if 'description' in data:
            text += ' ' + data['description']
        if text.strip() != '':
            # pass
            self.indexer.index_field(hk_hex, 'text', text_data=text, q1=q1, q2=q2)
        if 'tags' in data:
            self.indexer.index_field(hk_hex, 'tags', text_data=' '.join(data['tags']),
                                     prefixes=False,
                                     q1=q1, q2=q2)
        if 'owner_guid' in data:
            self.indexer.index_field(hk_hex, 'owner_guid',
                             text_data=data['owner_guid'], prefixes=False, q1=q1, q2=q2)
        if 'category' in data:
            self.indexer.index_field(hk_hex, 'category',
                             text_data=data['category'], prefixes=False, q1=q1, q2=q2)

    def unindex(self, hk_hex: str):
        self.indexer.unindex(hk_hex)


class DocModelIndexers(object):
    MODEL_INDEXERS = {
        '.Gig.model': (GigJobIndexer, DocumentIndexer('gig.index.db', 'gig_index'))
    }

    def __init__(self, doc_indexer: DocumentIndexer):
        self.indexer = doc_indexer

    def index_or_unindex_data(self, hk_int, data):
        hk_hex = guid_int_to_hex(hk_int)
        if 'value' in data:
            value_data = data['value']
            if not isinstance(value_data, dict):
                return None
        else:
            return None
        # if isinstance(value_data, dict):
        if 'model' in value_data:
            if value_data['model'] in self.MODEL_INDEXERS:
                model_name = value_data['model']
                indexer_class = self.MODEL_INDEXERS[model_name][0]
                indexer_engine = self.MODEL_INDEXERS[model_name][1]
                idxr = indexer_class(indexer_engine)
                if 'deleted' in value_data:
                    idxr.unindex(hk_hex)
                    return False
                else:
                    idxr.index(hk_hex, value_data)
                    return True
        return None


class DHTEventHandler(object):
    def __init__(self,
                 store_handler: DHTStoreHandlerOne,
                 logger=None,
                 doc_indexer=None,
                 ):
        self.logger = default_value(logger, ErtLogger(Print()))
        self.store_handler = store_handler
        self.store_handler.on_pull_handle = self.on_pull
        self.store_handler.on_push_handle = self.on_push
        self.doc_indexers = DocModelIndexers(doc_indexer)

    def on_push(self, hk, data):
        # todo try
        self.doc_indexers.index_or_unindex_data(hk_int=hk, data=data)

    def on_pull(self, hk, data):
        # todo try
        self.doc_indexers.index_or_unindex_data(hk_int=hk, data=data)


