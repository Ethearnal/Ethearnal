from apifaces.pushpull import PulseCallerIO, PulseListenerIO, HashIO
from kadem.kad import DHTFacade
from toolkit.kadmini_codec import sha256_bin_digest, guid_bin_to_hex, guid_hex_to_bin, decode_bson_val
import json
from webdht.wdht_document import OwnerPredicateObject, CTX_HEX, CTX_JSN
from webdht.wdht_document import DLMeta
from apifaces.pushpull import HashIO


class StrToBinHash(HashIO):
    def __init__(self, str_hex_guid:str):
        self.str_guid_hex = str_hex_guid

    def __call__(self, *args, **kwargs):
        return guid_hex_to_bin(self.str_guid_hex)


class OwnerGuidHashIO(HashIO):
    def __init__(self, str_hex_guid):
        self.str_guid_hex = str_hex_guid

    def __call__(self, *args, **kwargs):
        return self.bin()

    def bin(self):
        return guid_hex_to_bin(self.str_guid_hex)

    def hex(self):
        return self.str_guid_hex


class DummyHashIO(HashIO):
    def __call__(self, *args, **kwargs):
        key, val = args
        key_st = json.dumps(key, ensure_ascii=False)
        val_st = json.dumps(val, ensure_ascii=False)
        key_val = key_st + val_st
        key_val_bts = key_val.encode()
        hash_bin = sha256_bin_digest(key_val_bts)
        hash_bin_ascii = guid_bin_to_hex(hash_bin)
        return hash_bin_ascii


class DummyPulseCaller(PulseCallerIO):
    def __init__(self, dht: DHTFacade):
        self.dht = dht
        pass

    def push(self, key: dict, value: dict) -> HashIO:
        # encode decode
        print('PUSH', key, value)
        return

    def pull(self, owner: HashIO, key: dict) -> dict:
        d = self.dht.pull_remote(key, guid=owner())
        # encode decode
        # on_pull
        return d


class DHTPulse(PulseCallerIO, PulseListenerIO):
    def __init__(self, dht: DHTFacade):
        self.dht = dht
        pass

    def push(self, key: dict, value: dict) -> HashIO:
        # encode decode
        print("PUSH K", key)
        print("PUSH V", value)
        hash_bin_ascii = DummyHashIO()(key, value)
        hk = self.dht.push(key, value)
        print('HK', hk)
        return hash_bin_ascii

    def pull(self, owner: HashIO, key: dict) -> dict:
        print("PULL K", key)
        print("PULL O", owner.hex())
        print("PULL B", owner())
        guid_bin = owner()
        t = self.dht.pull_remote(key, guid=guid_bin)
        if not t:
            t = self.dht.pull_local(key, guid=guid_bin)
            if not t:
                return dict()

        guid, sign, val = t
        val_d = decode_bson_val(val)
        return val_d

    def on_pull(self, owner: HashIO, key: dict,  value: dict):
        pass

    def on_push(self, key: dict, value: dict, res_hash: HashIO):
        pass


class DLItem(object):
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev_key = None
        self.next_key = None

    def to_dict(self) -> dict():
        return dict({'key': self.key, 'value': self.value})


class DLFromDict(object):
    def __new__(cls, d: dict) -> DLItem or None:
        if d:
            if 'key' in d and 'value' in d:
                return DLItem(d['key'], d['value'])
        return None


class DList(object):
    def __init__(self,
                 collection_name: str,
                 dht_pulse: DHTPulse,
                 own: HashIO):
        self.collection_name = collection_name
        self.pulse = dht_pulse
        self.last_key = None
        self.first_key = None
        self.owner = own
        self.dl_meta = DLMeta(collection_name)
        self.dl_meta_item = self.pulse.pull(self.owner, key=self.dl_meta.key)
        # if not self.dl_meta_item:
        #     self.pulse.push(key=self.dl_meta.key, value=self.dl_meta.value)
        # else:
        #     print('META', self.dl_meta_item)

    def insert(self, key: dict, value: dict):
        if not self.last_key:
            self.first_key = key
            self.last_key = key
            o_item = DLItem(key, value)
            o_item.prev_key = key
            o_item.next_key = key
            self.pulse.push(key, o_item.to_dict())
            self.dl_meta.set_value(self.first_key)
            self.pulse.push(self.dl_meta.key, self.dl_meta.value)
        else:
            itm = self.pulse.pull(self.owner, key)
            print('+ ++ + DEBUG PRINT +++ ',itm)
            o_item = DLFromDict(self.pulse.pull(self.owner, key))
            if o_item:
                # update
                o_item.value = value
                self.pulse.push(o_item.key, o_item.to_dict())
            else:
                # insert
                pass
                o_last_item = DLFromDict(self.pulse.pull(self.owner, self.last_key))
                self.last_key = key
                o_last_item.next_key = key
                self.pulse.push(o_last_item.key, o_last_item.to_dict())
                o_item = DLItem(key, value)
                o_item.prev_key = o_last_item.key
                self.pulse.push(o_item.key, o_item.to_dict())

    def iterate_items(self):
        if self.first_key:
            nx_key = self.first_key
            while nx_key:
                print("NX_KEY", nx_key)
                item = DLFromDict(self.pulse.pull(self.owner, nx_key))
                if item:
                    nx_key = item.next_key
                    yield item
                else:
                    break
        else:
            pass

    def iterate_keys(self):
        for item in self.iterate_items():
            yield item.key

    def iter_values(self):
        for item in self.iterate_items():
            yield item.value

    def iter_kv(self):
        for item in self.iterate_items():
            yield (item.key, item.value)


