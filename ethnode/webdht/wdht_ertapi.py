import json, bson
from webdht.double_linked import DList, instance_dl
from kadem.kad import DHTFacade
from webdht.wdht import HashIO, OwnerGuidHashIO
from toolkit.kadmini_codec import guid_bin_to_hex, guid_hex_to_bin



class DhtGigsWebAPI(object):
    exposed = True

    def __init__(self, cherry,
                 dhf: DHTFacade,
                 me_owner: HashIO,
                 mount_point: str='/api/v1/dht/gigs/',
                 mount_it=True):
        self.cherry = cherry
        self.dhf = dhf
        self.mount_point = mount_point
        self.collection_name = '.gigs'
        self.me = me_owner
        self.mygigs = instance_dl(self.dhf, self.me.hex(), self.collection_name)
        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

        self.required_fields = ('general_domain_of_expertise', 'title', 'description', 'price', 'required_ert')

    def get_per_guid(self, owner_guid):
        dl = instance_dl(self.dhf, owner_guid, self.collection_name)
        ll = list(dl.iter_values())
        return ll

    def GET(self, owner_guid=None):
        if owner_guid:
            ll = self.get_per_guid(owner_guid)
            d_js = json.dumps(ll, ensure_ascii=False)
            d_sj_bin = d_js.encode()
            return d_sj_bin
        else:
            c = self.dhf.dht.storage.pubkeys.cursor.execute('SELECT bkey from ertref;')
            guid_list = [guid_bin_to_hex(k[0]).decode() for k in c.fetchall()]
            ll = list()
            for guid in guid_list:
                ll.append({guid: self.get_per_guid(guid)})
            d_js = json.dumps(ll, ensure_ascii=False)
            d_sj_bin = d_js.encode()
            return d_sj_bin

    def POST(self):
        body = self.cherry.request.body.read()
        data = {}
        try:
            # decode the body
            body = body.decode()
            data = json.loads(body)
        except:
            # todo improve whole-site err handling
            print('ERR in DECODE data from body')
            self.cherry.response.status = 409
            return b'ERROR in decode parse'
        for item in self.required_fields:
            if item not in data:
                print('REQUIRED FIELD', item)

        key = data['title']
        value = data
        try:
            self.mygigs.insert(key=key, value=value)
        except:
            self.cherry.response.status = 409
            return b'ERROR in inserting'
        self.cherry.response.status = 201
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


class WebDHTKnownPeers(object):
    exposed = True

    def __init__(self,
                 cherry,
                 dhf: DHTFacade,
                 mount_point: str='/api/v1/dht/ip4/',
                 mount_it=True):
        self.cherry = cherry
        self.dhtf = dhf
        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT GUIDS ENDPOINT')

    def GET(self):
        # todo
        js = json.dumps(self.dhtf.ip4_peers_hex)
        js_b = js.encode()
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


class WebDHTProfileKeyVal(object):
    exposed = True

    def __init__(self,
                 cherry,
                 dhf: DHTFacade,
                 mount_point: str='/api/v1/dht/profile/',
                 mount_it=True):
        self.cherry = cherry
        self.dhtf = dhf
        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT Profile K,V ENDPOINT')

    def post(self, profile_key):
        body = self.cherry.request.body.read()
        data = json.loads(body.decode())
        key = {'profile:key': profile_key}
        value = {'k': key, 'v': data}
        self.dhtf.push(key, value)
        return b''

    def GET(self, profile_key, guid=None):
        # todo
        key = {'profile:key': profile_key}
        t = None
        if not guid:
            t = self.dhtf.pull_local(key)
        else:
            guid_bin = guid_hex_to_bin(guid)
            if guid_bin == self.dhtf.ert.rsa_guid_bin:
                t = self.dhtf.pull_local(key)
            else:
                t = self.dhtf.pull_remote(key, guid_bin)
        if t:
            d = bson.loads(t[-1])
            if 'e' in d:
                ll = d['e']
                if len(ll) >= 1:
                    dd = ll[1]
                    if 'v' in dd:
                        js = json.dumps(dd['v'])
                        js_b = js.encode()
                        return js_b
        return b'null'

    def POST(self, profile_key):
        return self.post(profile_key)

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class WebDHTAboutNode(object):
    exposed = True

    def __init__(self,
                 cherry,
                 dhf: DHTFacade,
                 mount_point: str='/api/v1/dht/node/',
                 mount_it=True):
        self.cherry = cherry
        self.dhtf = dhf
        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT Profile K,V ENDPOINT')

    def GET(self):
        ip4 = None
        wan = self.dhtf.ert.my_wan_ip
        lan = self.dhtf.ert.my_lan_ip

        if wan:
            ip4 = wan
        elif lan:
            ip4 = wan
        else:
            ip4 = '127.0.0.1'

        d = {
            'guid': self.dhtf.ert.rsa_guid_hex,
            'ip4': "%s:%s" % (ip4, self.dhtf.dht.peer.port)
        }
        js = json.dumps(d,ensure_ascii=False)
        b_js = js.encode()
        return b_js



    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )
