import cherrypy
import os
import config
import argparse
from dhtcdn.webapi import WebCDN, WebCDNSite, WebCDNClientRequestHeaders
from webdht.wdht_ertapi import IdxCdnQueryWebApi
from toolkit.tools import mkdir, on_hook, get_ip_address
from apifacades.dhtkv import DhtKv
from toolkit.tools import GigIndexConsensus

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
    # '/api/ui': {
    #     'tools.staticdir.root': os.path.abspath(os.getcwd()),
    #     'tools.staticdir.on': True,
    #     'tools.staticdir.dir': 'apidef/swagger',
    #     'tools.staticdir.index': 'index.html',
    # }

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

parser.add_argument('-c', '--http_config_url',
                    default=None,
                    help='htp url with config json',
                    required=False,
                    type=str)


parser.add_argument('-x', '--http_proxy_service',
                    default=None,
                    help='host:port',
                    required=False,
                    type=str)


parser.add_argument('-g', '--converge_pk_and_peers',
                    help='exchange pk keys and peers with boot peer',
                    required=False,
                    action='store_true'
                    )


parser.add_argument('-t', '--self_test_and_exit',
                    help='run self testing and exit',
                    required=False,
                    action='store_true'
                    )


parser.add_argument('-y', '--do_idx_consensus',
                    help='run self testing and exit',
                    required=False,
                    action='store_true')

parser.add_argument('-z', '--idx_consensus_limit',
                    default=config.idx_consensus_limit,
                    help='hk on retrieved index result for index sync/consensus',
                    required=False,
                    type=int)



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
from ert import tear_down_udp
# from ert import punch_dht_udp_hole
# from webdht.wdht import OwnerGuidHashIO, WebDHTKnownGuids
# from webdht.wdht_ertapi import WebDHTKnownPeers, WebDHTProfileKeyVal, WebDHTAboutNode
# from webdht.wdht_ertapi import DhtGigsHkeysWebAPI, DhtGetByHkeyWebAPI, DhtPortfoliosWebAPI
from webdht.wdht_ertapi import Indexer
# from toolkit import upnp

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

rel_urls = None
if args.http_config_url:
    from toolkit.tools import get_http_peers_from_http_tracker
    from toolkit.tools import boot_peers_from_http_tracker
    # url = 'http://159.65.56.140:8080/cluster.json'
    relays = get_http_peers_from_http_tracker(args.http_config_url)
    rel_urls = ['http://%s/api/cdn/v1/resource' % k for k in relays if ip not in k]
    # self.relays = set(rurl)
    boot_peers_from_http_tracker(dhf, args.http_config_url)

cdn = WebCDN(store_dir=cdn_files_dir, dhf=dhf, cherry=cherrypy,
             http_relay_urls=rel_urls,
             http_relay_get_url=http_relay_get_url)

cnx = None
if args.http_config_url and args.do_idx_consensus:
    cnx = GigIndexConsensus(args.http_config_url, idx, ip, port, limit=args.idx_consensus_limit)
    try:
        cnx.reindex()
    except Exception as e:
        print('Consensus not happend due to failed services in http_config')
        print(e)
        print('--')

req = WebCDNClientRequestHeaders()

idx_web = IdxCdnQueryWebApi(cherrypy=cherrypy, idx=idx)

from webdht.bundle import DHTEventHandler,DocModelIndexQuery

evt = DHTEventHandler(d.dht.storage, data_dir=ert.personal_dir)
qidx = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Gig.model'])

# knownguids = WebDHTKnownGuids(
#     cherry=cherrypy,
#     dhtf=dhf,
#     mount_point='/api/v1/dht/guids'
# )
#
#
# dht_ip4 = WebDHTKnownPeers(
#     cherry=cherrypy,
#     dhf=dhf,
# )
#
# dht_profile = WebDHTProfileKeyVal(
#     cherry=cherrypy,
#     dhf=dhf,
# )
#
# dht_node = WebDHTAboutNode(
#     cherry=cherrypy,
#     dhf=dhf,
# )


from apifacades.peers import PeersInfo
from toolkit.ipgeo import FsCachedGeoIp
from webfacades.dht_peers import WebDhtPeers
from toolkit.filestore import AutoDirHfs
from webfacades.dht_kv import WebDhtCdnInfo
#
if args.http_proxy_service:
    proxy_ip, proxy_port = args.http_proxy_service.split(':')
    ert.cdn_service_http_url = 'http://%s:%s' % (proxy_ip, proxy_port)
else:
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
web_peers = WebDhtPeers(peers=peers, cherry=cherrypy)
cdn_info = {
    'http': {
        'service_url': ert.cdn_service_http_url,
        'geo': geo.get(ip4=ip),
        'ip4': ip,
        'port': port,
    }

}
ert.cdn_host = ip
ert.cdn_port = int(port)
dkv = DhtKv(d)
dkv.set('is_cdn', True)
dkv.set('cdn_info', cdn_info)
dht_info = WebDhtCdnInfo(dkv, cherry=cherrypy, mount_it=True)
# Cache-Control:public, max-age=5 # in seconds
cherrypy.response.headers['Cache-Control'] = 'public, max-age=5'
cherrypy.config.update({
    'global': {
        'engine.autoreload.on': False,
        'server.thread_pool': 120,
    }
})


#

from webdht.bundle import DHTEventHandler, DocModelIndexQuery

evt = DHTEventHandler(dhf.dht.storage, data_dir=ert.personal_dir)
# qidx = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Gig.model'])
eidx = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Event.model'])
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


if args.self_test_and_exit:
    #todo impl testing here
    import sys
    from time import sleep
    print('Running CDN cdn.py self test ')
    print('.')
    sleep(1)
    print('.')
    sleep(1)
    print('OK')
    tear_down_udp(dhf.dht)
    cherrypy.engine.stop()
    sys.exit(0)


if args.interactive_shell:
    from IPython import embed
    from toolkit.tools import get_http_peers_from_http_tracker
    embed()
else:
    cherrypy.engine.block()