class WebMyGigs(object):
    exposed = True

    def __init__(self):
        pass

    def GET(self):
        pass


class WebDHTKnownGuids(object):
    exposed = True

    def __init__(self,
                 cherry,
                 dhtf: DHTFacade,
                 mount_point: str,
                 dkv=None,
                 hfs=None,
                 mount_it=True):
        self.cherry = cherry
        self.dhtf = dhtf
        self.mount_point = mount_point
        self.dkv = dkv
        self.hfs = hfs
        if mount_it:
            self.mount()
            print('MOUNT GUIDS ENDPOINT')

    def GET(self):
        # todo
        if self.hfs.has_hkey('guids.cache'):
            bio = self.hfs.read_io('guids')
            if not bio:
                return
            # self.bin_data = bio.read()
            return bio.read()

        guid_list = self.dkv.filter_profile_guids()
        # c = self.dhtf.dht.storage.pubkeys.cursor.execute('SELECT bkey from ertref;')
        # guid_list = [guid_bin_to_hex(k[0]).decode() for k in c.fetchall()]
        # print(guid_list)
        js = json.dumps(guid_list)
        js_b = js.encode()
        self.hfs.save_bts_str_key('guids', js_b)
        return js_b

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class WebDHTPulse(object):
    exposed = True

    def __init__(self, cherry,
                 dht_pulse: PulseCallerIO,
                 mount_point: str,
                 mount_it=False):
        self.cherry = cherry
        self.dht_pulse = dht_pulse
        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT DHT ENDPOINT')

    def read_request_body(self):
        return self.cherry.request.body.read()

    def parse_pull_request(self, body: bytes) ->(str, dict):  # -> own_hash, key
        data = json.loads(body.decode())
        own_hash = data['owner_hash']
        own_hash_bin = StrToBinHash(own_hash)
        key = data['key']
        return own_hash_bin, key

    def parse_push_request(self, body: bytes)-> (dict, dict):  # -> key,val
        data = json.loads(body.decode())
        key = data['key']
        value = data['value']
        return key, value

    def post(self):
        body = self.read_request_body()
        key, value = self.parse_push_request(body)
        # hash = self.dht_pulse.push(key, value)
        # resp = self.dht_pulse.push(key, value)
        return self.dht_pulse.push(key, value)

    def put(self):
        # todo dht_pulse.pull
        body = self.read_request_body()
        own_hash_bin, key = self.parse_pull_request(body)
        d = self.dht_pulse.pull(own_hash_bin, key)
        d_js =json.dumps(d,ensure_ascii=False)
        d_sj_bin = d_js.encode()
        return d_sj_bin

    def PUT(self):
        return self.put()

    def POST(self):
        return self.post()

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class WebSysGuidApi(object):
    exposed = True

    def __init__(self, cherry,
                 dht_pulse: PulseCallerIO,
                 owner: HashIO,
                 mount_point: str='/api/v1/sys/guid',
                 mount_it=True):
        self.cherry = cherry
        self.dht_pulse = dht_pulse
        self.doc = OwnerPredicateObject('guid')
        self.doc.set_key()
        self.owner = owner
        self.doc.set_value(ctx=CTX_HEX, obj=owner.hex())
        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT WEB:', mount_point)
            hash = self.dht_pulse.push(self.doc.key, self.doc.value)

    def GET(self):
        d = self.dht_pulse.pull(owner=self.owner, key=self.doc.key)
        d_js = json.dumps(d, ensure_ascii=False)
        d_sj_bin = d_js.encode()
        return d_sj_bin

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class WebSelfPredicateApi(object):
    exposed = True

    def __init__(self, cherry,
                 dht_pulse: PulseCallerIO,
                 owner: HashIO,
                 mount_point: str='/api/v1/self/',
                 mount_it=True):
        self.cherry = cherry
        self.dht_pulse = dht_pulse
        self.doc = OwnerPredicateObject()
        self.doc.set_key()
        self.owner = owner
        self.doc.set_value(ctx=CTX_HEX, obj=owner.hex())
        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT WEB:', mount_point)
            hash = self.dht_pulse.push(self.doc.key, self.doc.value)

    def post(self, key):
        self.doc.set_key(key)
        body = self.cherry.request.body.read()
        data = json.loads(body.decode())
        value = data['value']
        self.doc.set_value(CTX_JSN, value)
        # hash = self.dht_pulse.push(key, value)
        # resp = self.dht_pulse.push(key, value)
        return self.dht_pulse.push(self.doc.key, self.doc.value)

    def POST(self, key):
        return self.post(key)

    def GET(self, key):
        self.doc.set_key(key)
        d = self.dht_pulse.pull(owner=self.owner, key=self.doc.key)
        if 'value' in d:
            d_js = json.dumps(d, ensure_ascii=False)
            d_sj_bin = d_js.encode()
            return d_sj_bin
        return b''

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class WebGuidPredicateApi(object):
    exposed = True

    def __init__(self, cherry,
                 dht_pulse: PulseCallerIO,
                 mount_point: str='/api/v1/guid/',
                 mount_it=True):
        self.cherry = cherry
        self.dht_pulse = dht_pulse

        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT WEB:', mount_point)

    def GET(self, guid, key):
        owner = OwnerGuidHashIO(guid)
        doc = OwnerPredicateObject(prop_id_key=key)
        doc.set_key(idk=key)
        d = self.dht_pulse.pull(owner=owner, key=doc.key)
        d_js = json.dumps(d, ensure_ascii=False)
        d_sj_bin = d_js.encode()
        return d_sj_bin

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )