from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from toolkit.kadmini_codec import sha256_bin_digest, guid_hex_to_bin, guid_bin_to_hex
from datamodel.resource_json import BinResourceLocalApi
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

    @staticmethod
    def component_hash_by_term(term):
        bts = term.encode(encoding='utf-8')
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

    @staticmethod
    def prfx_bag_set(text_data):
        prefix_set = set()
        words = text_data.lower().split(' ')
        words_set = set(words)
        for word in words_set:
            for i in range(1, len(word)+1):
                prefix_set.add(word[:i])
        return list(prefix_set)

    def index_bag_of_spec_text(self,
                               container_hash: bytes,
                               specifier: str,
                               text_data: str,
                               q1: int = 0,
                               q2: int = 0, ):

        prefix_set = self.prfx_bag_set(text_data)

        for item in prefix_set:
            cmp_hash = self.component_hash(specifier, item)
            self.index_store.create(cmp_hash, container_hash, q1=q1, q2=q2)
        self.index_store.commit()

    def unindex(self, container_hash: bytes):
        self.index_store.delete_components_by_container(container_hash)
        self.index_store.commit()

    def qry_hashes(self, component_hashes: list):
        if len(component_hashes) == 1:
            return self.index_store.single_component(component_hashes[0])
        else:
            return self.index_store.inner_join_on_component(*component_hashes)

    def qry_terms(self, terms: dict):
        component_hashes_set = set()
        for k, v in terms.items():
            items = self.prfx_bag_set(v)
            for item in items:
                component_hashes_set.add(self.component_hash(k, item))
        component_hashes = list(component_hashes_set)
        if component_hashes:
            return self.qry_hashes(component_hashes)


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


class IndexQueryGenericApi(object):
    def __init__(self, idx_engine: ResourceIndexingEngine,
                 repr_f=None):
        self.engine = idx_engine
        if repr_f:
            self.repr_f = repr_f
        else:
            self.repr_f = lambda x: x

    def query(self, **kwargs):
        for key_spec, val in kwargs.items():
            print('SEARCH QUERY: %s' % key_spec, val)
        c = self.engine.qry_terms(terms=kwargs)
        rs_ls = list()
        if c:
            for item in c:

                if item:
                    ctx_hash = item[2]
                    rep_maj = item[4]
                    # print(rep_maj)
                    # print('-->', item, self.repr_f, self.repr_f(item[0]))
                    rs_ls.append(self.repr_f(ctx_hash, rep_maj=rep_maj))
            return rs_ls
        return None


class IndexQueryApiRepr(object):
    def __new__(cls, *args, **kwargs):
        if 'repr_f' not in kwargs:
            kwargs['repr_f'] = lambda x: x
        return IndexQueryGenericApi(*args, **kwargs)


class ReprHexGuid(object):
    def __call__(self, pk_hash_bin):
        return guid_bin_to_hex(pk_hash_bin).decode('utf-8')


class ReprFNplusOne(object):

    def __init__(self, api: BinResourceLocalApi):
        self.api = api

    def __call__(self, pk_hash_bin, rep_maj=0):
        bin_rs, content_type, content_encoding = self.api.query(pk_hash=pk_hash_bin)
        print('B', bin_rs)
        if bin_rs:
            if content_type != 'application/json':
                print("WARN content type not supported", content_type)
            try:
                d = json.loads(bin_rs.decode('utf-8'))
                d['ownerReputation'] = rep_maj
                return d

            except:
                print("WARN failed object decoding", guid_bin_to_hex(pk_hash_bin))
                return None
        else:
            print("WARN bin res is None", bin_rs)
            return None


class IndexQueryWebApi(object):
    exposed = True

    def __init__(self, cherrypy, api: IndexQueryGenericApi, mount_path: str, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        self.mount_path = mount_path
        if mount:
            self.mount()

    def GET(self, **kwargs):
        try:
            ll = self.api.query(**kwargs)
            if ll:
                js = json.dumps(ll, ensure_ascii=False)
                bts = js.encode(encoding='utf-8')
                self.cherrypy.response.status = 200
                return bts
            else:
                self.cherrypy.response.status = 404
                return b'[]'
        except:
            self.cherrypy.response.status = 400
            traceback.print_exc()
            return b'null'

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            self.mount_path, {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class IndexAllByTitleDescApi(object):

    def __init__(self, doc_api, text_api):
        self.doc_api = doc_api
        self.text_api = text_api

    def query(self):
        # by title and description
        repr_f = ReprFNplusOne(self.doc_api)
        guid_list = self.doc_api.jsr.hashid_list_bin(self.doc_api.signer.owner)
        print(len(guid_list))
        o_dict = {k: repr_f(k) for k in guid_list if repr_f(k)}
        print(len(o_dict))
        for k, v in o_dict.items():
            if 'title' in v:
                print('INDEXING TITLE', v['title'])
                self.text_api.idx_engine.index_bag_of_spec_text(
                    container_hash=k, specifier='title', text_data=v['title'])
            if 'description' in v:
                print('INDEXING DESC', v['description'])
                self.text_api.idx_engine.index_bag_of_spec_text(
                    container_hash=k, specifier='description', text_data=v['description'])


class IndexAllGigsWebApi(object):
    exposed = True

    def __init__(self, cherrypy, api: IndexAllByTitleDescApi, mount_path: str, mount=False):
        self.api = api
        self.cherrypy = cherrypy
        self.mount_path = mount_path
        if mount:
            self.mount()

    def mount(self):
        self.cherrypy.tree.mount(
            self,
            self.mount_path, {'/': {
                    'request.dispatch': self.cherrypy.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )

    def PUT(self):
        try:
            self.api.query()
            self.cherrypy.response.status = 201
            return b'true'
        except:
            traceback.print_exc()
            self.cherrypy.response.status = 400
            return b'false'


class IndexApiBundle(object):
    def __init__(self, db_file_name: str, document_api:BinResourceLocalApi, cherrypy):
        self.doc_api = document_api
        self.idx_store = InvIndexTimestampSQLite(
            db_name=db_file_name,
            table_name='idx_text',
        )
        self.engine = ResourceIndexingEngine(index_store=self.idx_store)
        self.text_api = TextIndexingApi(idx_engine=self.engine)
        self.text_web_api = TextIndexingWebApi(cherrypy, self.text_api)
        self.query_api_guids = IndexQueryApiRepr(idx_engine=self.engine, repr_f=ReprHexGuid())
        self.query_web_api_guids = IndexQueryWebApi(cherrypy, self.query_api_guids,
                                                    mount_path='/api/v1/my/idx/query/guids/')

        self.query_api_obj = IndexQueryApiRepr(idx_engine=self.engine, repr_f=ReprFNplusOne(self.doc_api))
        self.query_web_api_obj = IndexQueryWebApi(cherrypy, self.query_api_obj,
                                                  mount_path='/api/v1/my/idx/query/objects/')

        self.index_all_by_title_desc = IndexAllByTitleDescApi(self.doc_api, self.text_api)

        self.index_all_by_title_desc_web = IndexAllGigsWebApi(cherrypy, self.index_all_by_title_desc,
                                                              mount_path='/api/v1/my/idx/all/')



