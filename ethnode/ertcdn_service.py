import os
import cherrypy
import argparse
import config
from toolkit import tools
from datamodel.resource_sqlite import ResourceSQLite
from ertcdn.resource_web_service import CdnBinResourceBsonApiCherry
from ertcdn.resource_api_sqlite import CdnBinResourceApiSQlite
from ertcdn.resource_web_service import CdnBinResourceListBsonApiCherry


parser = argparse.ArgumentParser(description='Ethearnal p2p ert web service node')

parser.add_argument('-l', '--http_host_port',
                    default=config.ertcdn_host_port,
                    help='E,g 0.0.0.0:8080',
                    required=False,
                    type=str)

parser.add_argument('-d', '--data_dir',
                    default=config.ertcdn_data_dir,
                    help='Point local profile data directory',
                    required=False,
                    type=str)


class ErtCdnServiceProfile(object):
    def __init__(self,
                 data_dir=config.ertcdn_data_dir,
                 ):
        self.data_dir = tools.mkd(data_dir)
        self.gigs_db = '%s/%s' % (data_dir, 'gigs.db')
        self.imgs_db = '%s/%s' % (data_dir, 'imgs.db')
        self.gigs_data_store = ResourceSQLite(self.gigs_db, 'gigs')
        self.imgs_data_store = ResourceSQLite(self.imgs_db, 'imgs')
        self.gigs_res_api = CdnBinResourceApiSQlite(data_store=self.gigs_data_store)
        self.imgs_res_api = CdnBinResourceApiSQlite(data_store=self.imgs_data_store)

        self.gigs_list = CdnBinResourceListBsonApiCherry(
            cherrypy,
            api=self.gigs_res_api,
            endpoint_path='/api/v1/gigs/',
            mount=True
        )

        self.gigs = CdnBinResourceBsonApiCherry(
            cherrypy,
            api=self.gigs_res_api,
            endpoint_path='/api/v1/gig/',
            mount=True
        )
        self.imgs = CdnBinResourceBsonApiCherry(
            cherrypy,
            endpoint_path='/api/v1/img/',
            api=self.imgs_res_api,
            mount=True,
        )


def main():
    args = parser.parse_args()
    socket_host, socket_port = args.http_host_port.split(':')
    data_dir = args.data_dir
    socket_port = int(socket_port)

    cdn = ErtCdnServiceProfile(data_dir=data_dir)
    print('CDN DATA DR:', cdn.data_dir)
    print('CDN GIGS DB:', cdn.gigs_db)
    print('CDN IMGS DB:', cdn.imgs_db)
    cherrypy.server.socket_host = socket_host
    cherrypy.server.socket_port = socket_port
    cherrypy.engine.start()
    cherrypy.engine.block()


if __name__ == '__main__':
    main()

