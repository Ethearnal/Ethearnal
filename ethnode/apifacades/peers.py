from kadem.kad import DHTFacade
from toolkit.filestore import FileSystemHashStore
from toolkit.ipgeo import FsCachedGeoIp
from toolkit.kadmini_codec import guid_int_to_hex, value_protocol, guid_hex_to_bin
import bson, json


def decode_val(t):
    if t:
        d = bson.loads(t[-1])
        if 'e' in d:
            ll = d['e']
            if len(ll) >= 1:
                dd = ll[1]
                if 'v' in dd:
                    # sanitize
                    vvv = dd['v']
                    return vvv


class PeersInfo(object):
    def __init__(self, dhf: DHTFacade, geo: FsCachedGeoIp, hfs: FileSystemHashStore):
        self._dhf = dhf
        self._geo = geo
        self._hfs = hfs
        self.peers = dict()
        self.load_data()
        self.bin_data = b''
        self.txt_data = ''

    def render_dht(self):
        for peer in self._dhf.peers:
            ip4 = peer['host']
            if ip4 in self.peers:
                data = self.peers[ip4]
            else:
                data = dict()
            data['guid'] = guid_int_to_hex(peer['id'])
            data['udp_port'] = peer['port']
            data['ip4'] = ip4
            self.peers[ip4] = data

    def render_geo(self):
        for peer in self._dhf.peers:
            ip4 = peer['host']
            if ip4 in self.peers:
                data = self.peers[ip4]
            else:
                data = dict()
            data['geo'] = self._geo.get(ip4)

    def render_profile_key(self, key):
        for ip4 in self.peers:
            data = self.peers[ip4]
            if 'guid' in data:
                bin_guid = guid_hex_to_bin(data['guid'])
                key_proto = {'profile:key': key}
                if 'profile' not in data:
                    data['profile'] = dict()
                t = self._dhf.pull_remote(key=key_proto, guid=bin_guid)
                if t:
                    val = decode_val(t)
                    if val:
                        data['profile'][key] = val

    def render_peers_data(self):
        self.render_dht()
        self.render_geo()
        self.render_profile_key('names')
        self.render_profile_key('is_cdn')
        self.render_profile_key('profilePicture')
        self.save_data(to_list=True)
        self.load_data()

    def save_data(self, to_list=False):
        peers = self.peers
        if to_list:
            peers = [self.peers[k] for k in self.peers]

        js = json.dumps(peers, ensure_ascii=False)
        self._hfs.save_bts_str_key('peers', js.encode())

    def load_data(self):
        bio = self._hfs.read_io('peers')
        if not bio:
            return
        self.bin_data = bio.read()
        self.txt_data = self.bin_data.decode()
        self.peers = json.loads(self.txt_data)

    @property
    def get_bin_data(self):
        return self.bin_data






