
CTX_LST = 'lst'
CTX_OBJ = 'obj'
CTX_OWN = 'own'
CTX_HSH = 'hsh'
CTX_INT = 'int'
CTX_TXT = 'txt'
CTX_HEX = 'hex'
CTX_OPO = 'opo'  #
CTX_JSN = 'jsn'


def d_kv_value(k, v) -> dict:
    return dict({'key': k, 'val': {'key': k, 'val': v}})


class KVInterface(object):

    @property
    def val(self):
        return None

    @property
    def key(self):
        return None

    def key_value_dict(self) -> dict:
        return dict({'key': self.key, 'val': {'key': self.key, 'val': self.val}})


class ListItem(KVInterface):
    def __init__(self, list_id):
        self._lid = list_id
        self._k = None
        self._v = None

    @property
    def key(self):
        return self._k

    @property
    def val(self):
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
    def val(self):
        return self._v

    def set_key(self):
        self._k = {'ctx': CTX_LST, 'lid': self._lid}

    def set_value(self, len):
        self._v = {'ctx': CTX_INT, 'len': len}


class OwnerPredicateObject(KVInterface):
    def __init__(self, prop_id_key=None):
        self._idk = prop_id_key
        self._k = None
        self._v = None

    @property
    def key(self):
        return self._k

    @property
    def val(self):
        return self._v

    def set_key(self, idk=None):
        if idk:
            self._idk = idk
        self._k = {'ctx': CTX_OPO, 'idk': self._idk}

    def set_value(self, ctx, obj):
        self._v = {'ctx': ctx, 'obj': obj}
