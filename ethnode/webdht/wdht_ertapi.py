import json, bson
from webdht.double_linked import DList, instance_dl
from kadem.kad import DHTFacade
from webdht.wdht import HashIO, OwnerGuidHashIO
from datamodel.resource_index import ResourceIndexingEngine
from datamodel.inv_norank_sqlite import InvIndexTimestampSQLite
from toolkit.kadmini_codec import guid_bin_to_hex, guid_bin_to_hex2, guid_hex_to_bin, guid_int_to_hex
from ert_profile import EthearnalProfileController

# todo DRY it


class Indexer(object):
    def __init__(self, dhf: DHTFacade, ert: EthearnalProfileController):
        self.dhf = dhf
        self.ert = ert
        self.dhf.indexer = self
        self.db_idx = InvIndexTimestampSQLite(
            db_name=self.ert.db_gigs_index_fn,
            table_name='gigs_index'
        )
        self.idx = ResourceIndexingEngine(self.db_idx)

    def index_field(self, pk_bin, specifier, text_data, prefixes=True):
        try:
            self.idx.index_bag_of_spec_text(
            container_hash=pk_bin,
            specifier=specifier, text_data=text_data, prefixes=prefixes)
        except Exception as e:
            print('ERR IDX FAILED', specifier, text_data, str(e))

    def query_terms(self, terms: dict, prefixes=True):
        cur = self.idx.qry_terms(terms=terms, prefixes=prefixes)
        if cur:
            ll = [guid_bin_to_hex2(t[2]) for t in cur.fetchall()]
            return ll

    def query_terms_d(self, terms_d: dict):
        cur = self.idx.qry_terms_d(terms_d)
        if cur:
            ll = [guid_bin_to_hex2(t[2]) for t in cur.fetchall()]
            return ll

    def query_text(self, text):
        return self.query_terms({'text': text})

    def query_tags(self, tags):
        return self.query_terms({'tags': tags}, prefixes=False)

    def query_owner(self, guid_owner):
        return self.query_terms({'owner_guid': guid_owner}, prefixes=False)

    def index_gig_document(self, hk_hex: str, doc: dict):
        text = ''
        if 'title' in doc:
            text += doc['title'] + ' '
        if 'description' in doc:
            text += doc['description']
        if text.strip() != '':
            # pass
            self.index_field(guid_hex_to_bin(hk_hex), 'text', text_data=text)
        if 'tags' in doc:
            self.index_field(guid_hex_to_bin(hk_hex), 'tags', text_data=' '.join(doc['tags']), prefixes=False)
        if 'owner_guid' in doc:
            self.index_field(guid_hex_to_bin(hk_hex), 'owner_guid', text_data=doc['owner_guid'], prefixes=False)

    def index_on(self, hk_hex: str, data: dict):
        if hk_hex and data:
            if 'value' in data:
                doc = data['value']
                if 'model' in doc:
                    if doc['model'] == 'Gig':
                        self.index_gig_document(hk_hex, doc)


class IdxCdnQueryWebApi(object):
    exposed = True

    def __init__(self, cherrypy, idx: Indexer, mount_path: str="/api/cdn/v1/idx/", mount=True):
        self.idx = idx
        self.cherrypy = cherrypy
        self.mount_path = mount_path
        if mount:
            self.mount()

    def GET(self, **kwargs):
        try:
            query_dict = {k.lower(): list(set(v.lower().split(' '))) for k, v in kwargs.items()}
            print('QUERY_DICT', query_dict)
            ll = self.idx.query_terms_d(query_dict)
            if ll:
                js = json.dumps(ll, ensure_ascii=False)
                bts = js.encode(encoding='utf-8')
                self.cherrypy.response.status = 200
                return bts
            else:
                self.cherrypy.response.status = 400
                return b'null'
        except:
            self.cherrypy.response.status = 404
            # traceback.print_exc()
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



