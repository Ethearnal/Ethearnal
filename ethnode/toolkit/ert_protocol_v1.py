# draft, not used


ERT_KV_PROTOCOL_V = 1
NS_RSA = 'RSA'
KN_PUBKEY = 'PUBKEY'


class NSKeyVal(object):
    def __init__(self, name_space: str, key_name: str, val=None):
        self.ns = name_space
        self.kn = key_name
        self.vv = val

    @property
    def key(self):
        return {'n': self.ns, 'k': self.kn}

    @property
    def val(self):
        return {'n': self.ns, 'k': self.kn, 'v': self.vv}


class NSKVPubKey(NSKeyVal):
    def __init__(self, val):
        super(
            NSKVPubKey,
            self).__init__(
                name_space=NS_RSA,
                key_name=KN_PUBKEY,
                val=val
                )




