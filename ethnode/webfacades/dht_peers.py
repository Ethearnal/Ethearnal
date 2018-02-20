from webfacades.webbase import WebApiBase
from apifacades.peers import PeersInfo


class DhtPeers(WebApiBase):
    def __init__(self,
                 peers: PeersInfo,
                 mount_point='/api/v1/dht/peers',
                 mount_it=True):
        super(DhtPeers, self).__init__(mount_point=mount_point, mount_it=mount_it)
        self.peers = peers
        self.peers.load_data()

    def GET(self, *a, **kw):
        if 'render' in kw:
            self.peers.render_peers_data()
        return self.peers.get_bin_data
