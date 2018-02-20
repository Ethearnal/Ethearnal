import cherrypy
import os
import config
import argparse
from dhtcdn.webapi import WebCDN, WebCDNSite, WebCDNClientRequestHeaders
from webdht.wdht_ertapi import IdxCdnQueryWebApi
from toolkit.tools import mkdir, on_hook, get_ip_address
from apifacades.dhtkv import DhtKv

site_conf = {
    '/': {
        'tools.sessions.on': True,
        'tools.staticdir.root': os.path.abspath(os.getcwd())
    },
    '/api/cdn': {
        'tools.staticdir.root': os.path.abspath(os.getcwd()),
        'tools.staticdir.on': True,
        'tools.staticdir.dir': 'cdnapidef/swagger',
        'tools.staticdir.index': 'index.html',
    },
    '/api/ui': {
        'tools.staticdir.root': os.path.abspath(os.getcwd()),
        'tools.staticdir.on': True,
        'tools.staticdir.dir': 'apidef/swagger',
        'tools.staticdir.index': 'index.html',
    }

}
cherrypy.response.headers['Cache-Control'] = 'public, max-age=5'
parser = argparse.ArgumentParser(description='Ethearnal p2p cdn node')

parser.add_argument('-f', '--if_name',
                    default=config.ert_cdn_iface,
                    help='eth0, lo, e.g ifconfig -a and select interface name',
                    required=False,
                    type=str)


parser.add_argument('-l', '--http_host_port',
                    default=config.ertcdn_host_port,
                    help='E,g 0.0.0.0:8080',
                    required=False,
                    type=str)

parser.add_argument('-d', '--data_dir',
                    default=config.ertcdn_data_dir,
                    help='Point local cdn files data directory',
                    required=False,
                    type=str)

parser.add_argument('-p', '--profile_data_dir',
                    default=config.ertcdn_profile_data_dir,
                    help='Point local cdn profile data directory',
                    required=False,
                    type=str)


parser.add_argument('-u', '--udp_host_port',
                    default=config.ertcdn_udp_host_port,
                    help='E,g 127.0.0.1:3000',
                    required=False,
                    type=str)


parser.add_argument('-s', '--udp_seed_host_port',
                    default=None,
                    help='E,g 127.0.0.1:3000',
                    required=False,
                    type=str)


parser.add_argument('-i', '--interactive_shell',
                    help='embed ipython shell',
                    required=False,
                    action='store_true'
                    )

parser.add_argument('-b', '--dht_only',
                    help='only udb dht',
                    required=False,
                    action='store_true'
                    )


parser.add_argument('-n', '--no_upnp_attempts',
                    help='bootstrap to web service',
                    required=False,
                    action='store_true'
                    )


parser.add_argument('-r', '--http_relay_get_url',
                    default=None,
                    help='http://frankfurt.ethearnal.com:5678/api/cdn/v1/resource',
                    required=False,
                    type=str)

parser.add_argument('-g', '--converge_pk_and_peers',
                    help='exchange pk keys and peers with boot peer',
                    required=False,
                    action='store_true'
                    )


args = parser.parse_args()
host, port = args.http_host_port.split(':')
udp_host, udp_port = args.udp_host_port.split(':')
print('UDP %s:%s' % (udp_host, udp_port))
print('HTTP %s:%s' % (host, port))
udp_port = int(udp_port)
cdn_profile_dir = args.profile_data_dir
cdn_files_dir = args.data_dir
cherrypy.server.socket_host = host
cherrypy.server.socket_port = int(port)
cherrypy.tree.mount(WebCDNSite(), '/', site_conf)
cdn_profile_dir = os.path.abspath(cdn_profile_dir)
cdn_files_dir = os.path.abspath(cdn_files_dir)

# main data
if os.path.isdir(cdn_profile_dir):
    print('Using existing profile directory: %s' % cdn_profile_dir)
else:
    mkdir(cdn_profile_dir)

# uploaded files
if os.path.isdir(cdn_files_dir):
    print('Using existing profile directory: %s' % cdn_files_dir)
else:
    mkdir(cdn_files_dir)
from ert_profile import EthearnalProfileController
from kadem.kad import DHT
from kadem.kad import DHTFacade
from toolkit import store_handler
from ert import tear_down_udp, punch_dht_udp_hole
from webdht.wdht import OwnerGuidHashIO, WebDHTKnownGuids
from webdht.wdht_ertapi import WebDHTKnownPeers, WebDHTProfileKeyVal, WebDHTAboutNode
from webdht.wdht_ertapi import DhtGigsHkeysWebAPI, DhtGetByHkeyWebAPI, DhtPortfoliosWebAPI, Indexer
from toolkit import upnp