class DhtEventsHkeysWebAPI(object):
    exposed = True

    def __init__(self, cherry,
                 dhf: DHTFacade,
                 me_owner: HashIO,
                 mount_point: str='/api/v1/dht/events/',
                 mount_it=True):
        self.cherry = cherry
        self.dhf = dhf
        self.mount_point = mount_point
        self.collection_name = '.evt'
        self.me = me_owner
        self.myevts = instance_dl(self.dhf, self.me.hex(), self.collection_name)
        self.dhf.events = self

        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

        # self.required_fields = ()

    def get_per_guid(self, owner_guid):
        dl = instance_dl(self.dhf, owner_guid, self.collection_name)
        ll = list(dl.iter_hk(inverted=True))
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

    def create_event(self, event_kind, operation, event_data):
        #
        data = dict({'event_kind': event_kind, 'operation': operation, 'event_data': event_data})
        data['owner_guid'] = self.me.hex()
        data['model'] = 'Event'
        value = data
        from datetime import datetime
        key = data['event_kind']+';;'+data['operation']+datetime.now().isoformat()

        try:
            o_item_hk = self.myevts.insert(key=key, value=value)
        except:
            self.cherry.response.status = 409
            return b'ERROR in insert'
        self.cherry.response.status = 201
        if o_item_hk:
            try:
                hex_str = guid_int_to_hex(o_item_hk)
                return hex_str.encode()
            except:
                return b'ERROR converting hash key'
        else:
            return b'null'

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )



