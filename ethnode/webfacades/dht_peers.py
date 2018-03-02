from webfacades.webbase import WebApiBase
from apifacades.peers import PeersInfo


class WebDhtPeers(WebApiBase):
    def __init__(self,
                 peers: PeersInfo,
                 cherry=None,
                 mount_point='/api/v1/dht/peers',
                 mount_it=True,
                 enable_cors=False):
        super(WebDhtPeers, self).__init__(cherry=cherry, mount_point=mount_point, mount_it=mount_it)
        self.peers = peers
        self.peers.load_data()
        self.enable_cors = enable_cors

    def GET(self, *a, **kw):
        if 'render' in kw:
            self.peers.render_peers_data()
        return self.peers.get_bin_data

    def OPTIONS(self):
        if self.enable_cors:
            self.cherry.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
            self.cherry.response.headers['Access-Control-Allow-Headers'] = 'content-type'
            self.cherry.response.headers['Access-Control-Allow-Origin'] = '*'
            # tell CherryPy no avoid normal handler
        return b''


