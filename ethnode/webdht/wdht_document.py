
CTX_LST = 'lst'
CTX_OBJ = 'obj'
CTX_OWN = 'own'
CTX_HSH = 'hsh'
CTX_INT = 'int'
CTX_TXT = 'txt'
CTX_HEX = 'hex'
CTX_OPO = 'opo'  #
CTX_JSN = 'jsn'
CTX_DLS = 'dls'


def d_kv_value(k, v) -> dict:
    return dict({'key': k, 'val': {'key': k, 'val': v}})


class KVInterface(object):

    @property
    def value(self):
        return None

    @property
    def key(self):
        return None

    def key_value_dict(self) -> dict:
        return dict({'key': self.key, 'val': {'key': self.key, 'val': self.value}})


class ListItem(KVInterface):
    def __init__(self, list_id):
        self._lid = list_id
        self._k = None
        self._v = None

    @property
    def key(self):
        return self._k

    @property
    def value(self):
        return self._v

    def set_key(self, item_idx: int):
        self._k = {'ctx': CTX_LST, 'lid': self._lid, 'idx': item_idx}

    def set_value(self, item_ctx, item_value):
        self._v = {'ctx': item_ctx, 'itv': item_value}


class ListMeta(object):
    def __init__(self, list_id):
        self._lid = list_id
        self._k = None
        self._v = None

    @property
    def key(self):
        return self._k

    @property
    def value(self):
        return self._v

    @value.setter
    def value(self, length):
        self.set_value(length)

    def set_key(self):
        self._k = {'ctx': CTX_LST, 'lid': self._lid}

    def set_value(self, length):
        self._v = {'ctx': CTX_INT, 'len': length}


class DLMeta(object):
    def __init__(self, collection_name):
        self._collection_name = collection_name
        self._k = None
        self._v = None

    @property
    def key(self):
        return self._k

    @key.setter
    def key(self, value):
        self.set_key()

    @property
    def value(self):
        return self._v

    @value.setter
    def value(self, first_key):
        self.set_value(first_key)

    def set_key(self):
        self._k = {'ctx': CTX_DLS, 'nam': self._collection_name}

    def set_value(self, first_key):
        self._v = {'ctx': CTX_INT, 'fky': first_key}


class OwnerPredicateObject(KVInterface):
    def __init__(self, prop_id_key=None):
        self._idk = prop_id_key
        self._k = None
        self._v = None

    @property
    def key(self):
        return self._k

    @property
    def value(self):
        return self._v

    def set_key(self, idk=None):
        if idk:
            self._idk = idk
        self._k = {'ctx': CTX_OPO, 'idk': self._idk}

    def set_value(self, ctx, obj):
        self._v = {'ctx': ctx, 'obj': obj}

