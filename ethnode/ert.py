import cherrypy
import os
import sys
import traceback
import config
import argparse
# from random import randint
#
from kadem.kad import DHT, DHTFacade

from toolkit.tools import mkdir, on_hook
from toolkit import kadmini_codec
from toolkit import store_handler
from toolkit import upnp

from ert_profile import EthearnalProfileController

from webdht.wdht import OwnerGuidHashIO, WebDHTKnownGuids
from webdht.wdht_ertapi import WebDHTKnownPeers, WebDHTProfileKeyVal, WebDHTAboutNode
from webdht.wdht_ertapi import DhtGigsHkeysWebAPI, DhtGetByHkeyWebAPI
from webdht.wdht_ertapi import Indexer

from apifacades.dhtkv import DhtKv
from webfacades.dht_kv import WebDhtCdnSelector


parser = argparse.ArgumentParser(description='Ethearnal p2p ert node')


parser.add_argument('-f', '--if_name',
                    default=config.ert_cdn_iface,
                    help='eth0, lo, e.g ifconfig -a and select interface name',
                    required=False,
                    type=str)


parser.add_argument('-l', '--http_host_port',
                    default=config.http_host_port,
                    help='E,g 127.0.0.1:8080',
                    required=False,
                    type=str)

parser.add_argument('-d', '--data_dir',
                    default=config.data_dir,
                    help='Point local profile data directory',
                    required=False,
                    type=str)

