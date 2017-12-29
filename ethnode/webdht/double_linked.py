from kadem.kad import DHTFacade
from webdht.wdht import OwnerGuidHashIO
from apifaces.pushpull import HashIO, PulseCallerIO
from toolkit.kadmini_codec import sha256_bin_digest, guid_bin_to_hex, guid_hex_to_bin, decode_bson_val


class OwnPulse(object):
    def __init__(self, dhf: DHTFacade, owner: HashIO):
        self.dhf = dhf
        self.owner = owner

    def push(self, k, v):
        return self.dhf.push(k, v)

    def pull(self, k, hkey=None):
        item = self.dhf.pull_local(k, hk_hex=hkey)
        if not item:
            item = self.dhf.pull_remote(k, hk_hex=hkey)
        if item:
            print(item)
        guid_bin = self.owner.bin()
        t = self.dhf.pull_remote(k, guid=guid_bin, hk_hex=hkey)
        if not t:
            t = self.dhf.pull_local(k, guid=guid_bin, hk_hex=hkey)
            if not t:
                return dict()

        guid, sign, val = t
        rev, val_d = decode_bson_val(val)
        # print('VAL D', val_d)
        return val_d


class FakePulse(object):
    def __init__(self, own=None):
        self.own = own
        self.d = dict()

    def push(self, k, v):
        self.d[k] = v

    def pull(self, k):
        return self.d.get(k)


class DLMetaItem(object):
    def __init__(self,
                 collection_name,
                 first_key,
                 last_key):
        self.collection_name = collection_name
        self.first_key = first_key
        self.last_key = last_key

    def to_dict(self):
        return {
            'collection_name': self.collection_name,
            'first_key': self.first_key,
            'last_key': self.last_key
        }


class DLMetaItemFromDict(object):
    def __new__(cls,
                d: dict):
        return DLMetaItem(**d)


class DLItem(object):
    def __init__(self,
                 key,
                 value,
                 prev_key,
                 next_key,
                 hk=None,
                 deleted=False):
        self.key = key
        self.value = value
        self.prev_key = prev_key
        self.next_key = next_key
        self.hk = hk
        self.deleted = deleted

    def to_dict(self):
        return {
            'key': self.key,
            'value': self.value,
            'next_key': self.next_key,
            'prev_key': self.prev_key,
            'hk': self.hk,
            'deleted': self.deleted
        }


class DLFromDict(object):
    def __new__(cls, d: dict):
            return DLItem(**d)


class DLItemDict(object):
    def __init__(self, pulse: OwnPulse,
                 collection_name: str):
        self.pulse = pulse
        self.collection_name = collection_name
        self._hk = None

    def set_meta(self, meta_item: DLMetaItem):
        self.pulse.push(meta_item.collection_name, meta_item.to_dict())

    def get_meta(self):
        d = self.pulse.pull(self.collection_name)
        if not d:
            return None
        meta_item = DLMetaItemFromDict(d)
        return meta_item

    def get(self, key, hkey=None) -> DLItem or None:
        d_val = self.pulse.pull(key, hkey=hkey)
        if not d_val:
            return None
        item_dl = DLFromDict(d_val)
        item_dl.hk = self.pulse.dhf.last_pulled_hk_hex
        return item_dl

    @property
    def last_set_hkey(self):
        return self._hk

    def __setitem__(self, key, value: DLItem):
        if key == self.collection_name:
            raise ValueError('DLItemDict can not use collection name as a key')
        dict_value = value.to_dict()
        self._hk = self.pulse.push(key, dict_value)

    def __getitem__(self, key) -> DLItem:
        return self.get(key)


