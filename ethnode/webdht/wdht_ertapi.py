import json
from webdht.double_linked import DList, instance_dl
from kadem.kad import DHTFacade
from webdht.wdht import HashIO, OwnerGuidHashIO


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

    def GET(self, owner_guid=None):
        if not owner_guid:
            owner_guid = self.me.hex()
        dl = instance_dl(self.dhf, owner_guid, self.collection_name)
        ll = list(dl.iter_values())
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

