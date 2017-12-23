import cherrypy
import os
import config
import argparse
from dhtcdn.webapi import WebCDN, WebCDNSite
from toolkit.tools import mkdir, on_hook

site_conf = {
    '/': {
        'tools.sessions.on': True,
        'tools.staticdir.root': os.path.abspath(os.getcwd())
    },
    '/api/ui': {
        'tools.staticdir.root': os.path.abspath(os.getcwd()),
        'tools.staticdir.on': True,
        'tools.staticdir.dir': 'cdnapidef/swagger',
        'tools.staticdir.index': 'index.html',
    }

}

parser = argparse.ArgumentParser(description='Ethearnal p2p ert node')


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
                    default=config.udp_host_port,
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


parser.add_argument('-f', '--upnp_attempts',
                    help='bootstrap to web service',
                    required=False,
                    action='store_true'
                    )

args = parser.parse_args()
host, port = args.http_host_port.split(':')
udp_host, udp_port = args.http_host_port.split(':')
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

ert = EthearnalProfileController(data_dir=cdn_profile_dir, cdn_service_node=True)
cdn = WebCDN(store_dir=cdn_files_dir, cherry=cherrypy)
stor = store_handler.DHTStoreHandlerOne(
    dht_sqlite_file=ert.dht_fb_fn,
    pubkeys_sqlite_file=ert.dht_ref_pubkeys_fn
)
seeds = [(config.udp_host, config.udp_port)]
if args.udp_seed_host_port:
    seed_host, seed_port = args.udp_seed_host_port.split(':')
    seed_port = int(seed_port)
    seeds = [(seed_host, seed_port)]


dht = DHT(host=udp_host, port=int(udp_port), guid=ert.rsa_guid_int, seeds=seeds,
          storage=stor)


dhf = DHTFacade(dht, ert)

cherrypy.engine.exit = on_hook(target=tear_down_udp,
                               target_args=(dht,),
                               target_kwargs={})(cherrypy.engine.exit)
cherrypy.engine.start()
cherrypy.engine.block()