class DhtGetByHkeyWebAPI(object):
    exposed = True

    def __init__(self, cherry,
                 dhf: DHTFacade,
                 # me_owner: HashIO,
                 mount_point: str='/api/v1/dht/hkey/',
                 mount_it=True):
        self.cherry = cherry
        self.dhf = dhf
        self.mount_point = mount_point
        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

    def GET(self, hkey):
        t1 = self.dhf.pull_local('', hk_hex=hkey)
        t2 = self.dhf.pull_remote('', hk_hex=hkey)
        if t2:
            t = t2
        else:
            t = t1
        if not t:
            return b'null'
        d = bson.loads(t[-1])
        if 'e' in d:
            l = d['e']
            if len(l) >= 2:
                v = l[1]
                if 'value' in v:
                    try:
                        js = json.dumps(v['value']).encode()
                        return js
                    except:
                        pass
        return b'null'

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class DhtGigsHkeysWebAPI(object):
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
        self.delete_collection_name = '.deleted_gigs'
        self.me = me_owner
        self.mygigs = instance_dl(self.dhf, self.me.hex(), self.collection_name)
        self.deleted_gigs = instance_dl(self.dhf, self.me.hex(), self.delete_collection_name)


        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

        self.required_fields = ('general_domain_of_expertise', 'title', 'description', 'price', 'required_ert')

    def get_per_guid(self, owner_guid):
        dl = instance_dl(self.dhf, owner_guid, self.collection_name)
        ll = list(dl.iter_hk(inverted=True))
        return ll

    def DELETE(self, hkey):
        owner_guid = self.dhf.ert.rsa_guid_hex
        dl = instance_dl(self.dhf, owner_guid, self.collection_name)

        item = dl.delete(key='', hkey=hkey)
        if item:
            dl.dlitem_dict.__setitem__(item.key, item)
            d = item.to_dict()
            js = json.dumps(d, ensure_ascii=False)
            return js.encode()
        return b'null'

    def GET(self, owner_guid=None, deleted=None):

        if deleted and owner_guid:
            dl = instance_dl(self.dhf, owner_guid, self.delete_collection_name)
            ll = list(dl.iter_hk(inverted=False))
            d_js = json.dumps(ll, ensure_ascii=False)
            d_sj_bin = d_js.encode()
            return d_sj_bin

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
                s = 'ERROR %s field required!' % str(item)
                return s.encode()

        data['owner_guid'] = self.me.hex()
        data['model'] = 'Gig'
        value = data
        from datetime import datetime
        key = data['title'] + ';' + datetime.now().isoformat()

        o_item = self.mygigs.dlitem_dict.get(key)
        if o_item:
            if o_item.deleted:
                self.deleted_gigs.delete(key)
        try:
            o_item_hk = self.mygigs.insert(key=key, value=value)
        except:
            self.cherry.response.status = 409
            return b'ERROR in insert'

        self.cherry.response.status = 201

        if o_item_hk:
            try:
                hex_str = guid_int_to_hex(o_item_hk)
                return hex_str.encode()
            except:
                return b'ERROR converting hash key'
        else:
            return b'null'

    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class DhtGigsWebAPI(object):
    exposed = True

    def __init__(self, cherry,
                 dhf: DHTFacade,
                 me_owner: HashIO,
                 mount_point: str='/api/v1/dht/gigsrender/',
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
        data['owner_guid'] = self.me.hex()
        data['model'] = 'Gig'
        value = data
        try:
            o_item_hk = self.mygigs.insert(key=key, value=value)
        except:
            self.cherry.response.status = 409
            return b'ERROR in inserting'
        self.cherry.response.status = 201
        if o_item_hk:
            try:
                hex_str = guid_int_to_hex(o_item_hk)
                return hex_str.encode()
            except:
                return b'ERROR converting hash key'
        else:
            return b'null'


    def mount(self):
        self.cherry.tree.mount(
            self,
            self.mount_point, {'/': {
                    'request.dispatch': self.cherry.dispatch.MethodDispatcher(),
                    'tools.sessions.on': True,
                }
            }
        )


class DhtPortfoliosWebAPI(object):
    exposed = True

    def __init__(self, cherry,
                 dhf: DHTFacade,
                 me_owner: HashIO,
                 mount_point: str='/api/v1/dht/portfolios/',
                 mount_it=True):
        self.cherry = cherry
        self.dhf = dhf
        self.mount_point = mount_point
        self.collection_name = '.portfolios'
        self.me = me_owner
        self.mygigs = instance_dl(self.dhf, self.me.hex(), self.collection_name)
        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

        self.required_fields = ('title', 'description')

    def get_per_guid(self, owner_guid):
        dl = instance_dl(self.dhf, owner_guid, self.collection_name)
        ll = list(dl.iter_hk())
        return ll

    def DELETE(self, hkey):
        owner_guid = self.dhf.ert.rsa_guid_hex
        dl = instance_dl(self.dhf, owner_guid, self.collection_name)

        item = dl.delete(key='', hkey=hkey)
        if item:
            dl.dlitem_dict.__setitem__(item.key, item)
            d = item.to_dict()
            js = json.dumps(d, ensure_ascii=False)
            return js.encode()
        return b'null'

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

        data['owner_guid'] = self.me.hex()
        data['model'] = 'Portfolio'
        value = data
        from datetime import datetime
        key = data['title'] + ';' + datetime.now().isoformat()
        try:
            o_item_hk = self.mygigs.insert(key=key, value=value)
        except:
            self.cherry.response.status = 409
            return b'ERROR in inserting'
        self.cherry.response.status = 201
        if o_item_hk:
            try:
                hex_str = guid_int_to_hex(o_item_hk)
                return hex_str.encode()
            except:
                return b'ERROR converting hash key'
        else:
            return b'null'

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

    def GET(self, profile_key, owner_guid=None):
        # todo
        key = {'profile:key': profile_key}
        t = None
        if not owner_guid:
            t = self.dhtf.pull_local(key)
        else:
            guid_bin = guid_hex_to_bin(owner_guid)
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

    def PUT(self, profile_key):
        return self.post(profile_key)

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
            'ip4': "%s:%s" % (ip4, self.dhtf.dht.peer.port,),
            'cdn': ["%s:%s" % (self.dhtf.ert.cdn_host, self.dhtf.ert.cdn_port)]
        }
        js = json.dumps(d, ensure_ascii=False)
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

