import cherrypy
import os
import config
import argparse
from dhtcdn.webapi import WebCDN, WebCDNSite
from webdht.wdht_ertapi import IdxCdnQueryWebApi
from toolkit.tools import mkdir, on_hook

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


parser.add_argument('-l', '--http_host_port',
                    default=config.ertcdn_dev_bootstrap_host_port,
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

local_ip = upnp.get_my_ip()
print('UDP_PORT', udp_port)
print('LOCAL IP', local_ip)

if not args.no_upnp_attempts:
    if local_ip != ert.my_wan_ip:
        if not punch_dht_udp_hole(udp_port):
            print('\n\n\n\ PUNCH UDP HOLE FAILED \n\n\n')
    ert.my_lan_ip = local_ip



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
except:
    pass

if args.udp_seed_host_port:
    seed_host, seed_port = args.udp_seed_host_port.split(':')
    seed_port = int(seed_port)
    seeds = [(seed_host, seed_port)]

# seeds = []

dht = DHT(host=udp_host, port=int(udp_port), guid=ert.rsa_guid_int, seeds=seeds,
          storage=stor)


dhf = DHTFacade(dht, ert)
d = dhf

idx = Indexer(ert=ert, dhf=dhf)
# idx_engine =

cdn = WebCDN(store_dir=cdn_files_dir, dhf=dhf, cherry=cherrypy)

idx_web = IdxCdnQueryWebApi(cherrypy=cherrypy, idx=idx)

knownguids = WebDHTKnownGuids(
    cherry=cherrypy,
    dhtf=dhf,
    mount_point='/api/v1/dht/guids'
)

dht_get_hk = DhtGetByHkeyWebAPI(
    cherry=cherrypy,
    dhf=dhf,
)

dht_gigs_hk = DhtGigsHkeysWebAPI(
    cherry=cherrypy,
    dhf=dhf,
    me_owner=OwnerGuidHashIO(ert.rsa_guid_hex)
)

dht_portfolios_hk = DhtPortfoliosWebAPI(
    cherry=cherrypy,
    dhf=dhf,
    me_owner=OwnerGuidHashIO(ert.rsa_guid_hex)
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


def cors():
  if cherrypy.request.method == 'OPTIONS':
    # preflign request
    # see http://www.w3.org/TR/cors/#cross-origin-request-with-preflight-0
    cherrypy.response.headers['Access-Control-Allow-Methods'] = 'POST GET'
    cherrypy.response.headers['Access-Control-Allow-Headers'] = 'content-type'
    cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'
    # tell CherryPy no avoid normal handler
    return True
  else:
    cherrypy.response.headers['Access-Control-Allow-Origin'] = '*'

cherrypy.tools.cors = cherrypy._cptools.HandlerTool(cors)

# cherrypy.tools.CORS = cherrypy.Tool('before_handler', cors)

cherrypy.engine.exit = on_hook(target=tear_down_udp,
                               target_args=(dht,),
                               target_kwargs={})(cherrypy.engine.exit)
ip = None
if ert.my_lan_ip:
    ip = ert.my_lan_ip
if ert.my_wan_ip:
    ip = ert.my_wan_ip
if not ip:
    raise Exception('NO LAN OR WAN IP')
ert.cdn_service_http_url = 'http://%s:%s' % (ip, port)

if dht.server_thread.is_alive():
    print('UDP server thread is alive')
else:
    print('UDP server thread id dead')

cherrypy.engine.start()

if args.interactive_shell:
    from IPython import embed
    embed()
else:
    cherrypy.engine.block()
