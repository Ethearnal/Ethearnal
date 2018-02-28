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

    def push_hkey(self, hkey, v):
        return self.dhf.push(key='', hk_hex=hkey, value=v)

    def pull(self, k, hkey=None):
        item = self.dhf.pull_local(k, hk_hex=hkey)
        print('+++ OwnPulse PULL REMOTE', item)
        if not item:
            print('+++ OwnPulse PULL REMOTE')
            item = self.dhf.pull_remote(k, hk_hex=hkey)
        if item:
            print('+++ OWN PULSE ', item)
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
                 last_key,
                 ):
        self.collection_name = collection_name
        self.first_key = first_key
        self.last_key = last_key

    def to_dict(self):
        return {
            'collection_name': self.collection_name,
            'first_key': self.first_key,
            'last_key': self.last_key,
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
                 next_hk=None,
                 prev_hk=None,
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

    def __setitem__(self, key, value: DLItem, hkey=None):
        if key == self.collection_name:
            raise ValueError('DLItemDict can not use collection name as a key')
        dict_value = value.to_dict()
        if hkey:
            self._hk = self.pulse.push_hkey(hkey, dict_value)
        else:
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
                pass
                print('EXISTS, REJECT')
        except Exception as e:
            return None

        if not self.last_key:
            self.first_key = key
            self.last_key = key
            o_item = DLItem(key, value, next_key=None, prev_key=None)
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

    def mark_o_item_deleted(self, key, o_item: DLItem, hkey=None):
        if o_item.value:
            if isinstance(o_item.value, dict):
                o_item.value['deleted'] = True
                if hkey:
                    self.dlitem_dict.__setitem__('', o_item, hkey=hkey)
                else:
                    self.dlitem_dict.__setitem__(key,o_item)

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
            o_item.deleted = True
            self.mark_o_item_deleted(key, o_item, hkey)
            return o_item
        elif o_item.prev_key:
            pr_item = self.dlitem_dict.get(o_item.prev_key)
            pr_item.next_key = None
            self.last_key = pr_item.key
            self.dlitem_dict.__setitem__(pr_item.key, pr_item)
            self.update_meta_item()
            o_item.deleted = True
            self.mark_o_item_deleted(key, o_item, hkey)
            return o_item
        elif o_item.next_key:
            nx_item = self.dlitem_dict.get(o_item.next_key)
            nx_item.prev_key = None
            self.dlitem_dict.__setitem__(nx_item.key, nx_item)
            self.first_key = nx_item.key
            self.update_meta_item()
            o_item.deleted = True
            self.mark_o_item_deleted(key, o_item, hkey)
            return o_item
        else:
            self.first_key = None
            self.last_key = None
            self.update_meta_item()
            o_item.deleted = True
            self.mark_o_item_deleted(key, o_item, hkey)
            return o_item

    def get_item(self, key=None, hk_key=None):
        if hk_key:
            item = self.dlitem_dict.get('', hk_key)
            return item
        elif key:
            item = self.dlitem_dict.get(key, hk_key)
            return item

    def iter_items(self, from_key=None, from_hkey=None, inverted=False, paginate=0):
        cnt = 0
        if from_key:
            item = self.dlitem_dict.get(from_key)
        elif from_hkey:
            item = self.dlitem_dict.get('', hkey=from_hkey)
        else:
            if inverted:
                item = self.dlitem_dict.get(self.last_key)
            else:
                item = self.dlitem_dict.get(self.first_key)
        while item:
            if paginate >= 0:
                cnt += 1
            yield item

            if cnt == paginate:
                break

            if not inverted:
                if item.next_key:
                    item = self.dlitem_dict.get(item.next_key)
                else:
                    break
            else:
                if item.prev_key:
                    item = self.dlitem_dict.get(item.prev_key)
                else:
                    break

    def iter_hk(self, inverted=False, from_hkey=None, from_key=None):
        for item in self.iter_items(from_hkey=from_hkey, from_key=from_key, inverted=inverted):
            yield item.hk

    def iter_keys(self, inverted=False):
        for item in self.iter_items(inverted=inverted):
            yield item.key

    def iter_values(self, inverted=False):
        for item in self.iter_items(inverted=inverted):
            yield item.value

    def iter_kv(self, inverted):
        for item in self.iter_items(inverted=inverted):
            yield (item.key, item.value)


def instance_dl(dhf, hex, collection_name):
    dl = DList(
        DLItemDict(
            pulse=OwnPulse(dhf, OwnerGuidHashIO(hex)),
            collection_name=collection_name,
        )
    )
    return dl