parser.add_argument('-w', '--http_webdir',
                    default=config.http_webdir,
                    help='Point ui html static dir',
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

parser.add_argument('-j', '--json_data_to_profile',
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


parser.add_argument('-p', '--cdn_bootstrap_host_port',
                    default=config.ertcdn_dev_bootstrap_host_port,
                    help='bootstrap to web service',
                    required=False,
                    )

parser.add_argument('-n', '--upnp_attempt',
                    help='bootstrap to web service',
                    required=False,
                    action='store_true'
                    )


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

parser.add_argument('-c', '--http_config_url',
                    default=None,
                    help='htp url with config json',
                    required=False,
                    type=str)


parser.add_argument('-o', '--shared_profile_instance_id',
                    default=0,
                    help='htp url with config json',
                    required=False,
                    type=int)


# shared_profile_instance_id




class EthearnalSite(object):
    @cherrypy.expose
    def index(self):
        print('REQ LOCAL', cherrypy.request.local)
        return "ErtAPI: Ethearnal 0.0.1"
    # todo make entry point redirect to ui


def main_dht(host: str, port: int, store: store_handler.DHTStoreHandlerOne,
             guid: int =None, seed_host=None, seed_port=None):

    if seed_host and seed_port and (host, port) != (seed_host, seed_port):
        print('BOOTSTRAP TO SEED', seed_host, seed_port)
        dht = DHT(host=host, port=port, guid=guid,  seeds=[(seed_host, seed_port)],
                  storage=store)
    else:
        dht = DHT(host=ert.my_wan_ip, port=port, guid=guid, storage=store)
    return dht


def tear_down_udp(dht):
    print('ERT: UDP stopping...')
    if dht:
        dht.server.shutdown()


def main_profile(http_webdir,
                 files_dir_name,
                 cdn_host,
                 cdn_port,
                 shared_profile_instance_id=0):

    http_webdir = os.path.abspath(http_webdir)

    files_dir = os.path.abspath('%s/%s' % (profile_dir, files_dir_name))
    if not os.path.isdir(files_dir):
        print('Creating dir for static files')
        mkdir(files_dir)
    profile_dir_abs = os.path.abspath(profile_dir)

    ert_profile_ctl = EthearnalProfileController(data_dir=profile_dir_abs,
                                                 cdn_bootstrap_host=cdn_host,
                                                 cdn_bootstrap_port=cdn_port,
                                                 shared_profile_instance_id=shared_profile_instance_id
                                                 )
    return ert_profile_ctl


def main_http(http_webdir: str = config.http_webdir,
              socket_host: str = config.http_socket_host,
              socket_port: int = config.http_socket_port,
              ert_profile_ctl: EthearnalProfileController = None,
              # ert_profile_view: EthearnalProfileView = None,
              files_dir_name: str = config.static_files,
              interactive: bool = config.interactive,
              dht_=None,
              dht_facade_=None
              ):

    site_conf = {
        '/': {
            'tools.sessions.on': True,
            'tools.staticdir.root': os.path.abspath(os.getcwd())
        },
        '/ui': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': http_webdir,
            'tools.staticdir.index': 'index.html',
        },
        '/ui/network': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': http_webdir,
            'tools.staticdir.index': 'network.html',
        },
        '/ui/profile': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': http_webdir,
            'tools.staticdir.index': 'profile.html',
        },
         '/ui/profiles': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': http_webdir,
            'tools.staticdir.index': 'profiles.html',
        },
        # '/ui/files': {
        #     'tools.staticdir.on': True,
        #     'tools.staticdir.root': ert_profile_ctl.data_dir,
        #     'tools.staticdir.dir': files_dir_name,
        # },
        '/api/ui': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': 'apidef/swagger',
            'tools.staticdir.index': 'index.html',
        }

    }

    cherrypy.server.socket_host = socket_host
    cherrypy.server.socket_port = socket_port
    # Cache-Control:public, max-age=5 # in seconds
    cherrypy.response.headers['Cache-Control'] = 'public, max-age=5'

    cherrypy.tree.mount(EthearnalSite(), '/', site_conf)
    cherrypy.config.update({
        'global': {
            'engine.autoreload.on': False,
            'server.thread_pool': 120,
        }
    })

    idx = Indexer(ert=ert, dhf=dht_facade_)

    # select and save CDN service
    dkv = DhtKv(d)
    dkv.set(WebDhtCdnSelector.K_SELECTED_CDN, "%s:%s" % (ert.cdn_host, ert.cdn_port))
    cdn_select = WebDhtCdnSelector(dkv)


    knownguids = WebDHTKnownGuids(
        cherry=cherrypy,
        dhtf=dht_facade_,
        mount_point='/api/v1/dht/guids'
    )

    dht_get_hk = DhtGetByHkeyWebAPI(
        cherry=cherrypy,
        dhf=dht_facade_,
    )


    dht_gigs_hk = DhtGigsHkeysWebAPI(
        cherry=cherrypy,
        dhf=dht_facade_,
        me_owner=OwnerGuidHashIO(ert_profile_ctl.rsa_guid_hex)
    )
    # don't delete this
    # events = DhtEventsHkeysWebAPI(
    #     cherry=cherrypy,
    #     dhf=dht_facade_,
    #     me_owner=OwnerGuidHashIO(ert_profile_ctl.rsa_guid_hex),
    # )
    #
    # dht_portfolios_hk = DhtPortfoliosWebAPI(
    #     cherry=cherrypy,
    #     dhf=dht_facade_,
    #     me_owner=OwnerGuidHashIO(ert_profile_ctl.rsa_guid_hex)
    # )

    dht_ip4 = WebDHTKnownPeers(
        cherry=cherrypy,
        dhf=dht_facade_,
    )

    dht_profile = WebDHTProfileKeyVal(
        cherry=cherrypy,
        dhf=dht_facade_,
    )

    dht_node = WebDHTAboutNode(
        cherry=cherrypy,
        dhf=dht_facade_,
    )
    from webfacades.dht_peers import WebDhtPeers
    from toolkit.filestore import AutoDirHfs
    hfs_dir = '%s/%s' % (ert.data_dir, config.hfs_dir)
    mkdir(hfs_dir)
    print('HFS_DIR: %s' % hfs_dir)

    rel_urls = None
    if args.http_config_url:
        from toolkit.tools import get_http_peers_from_http_tracker
        from toolkit.tools import boot_peers_from_http_tracker
        # url = 'http://159.65.56.140:8080/cluster.json'
        relays = get_http_peers_from_http_tracker(args.http_config_url)
        rel_urls = ['http://%s/api/cdn/v1/resource' % k for k in relays if ip not in k]
        # self.relays = set(rurl)
        boot_peers_from_http_tracker(d, args.http_config_url)


    peers = PeersInfo(
        dhf=d,
        geo=FsCachedGeoIp(AutoDirHfs(hfs_dir, 'geo_hfs')),
        hfs=AutoDirHfs(hfs_dir, 'peers_hfs')
    )

    web_peers = WebDhtPeers(peers=peers, cherry=cherrypy)

    from webdht.bundle import DocumentCollectionCRD, DHTEventHandler, DocModelIndexQuery
    # from webdht.test_bndle_gig import Gigs as test_gig_data

    # nes bundle
    c = DocumentCollectionCRD(
        'Event',
        dhf=dht_facade_,
        own_guid_hex=ert.rsa_guid_hex,
        key_composer=None,
    )
    from apifacades.events import SelfEvent
    se = SelfEvent(c)

    evt = DHTEventHandler(dht_facade_.dht.storage, data_dir=ert_profile_ctl.personal_dir)
    qidx = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Gig.model'])
    eidx = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Event.model'])
    # qpro = DocModelIndexQuery(evt.doc_indexers.MODEL_INDEXERS['.Profile.key'])

    cherrypy.engine.start()

    print('WEBUI DIR:', http_webdir)
    print('PROFILE DIR:', ert_profile_ctl.data_dir)

    cherrypy.engine.exit = on_hook(target=tear_down_udp,
                                   target_args=(dht_,),
                                   target_kwargs={})(cherrypy.engine.exit)

    # import asyncio
    # import datetime
    # import random
    # import websockets
    # try:
    #     async def time(websocket, path):
    #         while True:
    #             now = datetime.datetime.utcnow().isoformat() + 'Z'
    #             await websocket.send(now)
    #             await asyncio.sleep(random.random() * 3)
    #
    #     start_server = websockets.serve(time, '127.0.0.1', 6789)
    #     asyncio.get_event_loop().run_until_complete(start_server)
    #     asyncio.get_event_loop().run_forever()
    # except Exception as e:
    #     print(str(e))
    #     sys.exit()

    if not interactive:
        cherrypy.engine.block()
    else:
        try:
            from IPython import embed
            embed()
        except:
            pass


