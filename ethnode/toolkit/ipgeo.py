import requests, json
from toolkit.filestore import FileSystemHashStore

SERVICE_ENDPOINT_FS = 'http://freegeoip.net/json/%s'


def is_prv_addr(ip4: str) -> bool:
    ip4_l = [int(k) for k in ip4.split('.')]

    if ip4_l[0] == 127:
        return True

    if ip4_l[0] == 10:
        return True

    if ip4_l[0] == 172:
        if ip4_l[1] >= 16 or ip4_l[1] <= 31:
            return True

    if ip4_l[0] == 192 and ip4_l[1] == 168:
        return True


class FreeGeoIpNetClient(object):
    def __init__(self, endpoint_fmt=SERVICE_ENDPOINT_FS):
        self.endpoint_fmt = endpoint_fmt
        self.reqs = dict()

    def http_request_geodata(self, ip4: str, silent_err=True):
        if is_prv_addr(ip4):
            if silent_err:
                return None
            else:
                raise ValueError('ERRREQPRVIP requested geodata for private ip4 address')
        self.reqs[ip4] = requests.get(self.endpoint_fmt % ip4)
        return self.reqs[ip4]

    def get_req(self, ip4):
        if ip4 in self.reqs:
            return self.reqs.get(ip4)
        else:
            self.http_request_geodata(ip4)


class FsCachedGeoIp(object):
    DATA_FORMATS = ('nat', 'bin', 'txt')
    TEXT = 'txt'
    BIN = 'bin'
    NAT = 'nat'  # python native

    def __init__(self, data_dir):
        self.fs = FileSystemHashStore(data_dir)
        self.geo = FreeGeoIpNetClient()

    def get_data_from_cache(self, ip4: str, data_format='nat'):
        if ip4 in self.geo.reqs:
            if data_format == 'bin':
                return self.geo.reqs[ip4].content
            elif data_format == 'nat':
                return self.geo.reqs[ip4].json()
            elif data_format == 'txt':
                return self.geo.reqs[ip4].text
        else:
            if self.fs.has_hkey(ip4):
                bin_data = self.fs.read_io(ip4)
                if data_format == 'bin':
                    return bin_data
                elif data_format == 'nat':
                    json.loads(bin_data.read().decode())
                elif data_format == 'txt':
                    return bin_data.decode()
        return None

    def get_and_cache_data(self, ip4, data_format='nat'):
        data = self.get_data_from_cache(ip4, data_format=data_format)
        if data:
            return data
        req = self.geo.http_request_geodata(ip4)
        if req:
            if req.status_code == 200:
                self.fs.save_bts_str_key(ip4, req.content)
        data = self.get_data_from_cache(ip4, data_format=data_format)
        return data

    def get(self, ip4, data_format='nat'):
        return self.get_and_cache_data(ip4, data_format=data_format)


