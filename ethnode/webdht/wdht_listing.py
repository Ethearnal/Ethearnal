import json
from webdht.double_linked import DList, instance_dl
from kadem.kad import DHTFacade
from webdht.wdht import HashIO, OwnerGuidHashIO


class WebGuidCollectionListApi(object):
    exposed = True

    def __init__(self, cherry,
                 dhf: DHTFacade,
                 collection_name: str,
                 mount_point: str='/api/v1/guid/%s/',
                 mount_it=True):
        self.cherry = cherry
        self.dhf = dhf
        self.collection_name = collection_name
        self.mount_point = mount_point % collection_name
        if mount_it:
            self.mount()
            print('MOUNT WEB:', self.mount_point)

    def GET(self, guid):
        # owner = OwnerGuidHashIO(guid)
        dl = instance_dl(self.dhf, guid, self.collection_name)
        # self.dl.dlitem_dict.dhf.owner = owner
        ll = list(dl.iter_values())
        d_js = json.dumps(ll, ensure_ascii=False)
        d_sj_bin = d_js.encode()
        return d_sj_bin

    def POST(self):
        body = self.cherry.request.body.read()
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

