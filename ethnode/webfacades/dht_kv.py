from webfacades.webbase import WebApiBase
from apifacades.dhtkv import DhtKv
from toolkit.filestore import FileSystemHashStore
import json
import cherrypy
import config
import requests


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
        self.dkv.set(self.K_SELECTED_CDN, data)
        return b''


class WebDhtCdnList(WebApiBase):
    K_OWN_CDN_LIST = 'cdn_list'

    def __init__(self,
                 dkv: DhtKv,
                 cherry=cherrypy,
                 cdn_list=None,
                 enable_cors=True,
                 mount_point='/api/v1/dht/cdn-list',
                 mount_it=True):
        super(WebDhtCdnList, self).__init__(
            cherry=cherry,
            mount_point=mount_point,
            mount_it=mount_it
        )
        self.cdn_list = cdn_list
        if not cdn_list:
            self.cdn_list = config.cdn_list
        self.dkv = dkv
        self.dkv.set(self.K_OWN_CDN_LIST, self.cdn_list)
        self.enable_cors = enable_cors,

    def GET(self, *a, **kw):
        if self.enable_cors:
            self.cherry.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
            self.cherry.response.headers['Access-Control-Allow-Headers'] = 'content-type'
            self.cherry.response.headers['Access-Control-Allow-Origin'] = '*'
        data = self.dkv.get(self.K_OWN_CDN_LIST, local=True)
        js = json.dumps(data)
        bs = js.encode()
        return bs

    def PUT(self):
        if self.enable_cors:
            self.cherry.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
            self.cherry.response.headers['Access-Control-Allow-Headers'] = 'content-type'
            self.cherry.response.headers['Access-Control-Allow-Origin'] = '*'
        return self.post()
        pass

    def post(self):
        body = self.cherry.request.body.read()
        data = json.loads(body.decode())
        # todo validate, sanitize
        self.dkv.set(self.K_OWN_CDN_LIST, data)
        return b''


class WebCdnClusterTracker(WebApiBase):
    def __init__(self,
                 hfs: FileSystemHashStore,
                 enable_cors=True,
                 cherry=cherrypy,
                 mount_point='/api/cdn/v1/track',
                 mount_it=True):

        super(WebCdnClusterTracker, self).__init__(
            cherry=cherry,
            mount_point=mount_point,
            mount_it=mount_it
        )
        self.hfs = hfs
        self.enable_cors = enable_cors
        # truncate previous saved data
        self.hfs.save_bts_str_key('tracker', json.dumps({'cluster_members': []},
                                                        ensure_ascii=False).encode())

    def save_data(self, data, key='tracker'):
        js = json.dumps(data, ensure_ascii=False)
        self.hfs.save_bts_str_key(key, js.encode())

    def load_data(self, key='tracker', bin_only=False):
        bio = self.hfs.read_io(key)
        if not bio:
            return
        bin_data = bio.read()
        if bin_only:
            return bin_data
        txt_data = bin_data.decode()
        data = json.loads(txt_data)
        return data

    def join_cluster(self, host_port: str):
        tracker_data = self.load_data()
        ll = None
        if not tracker_data:
            tracker_data = dict()
            ll = list()
            tracker_data['cluster_members'] = ll
        elif 'cluster_members' in tracker_data:
            ll = tracker_data['cluster_members']
        else:
            ll = list()
            tracker_data['cluster_members'] = ll

        if host_port not in ll:
            ll.append(host_port)

        self.save_data(tracker_data)
        msg = 'JOIN(%s)' % host_port
        print(msg)
        return msg.encode()

    def get_tracker_data(self):
        return self.load_data(bin_only=True)

    def PUT(self):
        if self.enable_cors:
            self.cherry.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
            self.cherry.response.headers['Access-Control-Allow-Headers'] = 'content-type'
            self.cherry.response.headers['Access-Control-Allow-Origin'] = '*'
        headers = self.cherry.request.headers
        host_port = 'null'
        if "Remote-Addr" in headers:
            # todo custom port
            host_port = '%s:%s' % (headers["Remote-Addr"], '5678')
            self.join_cluster(host_port)
            return host_port.encode()
        return host_port

    def GET(self):
        if self.enable_cors:
            self.cherry.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
            self.cherry.response.headers['Access-Control-Allow-Headers'] = 'content-type'
            self.cherry.response.headers['Access-Control-Allow-Origin'] = '*'
        return self.get_tracker_data()


class WebCdnClusterTrackerClient(object):
    def __init__(self, http_host_port, scheme='http:', endpoint='/api/cdn/v1/track'):
        self.host_port = http_host_port
        self.scheme = scheme
        self.endpoint = endpoint

    @property
    def url(self):
        return self.url_st(self.scheme, self.host_port, self.endpoint)

    @staticmethod
    def url_st(scheme, host_port, endpoint) -> str:
        return '%s//%s%s' % (scheme, host_port, endpoint)

    def join(self, scheme=None, host_port=None, endpoint=None):
        # todo pass listen port now hardcoded to 5678 ( default cdn port)
        if not endpoint:
            endpoint = self.endpoint
        if not scheme:
            scheme = self.scheme
        if not host_port:
            host_port = self.host_port

        url = self.url_st(scheme, host_port, endpoint)

        print('JOIN TO: %s' % url)
        r = requests.put(url)
        if r.status_code == 200:
            return r.content.decode()

    def data(self, scheme=None, host_port=None, endpoint=None):
        if not endpoint:
            endpoint = self.endpoint
        if not scheme:
            scheme = self.scheme
        if not host_port:
            host_port = self.host_port
        url = self.url_st(scheme, host_port, endpoint)
        r = requests.get(url)
        if r.status_code == 200:
            return r.json()



