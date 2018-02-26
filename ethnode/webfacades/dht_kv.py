from webfacades.webbase import WebApiBase
from apifacades.dhtkv import DhtKv
import json


class WebDhtCdnInfo(WebApiBase):
    def __init__(self,
                 dkv: DhtKv,
                 mount_point='/api/cdn/v1/info',
                 mount_it=True):
        super(WebDhtCdnInfo, self).__init__(mount_point=mount_point, mount_it=mount_it)
        self.dkv = dkv

    def GET(self, *a, **kw):
        # bad
        if 'known' in kw:
            ll = list()
            for guid in self.dkv.dhf.known_guids():
                data = self.dkv.get('cdn_info', guid_hex=guid, local=True)
                if data:
                    ll.append(data)
            if ll:
                js = json.dumps(ll, ensure_ascii=False)
                bs = js.encode()
                return bs
        data = self.dkv.get('cdn_info')
        js = json.dumps(data, ensure_ascii=False)
        bn = js.encode()
        return bn
