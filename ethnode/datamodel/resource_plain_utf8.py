from datamodel.resource_sqlite import ResourceSQLite
from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from crypto.signer import SignerInterface
from toolkit.kadmini_codec import sha256_bin_digest


class PlainTextUTF8Resource(object):
    def __init__(self,
                 signer: SignerInterface,
                 data_store: ResourceSQLite = ResourceSQLite('plain_text_utf8.db', 'plain_text'),
                 content_type: bytes=b'text/plain',
                 content_encoding: bytes=b'utf-8'):
        self.data_store = data_store
        self.signer = signer
        self.content_type = content_type
        self.content_encoding = content_encoding

    def create(self, text: str):
        bin_data = text.encode(encoding='utf-8')
        owner_hash = self.signer.owner
        resource_own_sig = self.signer.sign(bin_data)
        pk_hash = self.data_store.create_resource(owner_hash,
                                                  resource_own_sig,
                                                  self.content_type,
                                                  self.content_encoding,
                                                  bin_data)
        return pk_hash

    def read(self, pk_hash):
        c = self.data_store.read_resource(pk_hash)
        return c.fetchone()


class PlainTextUTF8ResourceKeyWordIndex(object):
    def __init__(self,
                 data_store: InvIndexTimestampSQLite=InvIndexTimestampSQLite('plain_utf8_inv.db', 'keyword_inv')
                 ):
        self.data_store = data_store

    @staticmethod
    def component_hash(word: str):
        word_bts = word.encode(encoding='utf-8')
        return sha256_bin_digest(word_bts)

    def create(self, text_data: str, container_hash: bytes):
        words = text_data.lower().split(' ')
        words_set = set(words)
        for word in words_set:
            cmp_hash = self.component_hash(word)
            self.data_store.create(cmp_hash, container_hash)

    def query(self, keywords: str):
        words = keywords.lower().split(' ')
        words_set = set(words)
        cmp_hashes = tuple([self.component_hash(w) for w in words_set])
        c = self.data_store.inner_join_on_component(*cmp_hashes)
        return c.fetchall()


class PlainTextUTF8ResourcePrefixIndex(object):
    def __init__(self,
                 data_store: InvIndexTimestampSQLite=InvIndexTimestampSQLite('plain_utf8_prfx_inv.db', 'prefix_inv')
                 ):
        self.data_store = data_store

    @staticmethod
    def component_hash(word: str):
        word_bts = word.encode(encoding='utf-8')
        return sha256_bin_digest(word_bts)

    def create(self, text_data: str, container_hash: bytes):
        words = text_data.lower().split(' ')
        words_set = set(words)
        prefix_set = set()
        for word in words_set:
            for i in range(1, len(word)+1):
                prefix_set.add(word[:i])
        for item in prefix_set:
            cmp_hash = self.component_hash(item)
            self.data_store.create(cmp_hash, container_hash)

    def query(self, prefixes: str):
        words = prefixes.lower().split(' ')
        words_set = set(words)
        cmp_hashes = tuple([self.component_hash(w) for w in words_set])
        c = self.data_store.inner_join_on_component(*cmp_hashes)
        return c.fetchall()


class PlainTextUTF8KeyWordIndexed(object):
    def __init__(self, rs: PlainTextUTF8Resource, inv: PlainTextUTF8ResourceKeyWordIndex):
        self.rs = rs
        self.inv = inv

    def create(self, text_data: str):
        ctx_hash = self.rs.create(text_data)
        self.inv.create(text_data, ctx_hash)

    def query(self, keywords: str):
        return self.inv.query(keywords)


class PlainTextUTF8PrefixIndexed(object):
    def __init__(self, rs: PlainTextUTF8Resource, inv: PlainTextUTF8ResourcePrefixIndex):
        self.rs = rs
        self.inv = inv

    def create(self, text_data: str):
        ctx_hash = self.rs.create(text_data)
        self.inv.create(text_data, ctx_hash)

    def query(self, prefixes: str):
        return self.inv.query(prefixes)

