from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from toolkit.kadmini_codec import sha256_bin_digest, guid_hex_to_bin
import json
import traceback

CONTAINER_HASH_KEY = 'documentHashId'
FIELD_NAME = 'fieldName'
FIELD_TEXT = 'fieldText'
ALL_FIELDS = (CONTAINER_HASH_KEY, FIELD_NAME, FIELD_TEXT)


class ResourceIndexingEngine(object):
    def __init__(self,
                 index_store: InvIndexTimestampSQLite
                 ):
        self.index_store = index_store

    @staticmethod
    def component_hash(specifier: str, prfx: str):
        spec_word = '%s::%s' % (specifier, prfx)
        bts = spec_word.encode(encoding='utf-8')
        return sha256_bin_digest(bts)

    def index_bag_of_filters(self,
                             container_hash: bytes,
                             filters: dict,
                             q1: int=0, q2: int=0):
        filter_set = set()
        for k, v in filters.items():
            cmp_hash = self.component_hash(k, v)
            filter_set.add(cmp_hash)
        for cm_hash in filter_set:
            self.index_store.create(cm_hash, container_hash, q1=q1, q2=q2)
        self.index_store.commit()

    def index_bag_of_spec_text(self,
                               container_hash: bytes,
                               specifier: str,
                               text_data: str,
                               q1: int = 0,
                               q2: int = 0, ):
        words = text_data.lower().split(' ')
        words_set = set(words)
        prefix_set = set()
        for word in words_set:
            for i in range(1, len(word)+1):
                prefix_set.add(word[:i])
        for item in prefix_set:
            cmp_hash = self.component_hash(specifier, item)
            self.index_store.create(cmp_hash, container_hash, q1=q1, q2=q2)
        self.index_store.commit()

    def unindex(self, container_hash: bytes):
        self.index_store.delete_components_by_container(container_hash)
        self.index_store.commit()


class TextIndexingApi(object):
    def __init__(self, idx_engine: ResourceIndexingEngine):
        self.idx_engine = idx_engine

    def index(self, body: bytes):
        body_str = body.decode('utf-8')
        d = json.loads(body_str)
        if FIELD_NAME not in d:
            if CONTAINER_HASH_KEY not in d:
                if FIELD_TEXT not in d:
                    raise Exception('Please supply an JSON object with all fields set %s %s %s'
                                    % ALL_FIELDS)

        ctx_bin_hash = guid_hex_to_bin(d[CONTAINER_HASH_KEY])
        specifier = d[FIELD_NAME]
        text_data = d[FIELD_TEXT]

        self.idx_engine.index_bag_of_spec_text(
            container_hash=ctx_bin_hash,
            specifier=specifier,
            text_data=text_data
        )

    def unindex(self, container_hash_hex: str):
        ctx_bin_hash = guid_hex_to_bin(container_hash_hex)
        self.idx_engine.unindex(ctx_bin_hash)
        pass


class TextIndexingWebApi(object):
    exposed = True

    def __init__(self, cherrypy, api: TextIndexingApi, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        if mount:
            self.mount()

    def POST(self):
        try:
            body = self.cherrypy.request.body.read()
            if body:
                self.api.index(body)
                self.cherrypy.response.status = 201
                return b'true'

            self.cherrypy.response.status = 400
            return b'null'
        except:
            traceback.print_exc()
            self.cherrypy.response.status = 400
            return b'null'

    def DELETE(self, q):
        try:
            self.api.unindex(q)
            self.cherrypy.response.status = 200
            return b'true'
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            '/api/v1/my/idx/text/', {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class TextIndexApiBundle(object):
    def __init__(self, db_file_name: str, cherrypy_mod):
        self.store = InvIndexTimestampSQLite(
            db_name=db_file_name,
            table_name='idx_text',
        )
        self.engine = ResourceIndexingEngine(index_store=self.store)
        self.api = TextIndexingApi(idx_engine=self.engine)
        self.webapi = TextIndexingWebApi(self.api, cherrypy_mod)