def punch_dht_udp_hole(port, attempts=3, proto='UDP'):
    punch_hole_failed = True
    for i in range(attempts):
        pass
        # print('\n\n\n UPnP try firewall punch hole')
        try:
            if upnp.punch_port(port, port, proto=proto):
                punch_hole_failed = False
                break
            else:
                pass
                # print('\n\n\n FAIL: UPnP try firewall punch hole')
        except Exception as e:
            pass
            # print('\n\n\n FAIL: UPnP try firewall punch hole', str(e))

    if punch_hole_failed:
        # print('\n\n\n PUNCH HOLE IN FIREWALL FAILED')
        return False
    else:
        return True


if __name__ == '__main__':
    args = parser.parse_args()
    socket_host, socket_port = args.http_host_port.split(':')
    profile_dir = args.data_dir
    http_webdir = args.http_webdir
    socket_port = int(socket_port)
    udp_host, udp_port = args.udp_host_port.split(':')
    udp_port = int(udp_port)
    seed_host = None
    seed_port = None
    upnp_attempt = args.upnp_attempt
    # cdn_selected = args.cdn_bootstrap_host_port
    boot_cdn_host, boot_cdn_port = args.cdn_bootstrap_host_port.split(':')
    json_data_to_profile = args.json_data_to_profile

    print('boot-cdn', boot_cdn_host, boot_cdn_port)

    if args.udp_seed_host_port:
        seed_host, seed_port = args.udp_seed_host_port.split(':')
        seed_port = int(seed_port)

    if os.path.isdir(args.data_dir):
        print('Using existing profile directory: %s' % profile_dir)
    else:
        mkdir(profile_dir)

    dht = None
    d = None
    dl = None

    try:
        ert_profile_ctl = main_profile(
            http_webdir=http_webdir,
            files_dir_name=config.static_files,
            cdn_host=boot_cdn_host,
            cdn_port=boot_cdn_port,
            shared_profile_instance_id=args.shared_profile_instance_id
        )
        ert = ert_profile_ctl
        if args.upnp_attempt:
            upnp.punch_port(udp_port, udp_port, args.if_name)

        hex_guid, bin_guid = ert_profile_ctl.rsa_guid_hex_bin
        int_guid = kadmini_codec.guid_bts_to_int(bin_guid)
        bts_2 = kadmini_codec.guid_int_to_bts(int_guid)
        hex2_guid = kadmini_codec.guid_int_to_hex(int_guid)

        assert hex2_guid == hex_guid
        #
        storage_handle = store_handler.DHTStoreHandlerOne(
            dht_sqlite_file=ert.dht_fb_fn,
            pubkeys_sqlite_file=ert.dht_ref_pubkeys_fn,
        )

        # local_ip = upnp.get_my_ip()
        # todo
        from toolkit.tools import get_ip_address
        local_ip = get_ip_address(args.if_name)
        ip = local_ip
        ert_profile_ctl.my_wan_ip = ip
        ert_profile_ctl.my_lan_ip = ip
        print('UDP_PORT', udp_port)
        print('LOCAL IP', local_ip)

        dht = main_dht(ip, udp_port,
                       store=storage_handle,
                       guid=int_guid,
                       seed_host=seed_host,
                       seed_port=seed_port)
        d = DHTFacade(dht, ert_profile_ctl)

        if dht.server_thread.is_alive():
            print('UDP server thread is alive')
        else:
            print('UDP server thread id dead')

        from toolkit.ipgeo import FsCachedGeoIp
        from apifacades.peers import PeersInfo
        from toolkit.filestore import FileSystemHashStore

        # geo = FsCachedGeoIp('hfs_demo')
        # peers_hfs = FileSystemHashStore('peers_hfs_demo')
        # peers = PeersInfo(
        #     dhf=d,
        #     geo=FsCachedGeoIp('hfs_demo'),
        #     hfs=peers_hfs
        # )
        # todo move this
        # pro = DHTProfile(d)
        # gigs = DHTProfileCollection(dhf=d, collection_name='gig')
        # verbs_src = 'data_demo/txt_wordnet/data.verb'
        # cdn_data_dir = 'data_demo/cdn1_d'
        # from helpers.wordnet_parser import WordnetParser, ImagesFromCdnData, GigGeneratorWordnet
        #
        # gen = GigGeneratorWordnet(WordnetParser(verbs_src), ImagesFromCdnData(cdn_data_dir))
        # if json_data_to_profile:
        #     from time import sleep
        #     from random import randint
        #     jsd = ProfileJsonData(json_file_name=json_data_to_profile,
        #                           pro=pro,
        #                           )
        #     sleep(3)
        #     d.converge_peers()
        #     sleep(3)
        #     jsd.update()
        #     sleep(3)
        #     category_domain = jsd.data['domain']
        #     gigs_data = jsd.data['gigs']
        #     for gig_entry in gigs_data:
        #         gig_entry['lock'] = randint(1, 100)
        #         gig_entry['price'] = randint(1, 1999)
        #         gig_entry['category'] = category_domain
        #         gig_entry['general_domain_of_expertise'] = category_domain
        #         gigs.post(gig_entry['title'], gig_entry)
        #
        #     sys.exit(0)

        if args.converge_pk_and_peers:
            print('CONVERGE PEERS')
            d.converge_peers()

        if args.self_test_and_exit:
            # todo impl testing here
            import sys
            from time import sleep

            print('Running ERT ert.py self test ')
            print('.')
            sleep(1)
            print('.')
            sleep(1)
            print('OK')
            tear_down_udp(dht)
            cherrypy.engine.stop()
            sys.exit(0)

        if not args.dht_only:
            main_http(http_webdir=http_webdir,
                      socket_host=socket_host,
                      socket_port=socket_port,
                      ert_profile_ctl=ert_profile_ctl,
                      # ert_profile_view=ert_profile_view,
                      dht_=dht,
                      interactive=args.interactive_shell,
                      dht_facade_=d
                      )
        else:
            from IPython import embed
            embed()

    except Exception as e:
        print('MAIN ERROR')
        cherrypy.engine.stop()
        traceback.print_exc(file=sys.stdout)
