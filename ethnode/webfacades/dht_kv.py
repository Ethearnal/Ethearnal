from webfacades.webbase import WebApiBase
from apifacades.dhtkv import DhtKv
import json
import cherrypy


class WebDhtCdnInfo(WebApiBase):
    def __init__(self,
                 dkv: DhtKv,
                 cherry=None,
                 mount_point='/api/cdn/v1/info',
                 mount_it=True):
        super(WebDhtCdnInfo, self).__init__(
            cherry=cherry,
            mount_point=mount_point,
            mount_it=mount_it
        )
        self.dkv = dkv

    def GET(self, *a, **kw):
        self.cherry.response.headers["Access-Control-Allow-Origin"] = "*"
        # bad
        if 'known' in kw:
            ll = list()
            for guid in self.dkv.dhf.known_guids():
                data = self.dkv.get('cdn_info', guid_hex=guid, local=False)
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

    def OPTIONS(self):
        self.cherry.response.headers['Access-Control-Allow-Methods'] = 'GET POST HEAD OPTIONS'
        # self.cherry.response.headers['Access-Control-Allow-Headers'] = 'content-type Content-Type'
        allow = "Accept, Accept-Encoding, Content-Length, Content-Type, X-CSRF-Token"
        self.cherry.response.headers["Access-Control-Allow-Headers"] = allow
        self.cherry.response.headers["Access-Control-Expose-Headers"] = allow
        self.cherry.response.headers['Access-Control-Allow-Origin'] = '*'
        return b''


class WebDhtCdnSelector(WebApiBase):
    K_SELECTED_CDN = 'selected_cdn'

    def __init__(self,
                 dkv: DhtKv,
                 cherry=cherrypy,
                 mount_point='/api/v1/dht/cdn',
                 mount_it=True):
        super(WebDhtCdnSelector, self).__init__(
            cherry=cherry,
            mount_point=mount_point,
            mount_it=mount_it
        )
        self.dkv = dkv

    def GET(self, *a, **kw):
        data = self.dkv.get(self.K_SELECTED_CDN, local=True)
        js = json.dumps(data)
        bs = js.encode()
        return bs

    def PUT(self):
        return self.post()
        pass

    def post(self):
        body = self.cherry.request.body.read()
        data = json.loads(body.decode())
        # todo validate, sanitize
        self.dkv.set('selected_cdn', data)
        return b''