class DList(object):
    def __init__(self, dlitem_dict: DLItemDict):
        self.dlitem_dict = dlitem_dict
        self.last_key = None
        self.first_key = None

        meta_item = self.dlitem_dict.get_meta()
        if meta_item:
            self.last_key = meta_item.last_key
            self.first_key = meta_item.first_key

    def update_meta_item(self):
        meta_item = DLMetaItem(
            self.dlitem_dict.collection_name,
            self.first_key, self.last_key)
        self.dlitem_dict.set_meta(meta_item)

    def insert(self, key, value):
        o_item_hk = None
        o_item = None
        try:
            o_item = self.dlitem_dict.get(key)
            if o_item:
                print('EXISTS, REJECT')

        except Exception as e:
            return None

        if not self.last_key:
            self.first_key = key
            self.last_key = key
            o_item = DLItem(key, value, next_key=None, prev_key=None)
            # o_item.hk =
            self.dlitem_dict.__setitem__(key, o_item)
            o_item_hk = self.dlitem_dict.last_set_hkey
            self.update_meta_item()

        else:
            o_last_item = self.dlitem_dict.get(self.last_key)
            self.last_key = key
            o_last_item.next_key = key
            self.dlitem_dict.__setitem__(o_last_item.key, o_last_item)
            o_item = DLItem(key, value, prev_key=o_last_item.key, next_key=None)
            o_item.prev_key = o_last_item.key
            o_item.next_key = None
            self.dlitem_dict.__setitem__(o_item.key, o_item)
            o_item_hk = self.dlitem_dict.last_set_hkey
            self.update_meta_item()
        return o_item_hk

    def delete(self, key, hkey=None) -> DLItem or None:
        if hkey:
            o_item = self.dlitem_dict.get(key, hkey=hkey)
        else:
            o_item = self.dlitem_dict.get(key)

        if o_item.prev_key and o_item.next_key:
            nx_item = self.dlitem_dict.get(o_item.next_key)
            pr_item = self.dlitem_dict.get(o_item.prev_key)
            pr_item.next_key = nx_item.key
            nx_item.prev_key = pr_item.key
            self.dlitem_dict.__setitem__(pr_item.key, pr_item)
            self.dlitem_dict.__setitem__(nx_item.key, nx_item)
            return o_item
        elif o_item.prev_key:
            pr_item = self.dlitem_dict.get(o_item.prev_key)
            pr_item.next_key = None
            self.last_key = pr_item.key
            self.dlitem_dict.__setitem__(pr_item.key, pr_item)
            self.update_meta_item()
            return o_item
        elif o_item.next_key:
            nx_item = self.dlitem_dict.get(o_item.next_key)
            nx_item.prev_key = None
            self.dlitem_dict.__setitem__(nx_item.key, nx_item)
            self.first_key = nx_item.key
            self.update_meta_item()
            return o_item
        else:
            self.first_key = None
            self.last_key = None
            self.update_meta_item()
            return o_item

    def iter_items(self):
        if self.first_key:
            nx_key = self.first_key
            while nx_key:
                item = self.dlitem_dict.get(nx_key)
                if item:
                    nx_key = item.next_key
                    yield item
                else:
                    break
        else:
            pass

    def iter_items_inverted(self):
        if self.last_key:
            nx_key = self.last_key
            while nx_key:
                item = self.dlitem_dict.get(nx_key)
                if item:
                    nx_key = item.prev_key
                    yield  item
                else:
                    break
        else:
            pass

    def iter_hk(self, inverted=False):
        itr = self.iter_items
        if inverted:
            itr = self.iter_items_inverted
        for item in itr():
            yield item.hk

    def iter_keys(self, inverted=False):
        itr = self.iter_items
        if inverted:
            itr = self.iter_items_inverted
        for item in itr():
            yield item.key
        # for item in self.iter_items():
        #     yield item.key

    def iter_values(self, inverted=False):
        itr = self.iter_items
        if inverted:
            itr = self.iter_items_inverted
        for item in itr():
            yield item.value

    def iter_kv(self, inverted):
        itr = self.iter_items
        if inverted:
            itr = self.iter_items_inverted
        for item in itr():
            yield (item.key, item.value)


def instance_dl(dhf, hex, collection_name):
    dl = DList(
        DLItemDict(
            pulse=OwnPulse(dhf, OwnerGuidHashIO(hex)),
            collection_name=collection_name,
        )
    )
    return dl


# dl = DList(DLItemDict(FakePulse(), collection_name='dht:gigs'))
