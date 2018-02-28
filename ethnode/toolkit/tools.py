import os
import sys
import requests
# temporaly disable until find solution for windows
# import miniupnpc


def kwargs(**kwa):
    return kwa


def _mkdir(newdir):
    if os.path.isdir(newdir):
        pass
    elif os.path.isfile(newdir):
        raise OSError("The same name file as the desired "
                      "directory, '%s', already exists." % newdir)
    else:
        head, tail = os.path.split(newdir)
        if head and not os.path.isdir(head):
            _mkdir(head)

        if tail:
            os.mkdir(newdir)


def mkdir(newdir):
    _mkdir(newdir)


def mkd(newdir):
    abspath = os.path.abspath(newdir)
    _mkdir(abspath)
    return abspath


def upnp_map_port(local_port, nat_router_port, proto):
    # todo failed to install on windows
    import miniupnpc
    protos = ('TCP', 'UDP')
    if proto not in protos:
        raise ValueError('Protocol should be one %s or %s' % protos)
    upnp = miniupnpc.UPnP()
    upnp.discoverdelay = 10
    upnp.discover()
    upnp.selectigd()
    description = 'Ethearnal protocol upnp map %s %d -> %d' % (proto, nat_router_port, local_port)
    print(description)
    upnp.addportmapping(nat_router_port, proto, upnp.lanaddr, local_port, description, '')


def on_hook(target, target_args, target_kwargs):
    def wrap(func):
        def f(*args, **kwargs):
            target(*target_args, **target_kwargs)
            return func(*args, **kwargs)
        return f
    return wrap



import socket
import fcntl
import struct


def get_ip_address(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    # print(p,type(p))
    # return
    return socket.inet_ntoa(fcntl.ioctl(
        s.fileno(),
        0x8915,  # SIOCGIFADDR
        struct.pack(b'256s', ifname[:15].encode('ascii'))
    )[20:24])


class Print:
    def __call__(self, *args, **kwargs):
        repr_arg = []
        for a in args:
            try:
                repr_arg.append(repr(a))
            except:
                pass
        repr_st = ' '.join(repr_arg)
        sys.stdout.write(repr_st)
        sys.stdout.write('\n')


def boot_peers_from_http_tracker(dhf, url, key_name='dht_peers'):
    #
    r = requests.get(url)
    if r.status_code == 200:
        d = r.json()
        if key_name in d:
            l = d[key_name]
            if isinstance(l, list):
                for host_port_st in l:
                    host, port = host_port_st.split(':')
                    port = int(port)
                    dhf.boot_to(host, port)
    dhf.push_pubkey()
    dhf.pull_pubkey_in_peers()


def get_http_peers_from_http_tracker(url, key_name='http_peers'):
    r = requests.get(url)
    if r.status_code == 200:
        d = r.json()
        if key_name in d:
            return d[key_name]


def get_http_peers(url, self_ip, self_port=None, key_name='http_peers', ):
    l = get_http_peers_from_http_tracker(url=url, key_name=key_name)
    if self_ip and self_port:
        return [k for k in l if '%s:%s' % (self_ip, str(self_port)) not in k]
    else:
        return [k for k in l if self_ip not in k]


def get_top_idx(http_host_port, limit=100, endpoint='api/cdn/v1/idx?all&limit=%s'):
    endpoint_q = endpoint % limit
    get_url = 'http://%s/%s' % (http_host_port, endpoint_q)
    print('url', get_url)
    r = requests.get(get_url)
    if r.status_code == 200:
        data = r.json()
        return data


def make_sets(host_ports_list):
    return tuple([set(get_top_idx(k)) for k in host_ports_list])


def simple_indexing_consensus(hk_sets):
    u = set.intersection(*hk_sets)
    return u
# from webdht.wdht_ertapi import Indexer


def reindex_missings(idx, url, self_ip, self_port=None, key_name='http_peers'):
    misings_hks = simple_indexing_consensus(
        make_sets(get_http_peers(
            url,
            self_ip,
            self_port=self_port,
            key_name=key_name)))
    return misings_hks


class ErtLogger(object):
    def __init__(self, logger):
        self.logger = logger

    def __call__(self, *args, **kw):
        return self.logger(*args, **kw)


class DHTEventHandler(object):
    def __init__(self, handle):
        self.handle = handle

    def __call__(self, *args, **kw):
        return self.handle(*args, **kw)


def default_value(var, default):
    if var:
        return var
    else:
        return default

