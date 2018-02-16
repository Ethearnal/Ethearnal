
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

import os
from webdht.double_linked import instance_dl
from kadem.kad import DHTFacade
from datetime import datetime
# from ert_profile import EthearnalProfileController
from toolkit.kadmini_codec import hash_from_st, value_protocol
from toolkit.kadmini_codec import guid_hex_to_bin, guid_key_composer, guid_int_to_hex
from toolkit.kadmini_codec import guid_bin_to_hex2
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
        self.idx = self.indexer.idx

    def index(self, hk_hex: str, data: dict):
        self.logger('INDEX', hk_hex, data)
        print('hk_hex', hk_hex)
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

# todo event collection model and index
EventActionModelIndexer = GigJobIndexer
# todo sent mail, recived mail Mail model and indexes
SentMailModelIndexer = GigJobIndexer
ReceivedMailModelIndexer = GigJobIndexer
# todo sent/receiced orders Ogig order model
SentGigOrderIndexer = GigJobIndexer
ReceivedGigOrderIndexer = GigJobIndexer
# todo sent/received job applications model
SentJobApplicationIndexer = GigJobIndexer
ReceivedGigOrderIndexerJobApplicationIndexer = GigJobIndexer
# todo
# and WEB endpoints, CRD collections
# status udates


class DocModelIndexers(object):
    def __init__(self, data_dir=None):

        self.MODEL_INDEXERS = {
            '.Gig.model': (GigJobIndexer(DocumentIndexer('%s/gig_idx.db' % data_dir, 'gig_idx'))),
            '.Job.model': (GigJobIndexer(DocumentIndexer('%s/job_idx.db' % data_dir, 'job_idx'))),
            '.EventAction.model': (EventActionModelIndexer(DocumentIndexer('%s/evt_idx.db' % data_dir, 'evt_idx'))),
            '.SentGigOrder.model': (EventActionModelIndexer(DocumentIndexer('%s/sent_gig_order_idx.db' % data_dir,
                                                                            'sent_gig_order'))),
            '.ReceivedGigOrder.model': (EventActionModelIndexer(DocumentIndexer('%s/rcv_gig_order.db' % data_dir,
                                                                                'rcv_gig_idx'))),
            '.SentMail.model': (EventActionModelIndexer(DocumentIndexer('%s/sent_mail_idx.db' % data_dir,
                                                                        'sent_mail'))),
            '.ReceivedMail.model': (EventActionModelIndexer(DocumentIndexer('%s/rcv_mail.db' % data_dir,
                                                                            'rcv_mail'))),
            '.SentJobApp.model': (EventActionModelIndexer(DocumentIndexer('%s/sent_job_app_idx.db' % data_dir,
                                                                          'sent_job_app'))),
            '.ReceivedJobApp.model': (EventActionModelIndexer(DocumentIndexer('%s/rcv_job_app.db' % data_dir,
                                                                              'rcv_job_app'))),
            #
        }
        if not data_dir:
            raise IOError('data_dir is not directory:', data_dir)

    def index_or_unindex_data(self, hk_int, data):
        hk_hex = guid_int_to_hex(hk_int)
        if 'value' in data:
            value_data = data['value']
            if not isinstance(value_data, dict):
                return None
        else:
            return None
        if 'model' in value_data:
            if value_data['model'] in self.MODEL_INDEXERS:
                model_name = value_data['model']
                idxr = self.MODEL_INDEXERS.get(model_name)
                if not idxr:
                    return None
                #
                if 'deleted' in value_data:
                    idxr.unindex(hk_hex)
                    return False
                else:
                    idxr.index(hk_hex, value_data)
                    return True
        return None


class DocModelIndexQuery(object):
    def __init__(self, document_indexer: DocumentIndexer, logger=None):
        if logger:
            self.logger = logger
        else:
            self.logger = ErtLogger(Print())
        self.idx = document_indexer.idx
        self.idx_store = document_indexer.idx.index_store

    def query_terms(self, terms: dict, prefixes=True, limit=30, quantified=False):
        cur = self.idx.qry_terms(terms=terms, prefixes=prefixes, limit=limit)
        if cur:
            if quantified:
                ll = [(guid_bin_to_hex2(t[0]), t[1], t[2], t[3], t[4]) for t in cur.fetchall()]
                return ll
            ll = [guid_bin_to_hex2(t[0]) for t in cur.fetchall()]
            return ll

    def query_terms_d(self, terms_d: dict, limit=1000, quantified=False):
        # todo hard limit in config or remove
        cur = self.idx.qry_terms_d(terms_d, limit=limit)
        if cur:
            if quantified:
                ll = [(guid_bin_to_hex2(t[0]), t[1], t[2], t[3], t[4]) for t in cur.fetchall()]
                return ll

            l1 = list(cur.fetchall())
            ll = [guid_bin_to_hex2(t[0]) for t in l1]
            return ll

    def _qry_dict(self, query_dict, limit=1000, quantified=False):
        try:
            ll = self.query_terms_d(query_dict, limit=limit, quantified=quantified)
            return ll
        except Exception as e:
            self.logger('_qry_dict: failed', e)

    def query_all(self, limit=10, quantified=False):
        cur = self.idx_store.no_component(limit=limit)
        if cur:
            if quantified:
                ll = [(guid_bin_to_hex2(t[0]), t[1], t[2], t[3], t[4]) for t in cur.fetchall()]
                return ll

            else:
                ll = [guid_bin_to_hex2(t[0]) for t in cur.fetchall()]
                return ll

    def _qry_all(self, limit=30, quantified=False):
        try:
            ll = self.query_all(limit, quantified=quantified)
            return ll
        except Exception as e:
            self.logger('_qry_all: failed', e)
            return None

    def _make_qry_dict(self, kw):
        try:
            query_dict = {k.lower(): list(set(v.lower().split(' '))) for k, v in kw.items()}
            return query_dict
        except Exception as e:
            self.logger('_make_qry_dict: failed', e)
            return None

    def query(self, kwargs, quantified=True):
        limit = 100
        if 'limit' in kwargs:
            limit = int(kwargs.pop('limit'))
        if 'q1range' in kwargs:
            q1range = kwargs.pop('q1range')
            p_t = q1range.split(' ')
            print('Q1_range', p_t)
            self.idx_store.analog_range_q1 = p_t
        else:
            self.idx_store.analog_range_q1 = None
        if 'all' in kwargs:
            return self._qry_all(limit, quantified=quantified)
        else:
            q_d = self._make_qry_dict(kwargs)
            if not q_d:
                return None
            else:
                return self._qry_dict(q_d, limit=limit,quantified=quantified)


class DHTEventHandler(object):
    def __init__(self,
                 store_handler: DHTStoreHandlerOne,
                 logger=None,
                 data_dir=None,
                 ):
        self.logger = default_value(logger, ErtLogger(Print()))
        self.store_handler = store_handler
        self.store_handler.on_pull_handle = self.on_pull
        self.store_handler.on_push_handle = self.on_push

        self.data_dir = data_dir
        if not data_dir:
            raise ValueError('Setup data dir for EventHandle index db files')
        self.doc_indexers = DocModelIndexers(data_dir=self.data_dir)

    def on_push(self, hk, data):
        #
        try:
            self.doc_indexers.index_or_unindex_data(hk_int=hk, data=data)
        except Exception as e:
            self.logger('on_push indexing failed', e)
        pass

    def on_pull(self, hk, data):
        #
        try:
            self.doc_indexers.index_or_unindex_data(hk_int=hk, data=data)
        except Exception as e:
            self.logger('on_pull indexing failed', e)