ert = EthearnalProfileController(data_dir=cdn_profile_dir, cdn_service_node=True)
ip = get_ip_address(args.if_name)
ert.my_wan_ip = ip
ert.my_lan_ip = ip

http_relay_get_url = args.http_relay_get_url

stor = store_handler.DHTStoreHandlerOne(
    dht_sqlite_file=ert.dht_fb_fn,
    pubkeys_sqlite_file=ert.dht_ref_pubkeys_fn
)

seeds = [(config.udp_host, config.udp_port)]

try:
    seed_host, seed_port = args.udp_seed_host_port.split(':')
    if seed_host and seed_port and (host, port) != (seed_host, seed_port):
        print('BOOTSTRAP TO SEED', seed_host, seed_port)
        seeds = [(seed_host, seed_port)]
except Exception as e:
    print('Errot occured when tried to boot on seeds', seeds)
    print(e)
    # todo
    pass

if args.udp_seed_host_port:
    seed_host, seed_port = args.udp_seed_host_port.split(':')
    seed_port = int(seed_port)
    seeds = [(seed_host, seed_port)]


dht = DHT(host=ert.my_lan_ip, port=int(udp_port), guid=ert.rsa_guid_int, seeds=seeds,
          storage=stor)


dhf = DHTFacade(dht, ert)
d = dhf

idx = Indexer(ert=ert, dhf=dhf)

cdn = WebCDN(store_dir=cdn_files_dir, dhf=dhf, cherry=cherrypy, http_relay_get_url=http_relay_get_url)

req = WebCDNClientRequestHeaders()

idx_web = IdxCdnQueryWebApi(cherrypy=cherrypy, idx=idx)

from webdht.bundle import DHTEventHandler,DocModelIndexQuery

evt = DHTEventHandler(d.dht.storage, data_dir=ert.personal_dir)
qidx = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Gig.model'])

knownguids = WebDHTKnownGuids(
    cherry=cherrypy,
    dhtf=dhf,
    mount_point='/api/v1/dht/guids'
)


dht_ip4 = WebDHTKnownPeers(
    cherry=cherrypy,
    dhf=dhf,
)

dht_profile = WebDHTProfileKeyVal(
    cherry=cherrypy,
    dhf=dhf,
)

dht_node = WebDHTAboutNode(
    cherry=cherrypy,
    dhf=dhf,
)



from apifacades.peers import PeersInfo
from toolkit.ipgeo import FsCachedGeoIp
from webfacades.dht_peers import WebDhtPeers
from toolkit.filestore import AutoDirHfs
from webfacades.dht_kv import WebDhtCdnInfo
#

ert.cdn_service_http_url = 'http://%s:%s' % (ip, port)
hfs_dir = '%s/%s' % (ert.data_dir, config.hfs_dir)
mkdir(hfs_dir)
print('HFS_DIR: %s' % hfs_dir)
geo = FsCachedGeoIp(AutoDirHfs(hfs_dir, 'geo_hfs'))
peers = PeersInfo(
    dhf=d,
    geo=geo,
    hfs=AutoDirHfs(hfs_dir, 'peers_hfs')
)
web_peers = WebDhtPeers(peers=peers)
cdn_info = {
    'http': {
        'service_url': ert.cdn_service_http_url,
        'geo': geo.get(ip4=ip),
        'ip4': ip,
        'port': port,
    }

}
dkv = DhtKv(d)
dkv.set('is_cdn', True)
dkv.set('cdn_info', cdn_info)
dht_info = WebDhtCdnInfo(dkv)

cherrypy.config.update({
    'global': {
        'engine.autoreload.on': False,
        'server.thread_pool': 120,
    }
})

#

from webdht.bundle import DHTEventHandler, DocModelIndexQuery

evt = DHTEventHandler(dhf.dht.storage, data_dir=ert.personal_dir)
qidx = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Gig.model'])
# qpro = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Profile.key'])

cherrypy.engine.exit = on_hook(target=tear_down_udp,
                               target_args=(dht,),
                               target_kwargs={})(cherrypy.engine.exit)




print('HTTP service IP url:', ert.cdn_service_http_url)

if dht.server_thread.is_alive():
    print('UDP server thread is alive')
else:
    print('UDP server thread id dead')

if args.converge_pk_and_peers:
    print('CONVERGE PEERS')
    d.converge_peers()

cherrypy.engine.start()



if args.interactive_shell:
    from IPython import embed
    embed()
else:
    cherrypy.engine.block()
